import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sparkles, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { analyzeClientProfile, analyzeClientHistory } from '@/lib/openai';
import { Skeleton } from '@/components/ui/skeleton';

interface ClientInsightsProps {
  client: any;
  clientHistory?: any;
  className?: string;
}

interface InsightData {
  analysis?: string | string[];
  suggestions?: string[];
  services?: string[];
  communication?: any;
  opportunities?: string[];
  recommendations?: string[];
  points?: string[];
  error?: boolean;
  message?: string;
}

const ClientInsights: React.FC<ClientInsightsProps> = ({ client, clientHistory, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileInsights, setProfileInsights] = useState<InsightData | null>(null);
  const [historyInsights, setHistoryInsights] = useState<InsightData | null>(null);

  const generateProfileInsights = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      const result = await analyzeClientProfile(client);
      setProfileInsights(result);
    } catch (error) {
      console.error('Erro ao gerar insights do perfil:', error);
      setProfileInsights({
        error: true,
        message: 'Não foi possível gerar insights no momento. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateHistoryInsights = async () => {
    if (isLoading || !clientHistory) return;
    
    setIsLoading(true);
    try {
      const result = await analyzeClientHistory({
        name: client.name,
        projects: clientHistory.projects || [],
        interactions: clientHistory.interactions || [],
        preferences: clientHistory.preferences || {}
      });
      setHistoryInsights(result);
    } catch (error) {
      console.error('Erro ao gerar insights do histórico:', error);
      setHistoryInsights({
        error: true,
        message: 'Não foi possível gerar insights históricos no momento. Tente novamente mais tarde.'
      });
    } finally {
      setIsLoading(false);
    }
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

  const renderAnalysis = (analysis: string | string[] | undefined) => {
    if (!analysis) return <p className="text-muted-foreground">Não há análise disponível.</p>;
    
    if (typeof analysis === 'string') {
      return <p className="text-sm">{analysis}</p>;
    }
    
    return renderList(analysis);
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
            <span className="font-medium">Insights de IA</span>
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
              <TabsTrigger value="profile">Perfil do Cliente</TabsTrigger>
              <TabsTrigger value="history" disabled={!clientHistory}>Histórico</TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="space-y-4">
              {!profileInsights ? (
                <div className="text-center p-6">
                  <p className="text-muted-foreground mb-4">
                    Gere insights e recomendações baseados no perfil deste cliente.
                  </p>
                  <Button 
                    onClick={generateProfileInsights}
                    className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Gerar Insights
                  </Button>
                </div>
              ) : profileInsights.error ? (
                <div className="text-center p-4">
                  <p className="text-red-500 mb-3">{profileInsights.message}</p>
                  <Button 
                    onClick={generateProfileInsights}
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
                      <CardTitle className="text-sm font-medium">Análise do Perfil</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-20 w-full" />
                      ) : (
                        renderAnalysis(profileInsights.analysis)
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Sugestões de Abordagem</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        renderList(profileInsights.suggestions)
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Serviços Potenciais</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        renderList(profileInsights.services)
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateProfileInsights}
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
            
            <TabsContent value="history" className="space-y-4">
              {!historyInsights ? (
                <div className="text-center p-6">
                  <p className="text-muted-foreground mb-4">
                    Analise o histórico de projetos e interações para gerar insights sobre este cliente.
                  </p>
                  <Button 
                    onClick={generateHistoryInsights}
                    className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                    disabled={isLoading}
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Analisar Histórico
                  </Button>
                </div>
              ) : historyInsights.error ? (
                <div className="text-center p-4">
                  <p className="text-red-500 mb-3">{historyInsights.message}</p>
                  <Button 
                    onClick={generateHistoryInsights}
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
                      <CardTitle className="text-sm font-medium">Análise do Histórico</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-20 w-full" />
                      ) : (
                        renderAnalysis(historyInsights.analysis)
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Oportunidades</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        renderList(historyInsights.opportunities)
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <Skeleton className="h-16 w-full" />
                      ) : (
                        renderList(historyInsights.recommendations)
                      )}
                    </CardContent>
                  </Card>
                  
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={generateHistoryInsights}
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

export default ClientInsights;