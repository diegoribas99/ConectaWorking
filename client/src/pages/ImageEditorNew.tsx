import React, { useState, useRef, useEffect } from 'react';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
// Note: fabricjs-react already imports fabric.js, so we don't need to import it explicitly
import { 
  Image as ImageIcon, 
  Type, 
  Square, 
  Circle, 
  Download, 
  Undo2, 
  Redo2,
  Trash2
} from 'lucide-react';

import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

const ImageEditorNew = () => {
  const { editor, onReady } = useFabricJSEditor();
  const [activeTab, setActiveTab] = useState('elements');
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Cores predefinidas para o editor
  const presetColors = [
    '#000000', '#FFFFFF', '#FFD600', '#FF0000', 
    '#00FF00', '#0000FF', '#FF00FF', '#00FFFF'
  ];

  // Inicialização do canvas
  useEffect(() => {
    if (editor) {
      try {
        // Configurar tamanho
        editor.canvas.setWidth(canvasSize.width);
        editor.canvas.setHeight(canvasSize.height);
        
        // Definir cor de fundo - usar diretamente a propriedade é mais seguro
        // @ts-ignore - ignorar erro de tipo aqui
        editor.canvas.backgroundColor = '#FFFFFF';
        editor.canvas.renderAll();
        
        // Adicionar manipuladores de eventos
        editor.canvas.on('object:modified', () => {
          addToHistory();
        });
        
        // Adicionar estado inicial ao histórico
        addToHistory();
        
        console.log("Canvas inicializado com sucesso!");
      } catch (err) {
        console.error("Erro ao inicializar canvas:", err);
        toast({
          title: "Erro ao inicializar editor",
          description: "Houve um problema ao configurar o editor de imagens.",
          variant: "destructive"
        });
      }
    }
  }, [editor]);
  
  // Função para adicionar ao histórico
  const addToHistory = () => {
    if (editor) {
      try {
        const json = JSON.stringify(editor.canvas.toJSON());
        
        // Truncar o histórico ao índice atual e adicionar o novo estado
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(json);
        
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
      } catch (err) {
        console.error("Erro ao adicionar ao histórico:", err);
      }
    }
  };

  // Adicionar texto
  const addText = () => {
    if (editor) {
      try {
        const text = editor.addText('Texto de exemplo');
        editor.canvas.renderAll();
        addToHistory();
      } catch (err) {
        console.error("Erro ao adicionar texto:", err);
      }
    }
  };

  // Adicionar formas
  const addRectangle = () => {
    if (editor) {
      try {
        const rect = editor.addRect();
        editor.canvas.renderAll();
        addToHistory();
      } catch (err) {
        console.error("Erro ao adicionar retângulo:", err);
      }
    }
  };

  const addCircle = () => {
    if (editor) {
      try {
        const circle = editor.addCircle();
        editor.canvas.renderAll();
        addToHistory();
      } catch (err) {
        console.error("Erro ao adicionar círculo:", err);
      }
    }
  };

  // Upload de imagem
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editor) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          try {
            // addImage é um método seguro do wrapper fabricjs-react
            editor.addImage(event.target.result as string);
            editor.canvas.renderAll();
            addToHistory();
          } catch (err) {
            console.error("Erro ao adicionar imagem:", err);
            toast({
              title: "Erro ao adicionar imagem",
              description: "Ocorreu um erro ao adicionar a imagem. Tente novamente com outra imagem.",
              variant: "destructive"
            });
          }
        }
      };
      
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  // Funções para desfazer/refazer
  const undo = () => {
    if (historyIndex > 0 && editor) {
      try {
        const newIndex = historyIndex - 1;
        const previousState = history[newIndex];
        
        editor.canvas.loadFromJSON(previousState, () => {
          editor.canvas.renderAll();
          setHistoryIndex(newIndex);
        });
      } catch (err) {
        console.error("Erro ao desfazer:", err);
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && editor) {
      try {
        const newIndex = historyIndex + 1;
        const nextState = history[newIndex];
        
        editor.canvas.loadFromJSON(nextState, () => {
          editor.canvas.renderAll();
          setHistoryIndex(newIndex);
        });
      } catch (err) {
        console.error("Erro ao refazer:", err);
      }
    }
  };

  // Excluir objeto selecionado
  const deleteSelected = () => {
    if (editor) {
      try {
        const activeObject = editor.canvas.getActiveObject();
        if (activeObject) {
          editor.canvas.remove(activeObject);
          editor.canvas.renderAll();
          addToHistory();
        }
      } catch (err) {
        console.error("Erro ao excluir objeto:", err);
      }
    }
  };

  // Exportar como imagem
  const exportAsImage = () => {
    if (editor) {
      try {
        const dataURL = editor.canvas.toDataURL({
          format: 'png',
          quality: 1
        });
        
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = 'conectaworking-design.png';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: "Exportação concluída",
          description: "Imagem exportada com sucesso!"
        });
      } catch (err) {
        console.error("Erro ao exportar imagem:", err);
      }
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Editor de Imagens</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={undo} disabled={historyIndex <= 0}>
              <Undo2 className="mr-2 h-4 w-4" />
              Desfazer
            </Button>
            <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
              <Redo2 className="mr-2 h-4 w-4" />
              Refazer
            </Button>
            <Button onClick={exportAsImage}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Barra lateral de ferramentas */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="elements">Elementos</TabsTrigger>
                    <TabsTrigger value="properties">Propriedades</TabsTrigger>
                  </TabsList>
                  
                  {/* Elementos para adicionar */}
                  <TabsContent value="elements" className="space-y-4">
                    <h3 className="text-lg font-medium">Adicionar Elementos</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={addText} variant="outline" className="h-24 flex-col space-y-2">
                        <Type className="h-8 w-8" />
                        <span>Texto</span>
                      </Button>
                      <Button onClick={addRectangle} variant="outline" className="h-24 flex-col space-y-2">
                        <Square className="h-8 w-8" />
                        <span>Retângulo</span>
                      </Button>
                      <Button onClick={addCircle} variant="outline" className="h-24 flex-col space-y-2">
                        <Circle className="h-8 w-8" />
                        <span>Círculo</span>
                      </Button>
                      <div className="relative h-24">
                        <Button 
                          variant="outline" 
                          className="h-24 w-full flex-col space-y-2"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-8 w-8" />
                          <span>Imagem</span>
                        </Button>
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Propriedades do objeto selecionado */}
                  <TabsContent value="properties" className="space-y-4">
                    <div className="flex justify-between">
                      <h3 className="text-lg font-medium">Propriedades</h3>
                      <Button size="sm" variant="ghost" onClick={deleteSelected}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Tamanho do Canvas</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label htmlFor="width">Largura</Label>
                          <Input 
                            id="width" 
                            type="number" 
                            value={canvasSize.width} 
                            onChange={e => {
                              const newWidth = parseInt(e.target.value);
                              if (newWidth > 0) {
                                setCanvasSize(prev => ({ ...prev, width: newWidth }));
                                if (editor) {
                                  editor.canvas.setWidth(newWidth);
                                  editor.canvas.renderAll();
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Altura</Label>
                          <Input 
                            id="height" 
                            type="number" 
                            value={canvasSize.height} 
                            onChange={e => {
                              const newHeight = parseInt(e.target.value);
                              if (newHeight > 0) {
                                setCanvasSize(prev => ({ ...prev, height: newHeight }));
                                if (editor) {
                                  editor.canvas.setHeight(newHeight);
                                  editor.canvas.renderAll();
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Canvas de edição */}
          <div className="lg:col-span-3">
            <Card className="w-full h-[600px] overflow-auto">
              <CardContent className="p-0 flex items-center justify-center h-full">
                <div className="canvas-container relative">
                  <FabricJSCanvas className="canvas" onReady={onReady} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ImageEditorNew;