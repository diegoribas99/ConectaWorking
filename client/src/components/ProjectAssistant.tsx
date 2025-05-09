import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, RefreshCw, X, ChevronDown, ChevronUp, Lightbulb, List, Clock } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { generateProjectDescription, suggestNextSteps } from '@/lib/openai';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface ProjectAssistantProps {
  project: any;
  className?: string;
  onUpdateProject?: (updatedData: any) => void;
}

interface ProjectData {
  description?: string;
  stages?: string[];
  materials?: string[];
  challenges?: string[];
  estimatedTime?: string | number;
  nextSteps?: any[];
  alerts?: string[];
  resources?: string[];
  communications?: string[];
  error?: boolean;
  message?: string;
}

const ProjectAssistant: React.FC<ProjectAssistantProps> = ({ project, className, onUpdateProject }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [nextStepsData, setNextStepsData] = useState<ProjectData | null>(null);

  const generateDescription = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await generateProjectDescription(project);
      setProjectData(result);
    } catch (error) {
      console.error('Erro ao gerar descrição do projeto:', error);
      setProjectData({
        error: true,
        message: 'Não foi possível gerar a descrição do projeto no momento. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNextSteps = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      // Preparar os dados do projeto com informações sobre o progresso atual
      const projectProgressData = {
        name: project.name,
        status: project.status || 'Em andamento',
        currentStage: project.currentStage || '',
        progress: project.progress || 0,
        completedStages: project.completedStages || [],
        pendingStages: project.pendingStages || [],
        challenges: project.challenges || ''
      };
      
      const result = await suggestNextSteps(projectProgressData);
      setNextStepsData(result);
    } catch (error) {
      console.error('Erro ao gerar próximos passos:', error);
      setNextStepsData({
        error: true,
        message: 'Não foi possível gerar as sugestões de próximos passos no momento. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const applyStages = () => {
    if (!projectData?.stages || !onUpdateProject) return;
    
    // Atualizar as etapas do projeto conforme sugerido pela IA
    onUpdateProject({
      projectStages: projectData.stages
    });
  };

  const renderList = (items: string[] | undefined) => {
    if (!items || items.length === 0) return <p className="text-muted-foreground">Não há dados disponíveis.</p>;
    
    return (
      <ul className="space-y-1 list-disc pl-5">
        {items.map((item, index) => (
          <li key={index} className="text-sm">{item}</li>
        ))}
      </ul>
    );
  };

  const renderNextSteps = (steps: any[] | undefined) => {
    if (!steps || steps.length === 0) return <p className="text-muted-foreground">Não há próximos passos sugeridos.</p>;
    
    return (
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="space-y-1 bg-secondary/30 p-3 rounded-md">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-secondary">Etapa {index + 1}</Badge>
              <h4 className="text-sm font-medium">{typeof step === 'string' ? step : step.title || 'Próxima etapa'}</h4>
            </div>
            {step.description && (
              <p className="text-xs text-muted-foreground">{step.description}</p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Collapsible 
      open={isExpanded} 
      onOpenChange={setIsExpanded}
      className={`border rounded-lg shadow-sm ${className || ''}`}
    >
      <CollapsibleTrigger asChild>
        <div className="w-full px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-secondary/50">
          <div className="flex items-center">
            <Sparkles className="h-4 w-4 text-[#FFD600] mr-2" />
            <span className="font-medium">Assistente de Projeto</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="p-4 pt-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="description">Descrição e Planejamento</TabsTrigger>
              <TabsTrigger value="nextSteps">Próximos Passos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="space-y-4">
              {!projectData ? (
                <div className="text-center p-6">
                  <p className="text-muted-foreground mb-4">
                    Gere uma descrição profissional e sugestões para o projeto com base nas características fornecidas.
                  </p>
                  <Button 
                    onClick={generateDescription}
                    className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Lightbulb className="h-4 w-4 mr-2" />}
                    Gerar Descrição
                  </Button>
                </div>
              ) : projectData.error ? (
                <div className="text-center p-4">
                  <p className="text-red-500 mb-3">{projectData.message}</p>
                  <Button 
                    onClick={generateDescription}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Descrição do Projeto</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-20 w-full" />
                      ) : (
                        <p className="text-sm whitespace-pre-line">{projectData.description}</p>
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Etapas Sugeridas</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          <>
                            {renderList(projectData.stages)}
                            {projectData.stages && projectData.stages.length > 0 && onUpdateProject && (
                              <div className="mt-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={applyStages}
                                  className="w-full text-xs"
                                >
                                  <List className="h-3 w-3 mr-1" />
                                  Aplicar essas etapas ao projeto
                                </Button>
                              </div>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Materiais Sugeridos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          renderList(projectData.materials)
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Possíveis Desafios</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          renderList(projectData.challenges)
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Estimativa de Tempo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                            <p className="text-sm">
                              {typeof projectData.estimatedTime === 'number' 
                                ? `${projectData.estimatedTime} semanas` 
                                : projectData.estimatedTime || 'Não disponível'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateDescription}
                      disabled={isLoading}
                      className="flex items-center gap-1"
                    >
                      {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Atualizar
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="nextSteps" className="space-y-4">
              {!nextStepsData ? (
                <div className="text-center p-6">
                  <p className="text-muted-foreground mb-4">
                    Receba sugestões de próximos passos e alertas importantes para este projeto.
                  </p>
                  <Button 
                    onClick={generateNextSteps}
                    className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <List className="h-4 w-4 mr-2" />}
                    Gerar Próximos Passos
                  </Button>
                </div>
              ) : nextStepsData.error ? (
                <div className="text-center p-4">
                  <p className="text-red-500 mb-3">{nextStepsData.message}</p>
                  <Button 
                    onClick={generateNextSteps}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Próximas Etapas Recomendadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-20 w-full" />
                      ) : (
                        renderNextSteps(nextStepsData.nextSteps)
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        renderList(nextStepsData.alerts)
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Recursos Sugeridos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          renderList(nextStepsData.resources)
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Comunicação com Cliente</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {isLoading ? (
                          <Skeleton className="h-16 w-full" />
                        ) : (
                          renderList(nextStepsData.communications)
                        )}
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateNextSteps}
                      disabled={isLoading}
                      className="flex items-center gap-1"
                    >
                      {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Atualizar
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ProjectAssistant;