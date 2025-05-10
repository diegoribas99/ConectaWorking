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
        // Aplicar estilo ao texto
        if (text) {
          // @ts-ignore - ignorar erros de tipo aqui
          text.set({
            fontFamily: 'Arial',
            fill: '#000000',
            fontSize: 24,
            left: canvasSize.width / 2,
            top: canvasSize.height / 2,
            originX: 'center',
            originY: 'center'
          });
        }
        editor.canvas.renderAll();
        addToHistory();
      } catch (err) {
        console.error("Erro ao adicionar texto:", err);
        toast({
          title: "Erro ao adicionar texto",
          description: "Ocorreu um erro ao adicionar o texto. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  // Adicionar formas
  const addRectangle = () => {
    if (editor) {
      try {
        const rect = editor.addRect();
        // Aplicar estilo e posição ao retângulo
        if (rect) {
          // @ts-ignore - ignorar erros de tipo aqui
          rect.set({
            width: 120,
            height: 80,
            fill: 'rgba(255, 214, 0, 0.7)',
            stroke: '#000000',
            strokeWidth: 1,
            left: canvasSize.width / 2,
            top: canvasSize.height / 2,
            originX: 'center',
            originY: 'center',
            rx: 5, // cantos arredondados
            ry: 5  // cantos arredondados
          });
        }
        editor.canvas.renderAll();
        addToHistory();
      } catch (err) {
        console.error("Erro ao adicionar retângulo:", err);
        toast({
          title: "Erro ao adicionar forma",
          description: "Ocorreu um erro ao adicionar o retângulo. Tente novamente.",
          variant: "destructive"
        });
      }
    }
  };

  const addCircle = () => {
    if (editor) {
      try {
        const circle = editor.addCircle();
        // Aplicar estilo e posição ao círculo
        if (circle) {
          // @ts-ignore - ignorar erros de tipo aqui
          circle.set({
            radius: 50,
            fill: 'rgba(255, 214, 0, 0.7)',
            stroke: '#000000',
            strokeWidth: 1,
            left: canvasSize.width / 2,
            top: canvasSize.height / 2,
            originX: 'center',
            originY: 'center'
          });
        }
        editor.canvas.renderAll();
        addToHistory();
      } catch (err) {
        console.error("Erro ao adicionar círculo:", err);
        toast({
          title: "Erro ao adicionar forma",
          description: "Ocorreu um erro ao adicionar o círculo. Tente novamente.",
          variant: "destructive"
        });
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
          toast({
            title: "Ação desfeita",
            description: "A última alteração foi desfeita com sucesso.",
            duration: 2000
          });
        });
      } catch (err) {
        console.error("Erro ao desfazer:", err);
        toast({
          title: "Erro ao desfazer",
          description: "Não foi possível desfazer a última ação.",
          variant: "destructive"
        });
      }
    } else if (historyIndex === 0) {
      toast({
        title: "Não é possível desfazer",
        description: "Você já está no início do histórico de edições.",
        duration: 2000
      });
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
          toast({
            title: "Ação refeita",
            description: "A alteração foi refeita com sucesso.",
            duration: 2000
          });
        });
      } catch (err) {
        console.error("Erro ao refazer:", err);
        toast({
          title: "Erro ao refazer",
          description: "Não foi possível refazer a ação.",
          variant: "destructive"
        });
      }
    } else if (historyIndex === history.length - 1) {
      toast({
        title: "Não é possível refazer",
        description: "Você já está no final do histórico de edições.",
        duration: 2000
      });
    }
  };

  // Excluir objeto selecionado
  const deleteSelected = () => {
    if (editor) {
      try {
        const activeObject = editor.canvas.getActiveObject();
        if (activeObject) {
          // Suporta seleção múltipla
          if (activeObject.type === 'activeSelection') {
            // @ts-ignore - ignorar erro de tipo aqui
            const items = activeObject._objects;
            // Remover cada objeto na seleção ativa
            activeObject.forEachObject((obj: any) => {
              editor.canvas.remove(obj);
            });
            // Limpar seleção
            editor.canvas.discardActiveObject();
            toast({
              title: "Itens excluídos",
              description: `${items.length} itens foram excluídos.`,
              duration: 2000
            });
          } else {
            // Remover objeto único
            editor.canvas.remove(activeObject);
            toast({
              title: "Item excluído",
              description: "O objeto selecionado foi excluído.",
              duration: 2000
            });
          }
          
          editor.canvas.renderAll();
          addToHistory();
        } else {
          toast({
            title: "Nenhum item selecionado",
            description: "Selecione um objeto para excluir.",
            duration: 2000
          });
        }
      } catch (err) {
        console.error("Erro ao excluir objeto:", err);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o item selecionado.",
          variant: "destructive"
        });
      }
    }
  };

  // Exportar como imagem
  const exportAsImage = (format: 'png' | 'jpeg' = 'png') => {
    if (editor) {
      try {
        // Preparar o canvas para exportação
        editor.canvas.discardActiveObject();
        editor.canvas.renderAll();
        
        // Definir qualidade com base no formato
        const quality = format === 'jpeg' ? 0.95 : 1;
        
        // Gerar URL de dados
        const dataURL = editor.canvas.toDataURL({
          format: format,
          quality: quality,
          multiplier: 2 // Melhor qualidade para impressão
        });
        
        // Definir nome de arquivo com data atual
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
        const filename = `conectaworking-design-${timestamp}.${format}`;
        
        // Criar e acionar o link de download
        const link = document.createElement('a');
        link.href = dataURL;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Notificar usuário
        toast({
          title: "Exportação concluída",
          description: `Imagem exportada como ${format.toUpperCase()} com sucesso!`,
          duration: 3000
        });
      } catch (err) {
        console.error("Erro ao exportar imagem:", err);
        toast({
          title: "Erro na exportação",
          description: "Não foi possível exportar a imagem. Tente novamente.",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Editor não disponível",
        description: "O editor não está pronto. Aguarde o carregamento completo.",
        variant: "destructive"
      });
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Editor de Imagens</h1>
            <div className="flex flex-wrap space-x-2">
              <Button variant="outline" onClick={undo} disabled={historyIndex <= 0}>
                <Undo2 className="mr-2 h-4 w-4" />
                Desfazer
              </Button>
              <Button variant="outline" onClick={redo} disabled={historyIndex >= history.length - 1}>
                <Redo2 className="mr-2 h-4 w-4" />
                Refazer
              </Button>
              <Button 
                variant="destructive" 
                onClick={deleteSelected}
                className="mr-2"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
              
              <div className="relative inline-block">
                <Button onClick={() => exportAsImage('png')}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar PNG
                </Button>
                <Button 
                  onClick={() => exportAsImage('jpeg')}
                  variant="outline"
                  className="ml-2"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Exportar JPEG
                </Button>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg mb-4 text-sm">
            <h3 className="font-semibold mb-2">Como usar o editor</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Clique nos elementos na aba <strong>Elementos</strong> para adicionar ao canvas</li>
              <li>Selecione qualquer objeto para editá-lo ou excluí-lo</li>
              <li>Use <strong>Desfazer</strong> e <strong>Refazer</strong> para gerenciar alterações</li>
              <li>Altere o tamanho do canvas nas <strong>Propriedades</strong></li>
              <li>Clique em <strong>Exportar PNG</strong> ou <strong>Exportar JPEG</strong> para baixar sua criação</li>
            </ul>
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