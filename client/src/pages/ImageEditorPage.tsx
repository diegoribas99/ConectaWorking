import React, { useState, useEffect, useRef } from 'react';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { 
  Image as ImageIcon, 
  Type, 
  Undo2, 
  Redo2, 
  Square, 
  Circle, 
  Scissors, 
  Download, 
  BringToFront, 
  SendToBack,
  Layers,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  SaveAll,
  Palette,
  Minimize2,
  Maximize2
} from 'lucide-react';

import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';

// Templates predefinidos para o editor
const templates = [
  { 
    name: 'Apresentação de Projeto', 
    width: 1920, 
    height: 1080,
    background: '#FFFFFF' 
  },
  { 
    name: 'Instagram', 
    width: 1080, 
    height: 1080,
    background: '#FFFFFF' 
  },
  { 
    name: 'Moodboard', 
    width: 2000, 
    height: 1500,
    background: '#F8F8F8' 
  },
  { 
    name: 'Banner para Site', 
    width: 1200, 
    height: 630,
    background: '#EFEFEF' 
  },
  { 
    name: 'Cartão de Visita', 
    width: 1050, 
    height: 600,
    background: '#FFFFFF' 
  }
];

// Cores predefinidas para uso no editor
const presetColors = [
  '#000000', '#FFFFFF', '#F5F5F5', '#FFD600', '#FFA500', 
  '#FF4D4D', '#4CAF50', '#2196F3', '#9C27B0', '#795548'
];

// Fontes disponíveis
const fontOptions = [
  'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 
  'Georgia', 'Trebuchet MS', 'Verdana', 'Impact'
];

