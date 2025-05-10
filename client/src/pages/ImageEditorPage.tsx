import React, { useState, useEffect, useRef } from 'react';
import { FabricJSCanvas, useFabricJSEditor } from 'fabricjs-react';
import { 
  Image, 
  Text, 
  Undo2, 
  Redo2, 
  Square, 
  Circle, 
  Type, 
  Scissors, 
  Download, 
  Move, 
  BringToFront, 
  SendToBack,
  Layers,
  PaintBucket,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Upload,
  Save,
  Plus,
  ImagePlus,
  Palette
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { toast } from '@/hooks/use-toast';

// Definir templates predefinidos
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

// Cores predefinidas
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
  // Referência para o canvas e elemento container
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Estado para armazenar histórico de ações para desfazer/refazer
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados para configuração e controle do editor
  const [activeTab, setActiveTab] = useState('elements');
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
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
  const [canvasSize, setCanvasSize] = useState({
    width: 1200,
    height: 800
  });

  // Inicializar o canvas quando o componente for montado
  useEffect(() => {
    if (canvasContainerRef.current) {
      const canvasContainer = canvasContainerRef.current;
      
      // Criar o canvas do Fabric.js
      const canvas = new fabric.Canvas('canvas', {
        width: canvasSize.width,
        height: canvasSize.height,
        backgroundColor: '#FFFFFF'
      });
      
      canvasRef.current = canvas;
      
      // Adicionar ouvinte de eventos para seleção
      canvas.on('selection:created', handleSelectionCreated);
      canvas.on('selection:updated', handleSelectionCreated);
      canvas.on('selection:cleared', handleSelectionCleared);
      
      // Adicionar ouvinte para mudanças no canvas
      canvas.on('object:modified', handleCanvasModified);
      
      // Adicionar o primeiro item no histórico (estado inicial)
      addToHistory();
      
      // Redimensionar canvas quando a janela for redimensionada
      const handleResize = () => {
        resizeCanvas();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Limpar listeners quando o componente for desmontado
      return () => {
        canvas.off('selection:created', handleSelectionCreated);
        canvas.off('selection:updated', handleSelectionCreated);
        canvas.off('selection:cleared', handleSelectionCleared);
        canvas.off('object:modified', handleCanvasModified);
        window.removeEventListener('resize', handleResize);
        canvas.dispose();
      };
    }
  }, []);

  // Efeito para ajustar o canvas quando seu tamanho mudar
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.setWidth(canvasSize.width);
      canvasRef.current.setHeight(canvasSize.height);
      resizeCanvas();
    }
  }, [canvasSize.width, canvasSize.height]);

  // Função para redimensionar o canvas para caber no container
  const resizeCanvas = () => {
    if (canvasRef.current && canvasContainerRef.current) {
      const canvas = canvasRef.current;
      const container = canvasContainerRef.current;
      
      // Calcular o fator de escala para ajustar o canvas ao container
      const containerWidth = container.clientWidth;
      const scale = containerWidth / canvasSize.width;
      
      // Definir o zoom do canvas
      canvas.setZoom(scale);
      canvas.setWidth(canvasSize.width * scale);
      canvas.setHeight(canvasSize.height * scale);
      
      // Renderizar novamente o canvas
      canvas.renderAll();
    }
  };

  // Selecionar um template predefinido
  const selectTemplate = (template: typeof templates[0]) => {
    if (canvasRef.current) {
      // Atualizar as dimensões do canvas
      setCanvasSize({
        width: template.width,
        height: template.height
      });
      
      // Definir a cor de fundo
      canvasRef.current.setBackgroundColor(template.background, () => {
        canvasRef.current?.renderAll();
      });
      
      // Limpar o canvas de objetos
      canvasRef.current.clear();
      
      // Resetar histórico
      setHistory([]);
      setHistoryIndex(-1);
      
      // Adicionar estado inicial ao histórico
      addToHistory();
      
      toast({
        title: "Template aplicado",
        description: `${template.name} aplicado com sucesso.`
      });
    }
  };

  // Manipuladores de eventos de seleção
  const handleSelectionCreated = (e: fabric.IEvent) => {
    const selectedObjects = e.selected;
    if (selectedObjects && selectedObjects.length > 0) {
      const obj = selectedObjects[0];
      setSelectedObject(obj);
      
      // Atualizar opções de texto se for um objeto de texto
      if (obj.type === 'text' || obj.type === 'i-text') {
        const textObj = obj as fabric.IText;
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
      // Atualizar opções de forma se for uma forma
      else if (obj.type === 'rect' || obj.type === 'circle') {
        setShapeOptions({
          fill: obj.fill?.toString() || '#FFD600',
          stroke: obj.stroke?.toString() || '#000000',
          strokeWidth: obj.strokeWidth || 1,
          opacity: obj.opacity || 1
        });
        
        setActiveTab('shapes');
      }
    }
  };

  const handleSelectionCleared = () => {
    setSelectedObject(null);
  };

  // Gerar estado do canvas e adicioná-lo ao histórico
  const addToHistory = () => {
    if (canvasRef.current) {
      const json = JSON.stringify(canvasRef.current.toJSON(['selectable', 'hasControls']));
      
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

  // Funções de desfazer/refazer
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      if (canvasRef.current && previousState) {
        canvasRef.current.loadFromJSON(previousState, () => {
          canvasRef.current?.renderAll();
          setHistoryIndex(newIndex);
        });
      }
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      if (canvasRef.current && nextState) {
        canvasRef.current.loadFromJSON(nextState, () => {
          canvasRef.current?.renderAll();
          setHistoryIndex(newIndex);
        });
      }
    }
  };

  // Adicionar elementos ao canvas
  const addText = () => {
    if (canvasRef.current) {
      const text = new fabric.IText('Texto de exemplo', {
        left: 100,
        top: 100,
        fontSize: 30,
        fontFamily: 'Arial',
        fill: '#000000'
      });
      
      canvasRef.current.add(text);
      canvasRef.current.setActiveObject(text);
      canvasRef.current.renderAll();
      
      handleSelectionCreated({ selected: [text] } as fabric.IEvent);
      addToHistory();
    }
  };

  const addRectangle = () => {
    if (canvasRef.current) {
      const rect = new fabric.Rect({
        left: 100,
        top: 100,
        width: 150,
        height: 100,
        fill: shapeOptions.fill,
        stroke: shapeOptions.stroke,
        strokeWidth: shapeOptions.strokeWidth,
        opacity: shapeOptions.opacity
      });
      
      canvasRef.current.add(rect);
      canvasRef.current.setActiveObject(rect);
      canvasRef.current.renderAll();
      
      addToHistory();
    }
  };

  const addCircle = () => {
    if (canvasRef.current) {
      const circle = new fabric.Circle({
        left: 100,
        top: 100,
        radius: 75,
        fill: shapeOptions.fill,
        stroke: shapeOptions.stroke,
        strokeWidth: shapeOptions.strokeWidth,
        opacity: shapeOptions.opacity
      });
      
      canvasRef.current.add(circle);
      canvasRef.current.setActiveObject(circle);
      canvasRef.current.renderAll();
      
      addToHistory();
    }
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const imgElement = document.createElement('img');
      imgElement.src = event.target?.result as string;
      
      imgElement.onload = () => {
        if (canvasRef.current) {
          const fabricImage = new fabric.Image(imgElement, {
            left: 100,
            top: 100,
            scaleX: 0.5,
            scaleY: 0.5
          });
          
          canvasRef.current.add(fabricImage);
          canvasRef.current.setActiveObject(fabricImage);
          canvasRef.current.renderAll();
          
          addToHistory();
        }
      };
    };
    
    reader.readAsDataURL(file);
  };

  // Atualizar propriedades do objeto selecionado
  const updateTextProperties = (property: string, value: any) => {
    if (selectedObject && (selectedObject.type === 'text' || selectedObject.type === 'i-text')) {
      const textObj = selectedObject as fabric.IText;
      
      // Atualizar a propriedade no objeto de texto
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
      
      // Atualizar o estado do textOptions
      setTextOptions(prev => ({ ...prev, [property]: value }));
      
      // Renderizar o canvas novamente
      canvasRef.current?.renderAll();
      addToHistory();
    }
  };

  const updateShapeProperties = (property: string, value: any) => {
    if (selectedObject && (selectedObject.type === 'rect' || selectedObject.type === 'circle')) {
      // Atualizar a propriedade no objeto de forma
      switch (property) {
        case 'fill':
          selectedObject.set('fill', value);
          break;
        case 'stroke':
          selectedObject.set('stroke', value);
          break;
        case 'strokeWidth':
          selectedObject.set('strokeWidth', value);
          break;
        case 'opacity':
          selectedObject.set('opacity', value);
          break;
      }
      
      // Atualizar o estado do shapeOptions
      setShapeOptions(prev => ({ ...prev, [property]: value }));
      
      // Renderizar o canvas novamente
      canvasRef.current?.renderAll();
      addToHistory();
    }
  };

  // Operações de camadas
  const bringToFront = () => {
    if (selectedObject && canvasRef.current) {
      selectedObject.bringToFront();
      canvasRef.current.renderAll();
      addToHistory();
    }
  };

  const sendToBack = () => {
    if (selectedObject && canvasRef.current) {
      selectedObject.sendToBack();
      canvasRef.current.renderAll();
      addToHistory();
    }
  };

  const deleteSelected = () => {
    if (selectedObject && canvasRef.current) {
      canvasRef.current.remove(selectedObject);
      canvasRef.current.renderAll();
      setSelectedObject(null);
      addToHistory();
    }
  };

  // Exportar o canvas como imagem
  const exportAsImage = () => {
    if (canvasRef.current) {
      // Calcular as dimensões originais (sem zoom)
      const originalWidth = canvasSize.width;
      const originalHeight = canvasSize.height;
      
      // Salvar zoom atual
      const currentZoom = canvasRef.current.getZoom();
      
      // Temporariamente redefinir zoom para 1 para exportação
      canvasRef.current.setZoom(1);
      canvasRef.current.setWidth(originalWidth);
      canvasRef.current.setHeight(originalHeight);
      
      // Gerar a URL da imagem
      const dataURL = canvasRef.current.toDataURL({
        format: 'png',
        quality: 1
      });
      
      // Criar um link temporário para download
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'canvas-design.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Restaurar o zoom anterior
      canvasRef.current.setZoom(currentZoom);
      resizeCanvas();
      
      toast({
        title: "Exportação concluída",
        description: "Imagem exportada com sucesso!"
      });
    }
  };

  // Renderizar a página
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
                          if (canvasRef.current) {
                            canvasRef.current.setBackgroundColor('#FFFFFF', () => {
                              canvasRef.current?.renderAll();
                            });
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
                        <Button variant="outline" className="h-24 w-full flex-col space-y-2">
                          <Label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                            <Image className="h-8 w-8" />
                            <span>Imagem</span>
                          </Label>
                        </Button>
                        <Input
                          id="image-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={uploadImage}
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
                                if (canvasRef.current) {
                                  canvasRef.current.setBackgroundColor(color, () => {
                                    canvasRef.current?.renderAll();
                                  });
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
                    {selectedObject ? (
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
                        {(selectedObject.type === 'text' || selectedObject.type === 'i-text') && (
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
                                  <Scissor className="h-4 w-4 text-gray-400" />
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
                        {(selectedObject.type === 'rect' || selectedObject.type === 'circle') && (
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
                                  <Scissor className="h-4 w-4 text-gray-400" />
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
          <div className="lg:col-span-3">
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div 
                  ref={canvasContainerRef}
                  className="canvas-container w-full overflow-auto bg-gray-50 dark:bg-gray-900"
                  style={{ height: 'calc(100vh - 200px)', minHeight: '600px' }}
                >
                  <canvas id="canvas" />
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