// Componente principal do editor de imagem
const ImageEditorPage: React.FC = () => {
  // Uso do hook do fabricjs-react
  const { editor, onReady } = useFabricJSEditor();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Estados para controle do editor
  const [activeTab, setActiveTab] = useState('elements');
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 800 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Estados para configuração de formas e textos
  const [textOptions, setTextOptions] = useState({
    text: 'Texto de exemplo',
    fontSize: 30,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    fontStyle: 'normal',
    textAlign: 'left',
    color: '#000000',
    backgroundColor: '',
    underline: false
  });
  
  const [shapeOptions, setShapeOptions] = useState({
    fill: '#FFD600',
    stroke: '#000000',
    strokeWidth: 1,
    opacity: 1
  });

  // Inicialização e configuração do canvas
  useEffect(() => {
    if (editor) {
      // Configurar tamanho do canvas
      editor.canvas.setWidth(canvasSize.width);
      editor.canvas.setHeight(canvasSize.height);
      
      // Definir cor de fundo (o método é diferente do Fabric.js padrão)
      editor.canvas.backgroundColor = '#FFFFFF';
      editor.canvas.renderAll();
      
      // Adicionar manipuladores de eventos
      editor.canvas.on('object:modified', handleCanvasModified);
      editor.canvas.on('selection:created', handleSelectionCreated);
      editor.canvas.on('selection:updated', handleSelectionCreated);
      editor.canvas.on('selection:cleared', handleSelectionCleared);
      
      // Adicionar estado inicial ao histórico
      addToHistory();
      
      // Limpar manipuladores de eventos quando o componente é desmontado
      return () => {
        editor.canvas.off('object:modified', handleCanvasModified);
        editor.canvas.off('selection:created', handleSelectionCreated);
        editor.canvas.off('selection:updated', handleSelectionCreated);
        editor.canvas.off('selection:cleared', handleSelectionCleared);
      };
    }
  }, [editor]);

  // Ajustar o canvas quando o tamanho muda
  useEffect(() => {
    if (editor) {
      editor.canvas.setWidth(canvasSize.width);
      editor.canvas.setHeight(canvasSize.height);
      
      // Ajustar zoom
      const containerWidth = canvasRef.current?.clientWidth || canvasSize.width;
      const scale = Math.min(1, containerWidth / canvasSize.width);
      setZoomLevel(scale);
      
      editor.canvas.setZoom(scale);
      editor.canvas.renderAll();
    }
  }, [canvasSize, editor]);

  // Manipulador para adicionar ao histórico
  const addToHistory = () => {
    if (editor) {
      const json = JSON.stringify(editor.canvas.toJSON(['selectable', 'hasControls']));
      
      // Truncar o histórico ao índice atual e adicionar o novo estado
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(json);
      
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };

  const handleCanvasModified = () => {
    addToHistory();
  };

  // Manipuladores de seleção
  const handleSelectionCreated = (e: any) => {
    const selectedObject = editor?.canvas.getActiveObject();
    
    if (selectedObject) {
      // Se for um objeto de texto
      if (selectedObject.type === 'text' || selectedObject.type === 'i-text') {
        const textObj = selectedObject as fabric.IText;
        setTextOptions({
          text: textObj.text || 'Texto de exemplo',
          fontSize: textObj.fontSize || 30,
          fontFamily: textObj.fontFamily || 'Arial',
          fontWeight: textObj.fontWeight || 'normal',
          fontStyle: textObj.fontStyle || 'normal',
          textAlign: textObj.textAlign || 'left',
          color: textObj.fill?.toString() || '#000000',
          backgroundColor: textObj.backgroundColor?.toString() || '',
          underline: textObj.underline || false
        });
        
        setActiveTab('text');
      } 
      // Se for uma forma
      else if (selectedObject.type === 'rect' || selectedObject.type === 'circle') {
        setShapeOptions({
          fill: selectedObject.fill?.toString() || '#FFD600',
          stroke: selectedObject.stroke?.toString() || '#000000',
          strokeWidth: selectedObject.strokeWidth || 1,
          opacity: selectedObject.opacity || 1
        });
        
        setActiveTab('shapes');
      }
    }
  };

  const handleSelectionCleared = () => {
    // Resetar quando nenhum objeto está selecionado
  };

  // Funções de adicionar elementos
  const addText = () => {
    if (editor) {
      editor.addText('Texto de exemplo');
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        activeObject.set({
          left: 100,
          top: 100,
          fontSize: 30,
          fontFamily: 'Arial',
          fill: '#000000'
        });
      }
      
      editor.canvas.renderAll();
      setActiveTab('text');
      addToHistory();
    }
  };

  const addRectangle = () => {
    if (editor) {
      editor.addRect();
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        activeObject.set({
          left: 100,
          top: 100,
          width: 150,
          height: 100,
          fill: shapeOptions.fill,
          stroke: shapeOptions.stroke,
          strokeWidth: shapeOptions.strokeWidth,
          opacity: shapeOptions.opacity
        });
      }
      
      editor.canvas.renderAll();
      setActiveTab('shapes');
      addToHistory();
    }
  };

  const addCircle = () => {
    if (editor) {
      editor.addCircle();
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        activeObject.set({
          left: 100,
          top: 100,
          radius: 75,
          fill: shapeOptions.fill,
          stroke: shapeOptions.stroke,
          strokeWidth: shapeOptions.strokeWidth,
          opacity: shapeOptions.opacity
        });
      }
      
      editor.canvas.renderAll();
      setActiveTab('shapes');
      addToHistory();
    }
  };

  // Manipulação de imagens
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && editor) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const imgObj = new Image();
        imgObj.src = event.target?.result as string;
        
        imgObj.onload = () => {
          const image = new fabric.Image(imgObj);
          
          // Redimensionar para caber no canvas
          const scale = Math.min(
            (canvasSize.width * 0.8) / image.width!,
            (canvasSize.height * 0.8) / image.height!
          );
          
          image.scale(scale);
          image.set({ left: 100, top: 100 });
          
          editor.canvas.add(image);
          editor.canvas.setActiveObject(image);
          editor.canvas.renderAll();
          
          addToHistory();
        };
      };
      
      reader.readAsDataURL(file);
      
      // Limpar o input para permitir selecionar a mesma imagem novamente
      e.target.value = '';
    }
  };

  // Funções para desfazer/refazer
  const undo = () => {
    if (historyIndex > 0 && editor) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      editor.canvas.loadFromJSON(previousState, () => {
        editor.canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1 && editor) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      editor.canvas.loadFromJSON(nextState, () => {
        editor.canvas.renderAll();
        setHistoryIndex(newIndex);
      });
    }
  };

  // Manipulação de camadas
  const bringToFront = () => {
    if (editor) {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        activeObject.bringToFront();
        editor.canvas.renderAll();
        addToHistory();
      }
    }
  };

  const sendToBack = () => {
    if (editor) {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        activeObject.sendToBack();
        editor.canvas.renderAll();
        addToHistory();
      }
    }
  };

  const deleteSelected = () => {
    if (editor) {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject) {
        editor.canvas.remove(activeObject);
        editor.canvas.renderAll();
        addToHistory();
      }
    }
  };

  // Seleção de template
  const selectTemplate = (template: typeof templates[0]) => {
    if (editor) {
      // Atualizar dimensões
      setCanvasSize({
        width: template.width,
        height: template.height
      });
      
      // Definir cor de fundo (o método é diferente do Fabric.js padrão)
      editor.canvas.backgroundColor = template.background;
      editor.canvas.renderAll();
      
      // Limpar objetos
      editor.canvas.clear();
      
      // Resetar histórico
      setHistory([]);
      setHistoryIndex(-1);
      
      // Adicionar o estado inicial ao histórico
      setTimeout(() => {
        addToHistory();
      }, 100);
      
      toast({
        title: "Template aplicado",
        description: `${template.name} aplicado com sucesso.`
      });
    }
  };

  // Atualizar propriedades de texto
  const updateTextProperties = (property: string, value: any) => {
    if (editor) {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject && (activeObject.type === 'text' || activeObject.type === 'i-text')) {
        const textObj = activeObject as fabric.IText;
        
        // Atualizar a propriedade no objeto
        switch (property) {
          case 'text':
            textObj.set('text', value);
            break;
          case 'fontSize':
            textObj.set('fontSize', value);
            break;
          case 'fontFamily':
            textObj.set('fontFamily', value);
            break;
          case 'fontWeight':
            textObj.set('fontWeight', value === 'bold' ? 'bold' : 'normal');
            break;
          case 'fontStyle':
            textObj.set('fontStyle', value === 'italic' ? 'italic' : 'normal');
            break;
          case 'underline':
            textObj.set('underline', value);
            break;
          case 'textAlign':
            textObj.set('textAlign', value);
            break;
          case 'color':
            textObj.set('fill', value);
            break;
          case 'backgroundColor':
            textObj.set('backgroundColor', value);
            break;
        }
        
        // Atualizar estado
        setTextOptions(prev => ({ ...prev, [property]: value }));
        
        // Renderizar canvas
        editor.canvas.renderAll();
        addToHistory();
      }
    }
  };

  // Atualizar propriedades de forma
  const updateShapeProperties = (property: string, value: any) => {
    if (editor) {
      const activeObject = editor.canvas.getActiveObject();
      if (activeObject && (activeObject.type === 'rect' || activeObject.type === 'circle')) {
        // Atualizar a propriedade no objeto
        switch (property) {
          case 'fill':
            activeObject.set('fill', value);
            break;
          case 'stroke':
            activeObject.set('stroke', value);
            break;
          case 'strokeWidth':
            activeObject.set('strokeWidth', value);
            break;
          case 'opacity':
            activeObject.set('opacity', value);
            break;
        }
        
        // Atualizar estado
        setShapeOptions(prev => ({ ...prev, [property]: value }));
        
        // Renderizar canvas
        editor.canvas.renderAll();
        addToHistory();
      }
    }
  };

  // Exportar canvas como imagem
  const exportAsImage = () => {
    if (editor) {
      // Salvar as dimensões originais e zoom
      const originalWidth = canvasSize.width;
      const originalHeight = canvasSize.height;
      const currentZoom = zoomLevel;
      
      // Definir zoom para 1 para exportação
      editor.canvas.setZoom(1);
      editor.canvas.setWidth(originalWidth);
      editor.canvas.setHeight(originalHeight);
      
      // Gerar URL da imagem
      const dataURL = editor.canvas.toDataURL({
        format: 'png',
        quality: 1
      });
      
      // Criar link para download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'conectaworking-design.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Restaurar o zoom
      editor.canvas.setZoom(currentZoom);
      
      // Atualizar dimensões para compensar pela diferença de zoom
      const scale = Math.min(
        (canvasRef.current?.clientWidth || originalWidth) / originalWidth,
        (canvasRef.current?.clientHeight || originalHeight) / originalHeight
      );
      
      editor.canvas.setWidth(originalWidth * scale);
      editor.canvas.setHeight(originalHeight * scale);
      editor.canvas.renderAll();
      
      toast({
        title: "Exportação concluída",
        description: "Imagem exportada com sucesso!"
      });
    }
  };

  // Toggle modo tela cheia
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Componente de renderização
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
            <Button variant="outline" onClick={toggleFullscreen}>
              {isFullscreen ? 
                <Minimize2 className="h-4 w-4" /> : 
                <Maximize2 className="h-4 w-4" />
              }
            </Button>
          </div>
        </div>

        <div className={`grid grid-cols-1 lg:grid-cols-4 gap-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-4' : ''}`}>
          {/* Barra lateral de ferramentas */}
          <div className={`lg:col-span-1 ${isFullscreen ? 'hidden lg:block' : ''}`}>
            <Card>
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="templates">Modelos</TabsTrigger>
                    <TabsTrigger value="elements">Elementos</TabsTrigger>
                    <TabsTrigger value="properties">Propriedades</TabsTrigger>
                  </TabsList>
                  
                  {/* Templates */}
                  <TabsContent value="templates" className="space-y-4">
                    <h3 className="text-lg font-medium">Tamanhos Predefinidos</h3>
                    <div className="space-y-2">
                      {templates.map((template, index) => (
                        <Button 
                          key={index} 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => selectTemplate(template)}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 mr-2 border rounded flex items-center justify-center text-xs">
                              {template.width}x{template.height}
                            </div>
                            <span>{template.name}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-medium">Tamanho personalizado</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="width">Largura (px)</Label>
                          <Input 
                            id="width" 
                            type="number" 
                            value={canvasSize.width} 
                            onChange={e => setCanvasSize(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="height">Altura (px)</Label>
                          <Input 
                            id="height" 
                            type="number" 
                            value={canvasSize.height} 
                            onChange={e => setCanvasSize(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                          />
                        </div>
                      </div>
                      <Button 
                        className="w-full"
                        variant="outline"
                        onClick={() => {
                          if (editor) {
                            // Definir cor de fundo (método adequado para o fabricjs-react)
                            editor.canvas.backgroundColor = '#FFFFFF';
                            editor.canvas.renderAll();
                            addToHistory();
                          }
                        }}
                      >
                        Aplicar Tamanho Personalizado
                      </Button>
                    </div>
                  </TabsContent>
                  
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
                    
                    <div className="mt-6 space-y-4">
                      <h3 className="text-lg font-medium">Configurações da Tela</h3>
                      <div className="space-y-2">
                        <Label>Cor de Fundo</Label>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {presetColors.map((color, index) => (
                            <button
                              key={index}
                              type="button"
                              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center cursor-pointer"
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                if (editor) {
                                  editor.canvas.backgroundColor = color;
                                  editor.canvas.renderAll();
                                  addToHistory();
                                }
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  {/* Propriedades do objeto selecionado */}
                  <TabsContent value="properties" className="space-y-4">
                    {editor?.canvas.getActiveObject() ? (
                      <>
                        <div className="flex justify-between">
                          <h3 className="text-lg font-medium">Propriedades</h3>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="ghost" onClick={bringToFront}>
                              <BringToFront className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={sendToBack}>
                              <SendToBack className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={deleteSelected}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Propriedades de texto */}
                        {editor?.canvas.getActiveObject()?.type === 'i-text' && (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="text-content">Texto</Label>
                              <Input
                                id="text-content"
                                value={textOptions.text}
                                onChange={e => updateTextProperties('text', e.target.value)}
                              />
                            </div>
                            
                            <div>
                              <Label htmlFor="font-family">Fonte</Label>
                              <Select
                                value={textOptions.fontFamily}
                                onValueChange={value => updateTextProperties('fontFamily', value)}
                              >
                                <SelectTrigger id="font-family">
                                  <SelectValue placeholder="Selecione uma fonte" />
                                </SelectTrigger>
                                <SelectContent>
                                  {fontOptions.map(font => (
                                    <SelectItem key={font} value={font}>
                                      <span style={{ fontFamily: font }}>{font}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="font-size">Tamanho da Fonte</Label>
                              <div className="flex items-center space-x-2">
                                <Slider
                                  id="font-size"
                                  value={[textOptions.fontSize]}
                                  min={10}
                                  max={100}
                                  step={1}
                                  onValueChange={([value]) => updateTextProperties('fontSize', value)}
                                />
                                <span className="w-12 text-center">{textOptions.fontSize}px</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Estilo do Texto</Label>
                              <div className="flex space-x-1 mt-1">
                                <Button
                                  size="sm"
                                  variant={textOptions.fontWeight === 'bold' ? 'default' : 'outline'}
                                  onClick={() => updateTextProperties('fontWeight', textOptions.fontWeight === 'bold' ? 'normal' : 'bold')}
                                >
                                  <Bold className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={textOptions.fontStyle === 'italic' ? 'default' : 'outline'}
                                  onClick={() => updateTextProperties('fontStyle', textOptions.fontStyle === 'italic' ? 'normal' : 'italic')}
                                >
                                  <Italic className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={textOptions.underline ? 'default' : 'outline'}
                                  onClick={() => updateTextProperties('underline', !textOptions.underline)}
                                >
                                  <Underline className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Alinhamento</Label>
                              <div className="flex space-x-1 mt-1">
                                <Button
                                  size="sm"
                                  variant={textOptions.textAlign === 'left' ? 'default' : 'outline'}
                                  onClick={() => updateTextProperties('textAlign', 'left')}
                                >
                                  <AlignLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={textOptions.textAlign === 'center' ? 'default' : 'outline'}
                                  onClick={() => updateTextProperties('textAlign', 'center')}
                                >
                                  <AlignCenter className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={textOptions.textAlign === 'right' ? 'default' : 'outline'}
                                  onClick={() => updateTextProperties('textAlign', 'right')}
                                >
                                  <AlignRight className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <Label>Cor do Texto</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {presetColors.map((color, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                                      textOptions.color === color ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateTextProperties('color', color)}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label>Cor de Fundo do Texto</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <button
                                  type="button"
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                                    !textOptions.backgroundColor ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: 'white' }}
                                  onClick={() => updateTextProperties('backgroundColor', '')}
                                >
                                  <Scissors className="h-4 w-4 text-gray-400" />
                                </button>
                                {presetColors.map((color, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                                      textOptions.backgroundColor === color ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateTextProperties('backgroundColor', color)}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Propriedades de formas */}
                        {(editor?.canvas.getActiveObject()?.type === 'rect' || editor?.canvas.getActiveObject()?.type === 'circle') && (
                          <div className="space-y-4">
                            <div>
                              <Label>Cor de Preenchimento</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {presetColors.map((color, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                                      shapeOptions.fill === color ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateShapeProperties('fill', color)}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label>Cor da Borda</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <button
                                  type="button"
                                  className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                                    !shapeOptions.stroke ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                                  }`}
                                  style={{ backgroundColor: 'white' }}
                                  onClick={() => updateShapeProperties('stroke', '')}
                                >
                                  <Scissors className="h-4 w-4 text-gray-400" />
                                </button>
                                {presetColors.map((color, index) => (
                                  <button
                                    key={index}
                                    type="button"
                                    className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                                      shapeOptions.stroke === color ? 'ring-2 ring-primary ring-offset-2' : 'border-gray-300'
                                    }`}
                                    style={{ backgroundColor: color }}
                                    onClick={() => updateShapeProperties('stroke', color)}
                                  />
                                ))}
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="stroke-width">Largura da Borda</Label>
                              <div className="flex items-center space-x-2">
                                <Slider
                                  id="stroke-width"
                                  value={[shapeOptions.strokeWidth]}
                                  min={0}
                                  max={20}
                                  step={1}
                                  onValueChange={([value]) => updateShapeProperties('strokeWidth', value)}
                                />
                                <span className="w-12 text-center">{shapeOptions.strokeWidth}px</span>
                              </div>
                            </div>
                            
                            <div>
                              <Label htmlFor="opacity">Opacidade</Label>
                              <div className="flex items-center space-x-2">
                                <Slider
                                  id="opacity"
                                  value={[shapeOptions.opacity * 100]}
                                  min={0}
                                  max={100}
                                  step={1}
                                  onValueChange={([value]) => updateShapeProperties('opacity', value / 100)}
                                />
                                <span className="w-12 text-center">{Math.round(shapeOptions.opacity * 100)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          Selecione um elemento para editar suas propriedades
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          {/* Área do canvas */}
          <div className={`lg:col-span-3 ${isFullscreen ? 'col-span-full' : ''}`}>
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  ref={canvasRef}
                  className="w-full overflow-auto bg-gray-50 dark:bg-gray-900 relative"
                  style={{ height: isFullscreen ? 'calc(100vh - 120px)' : 'calc(100vh - 200px)', minHeight: '600px' }}
                >
                  <FabricJSCanvas onReady={onReady} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ImageEditorPage;