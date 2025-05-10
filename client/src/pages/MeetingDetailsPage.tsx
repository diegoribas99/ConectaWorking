import React, { useState } from "react";
import { useParams, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Clock, Users, ArrowLeft, Video, FileText, BarChart2, ListChecks, MessageSquare, Download, Mail, Eye, Loader2 } from "lucide-react";
import GoogleCalendarIntegration from "@/components/GoogleCalendarIntegration";

// Interface para os tipos de análise de reunião
interface MeetingAnalyticsData {
  summary: string;
  duration: number;
  participantsCount: number;
  actionItems: string[];
  keyPoints: string[];
  sentimentScore: number;
  topicsCovered: {
    topic: string;
    timeSpent: number;
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
  speakingDistribution: {
    participant: string;
    timePercentage: number;
  }[];
  transcript?: string;
}

// Interface para as gravações de reunião
interface MeetingRecording {
  id: number;
  meetingId: number;
  title: string;
  description?: string;
  fileUrl: string;
  duration: number;
  startTime: Date;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  status?: 'processing' | 'available' | 'processed' | 'error';
  userId?: number;
}

// Componente principal
const MeetingDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const meetingId = parseInt(id);
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState("summary");
  
  // Estados para a análise de transcrição
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [currentRecordingId, setCurrentRecordingId] = useState<number | null>(null);

  // Consulta para obter detalhes da reunião e suas análises
  const { data: meetingData, isLoading, error } = useQuery({
    queryKey: [`/api/videoconferencia/${meetingId}`],
    queryFn: () => apiRequest<any>({ url: `/api/videoconferencia/${meetingId}` }),
    enabled: !isNaN(meetingId)
  });
  
  // Consulta para obter as gravações da reunião
  const { data: recordingsData, isLoading: recordingsLoading, refetch: refetchRecordings } = useQuery({
    queryKey: [`/api/videoconferencia/${meetingId}/gravacoes`],
    queryFn: () => apiRequest<MeetingRecording[]>({ url: `/api/videoconferencia/${meetingId}/gravacoes` }),
    enabled: !isNaN(meetingId)
  });
  
  // Função para transcrever e analisar uma gravação
  const handleTranscribe = async (recordingId: number) => {
    try {
      setAnalysisLoading(true);
      setCurrentRecordingId(recordingId);
      
      // Verificar se a gravação já foi processada
      const recording = recordingsData?.find(r => r.id === recordingId);
      
      if (recording && recording.status === 'processed') {
        // Se já foi processada, apenas redirecionar para a aba de transcrição
        setActiveTab("transcript");
        return;
      }
      
      // Chamada para a API de análise
      const response = await fetch(`/api/videoconferencia/${meetingId}/analisar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordingId: recordingId
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao processar transcrição');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Atualizar os dados
        refetchRecordings();
        
        // Navegar para a aba de transcrição
        setActiveTab("transcript");
        
        toast({
          title: "Análise concluída!",
          description: "A transcrição e análise da reunião foram concluídas com sucesso.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error('Erro ao analisar gravação:', error);
      toast({
        title: "Erro ao processar transcrição",
        description: "Não foi possível processar a transcrição desta gravação.",
        variant: "destructive",
      });
    } finally {
      setAnalysisLoading(false);
      setCurrentRecordingId(null);
    }
  };

  // Simulação de dados para teste
  const mockMeeting = {
    id: meetingId,
    title: "Revisão de orçamento - Projeto Verão",
    description: "Ajuste final dos valores e aprovação do cliente",
    meetingType: "client",
    startTime: new Date(Date.now() - (3 * 86400000)), // 3 dias atrás
    endTime: new Date(Date.now() - (3 * 86400000) + 3600000), // +1 hora
    roomId: "ghi789",
    status: "completed",
    participants: [
      { id: 1, name: "Carla Mendes", email: "carla@example.com", role: "client" },
      { id: 2, name: "Paula Rocha", email: "paula@conectaworking.com", role: "team" },
      { id: 3, name: "João Silva", email: "joao@conectaworking.com", role: "team" }
    ],
    recording: "https://example.com/recording/123",
    analytics: {
      summary: "Orçamento aprovado com pequenos ajustes de escopo. O cliente demonstrou interesse em ampliar o projeto para incluir um novo cômodo (escritório home office) e solicitou ajustes nos materiais de acabamento para reduzir custos. Houve discussão detalhada sobre cronograma de execução e foram definidos marcos para entregas parciais.",
      duration: 58, // minutos
      participantsCount: 3,
      actionItems: [
        "Atualizar planta baixa com novo cômodo",
        "Enviar novo orçamento até sexta-feira",
        "Pesquisar alternativas de materiais de acabamento",
        "Agendar visita técnica ao local na próxima semana",
        "Elaborar cronograma detalhado com marcos de entrega"
      ],
      keyPoints: [
        "Orçamento de materiais aprovado com valor de R$ 35.000",
        "Prazo estendido em 2 semanas",
        "Novo cômodo: escritório home office",
        "Substituir porcelanato importado por nacional",
        "Cliente precisa de parte do projeto entregue até dezembro"
      ],
      sentimentScore: 0.8, // 0 a 1, onde 1 é extremamente positivo
      topicsCovered: [
        { topic: "Orçamento", timeSpent: 18, sentiment: "positive" },
        { topic: "Cronograma", timeSpent: 12, sentiment: "neutral" },
        { topic: "Materiais", timeSpent: 15, sentiment: "positive" },
        { topic: "Ampliação de escopo", timeSpent: 13, sentiment: "positive" }
      ],
      speakingDistribution: [
        { participant: "Paula Rocha", timePercentage: 45 },
        { participant: "Carla Mendes", timePercentage: 40 },
        { participant: "João Silva", timePercentage: 15 }
      ],
      transcript: "Esta é uma transcrição simulada da reunião. Em uma implementação real, aqui estaria o texto completo transcrito da conversa durante a videochamada."
    }
  };

  const meeting = meetingData || mockMeeting;
  const analytics = meeting?.analytics as MeetingAnalyticsData;

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="animate-pulse text-center">
          <p>Carregando detalhes da reunião...</p>
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Erro ao carregar reunião</h2>
          <p className="mb-4">Não foi possível encontrar os detalhes desta reunião.</p>
          <Button asChild>
            <Link to="/videoconferencia">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Videoconferências
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Formatar o sentimento como um texto e cor
  const getSentimentText = (score: number) => {
    if (score >= 0.7) return { text: "Muito Positivo", color: "bg-green-100 text-green-800" };
    if (score >= 0.5) return { text: "Positivo", color: "bg-green-50 text-green-600" };
    if (score >= 0.4) return { text: "Neutro", color: "bg-gray-100 text-gray-800" };
    if (score >= 0.2) return { text: "Negativo", color: "bg-red-50 text-red-600" };
    return { text: "Muito Negativo", color: "bg-red-100 text-red-800" };
  };

  const sentiment = getSentimentText(analytics.sentimentScore);

  // Lidar com compartilhamento do relatório por e-mail
  const handleShareReport = () => {
    toast({
      title: "Relatório compartilhado",
      description: "O relatório foi enviado por e-mail para todos os participantes.",
    });
  };

  // Lidar com download do relatório
  const handleDownloadReport = () => {
    toast({
      title: "Download iniciado",
      description: "O relatório está sendo gerado para download.",
    });
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col space-y-6">
        {/* Cabeçalho */}
        <div className="flex justify-between items-start">
          <div>
            <Button variant="outline" size="sm" asChild className="mb-2">
              <Link to="/videoconferencia">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Link>
            </Button>
            <h1 className="text-3xl font-bold">{meeting.title}</h1>
            <div className="flex items-center mt-2 space-x-2">
              <Badge variant="outline" className="text-xs">
                {meeting.meetingType === "client" ? "Cliente" : 
                 meeting.meetingType === "team" ? "Equipe" : "Outro"}
              </Badge>
              <Badge variant="outline" className={`text-xs ${meeting.status === "completed" ? "bg-green-50 text-green-700" : ""}`}>
                {meeting.status === "completed" ? "Concluída" : meeting.status}
              </Badge>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button onClick={handleShareReport} variant="outline" size="sm">
              <Mail className="h-4 w-4 mr-2" /> Compartilhar
            </Button>
            <Button onClick={handleDownloadReport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" /> Baixar PDF
            </Button>
          </div>
        </div>

        {/* Detalhes básicos */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Detalhes da Reunião</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <span>
                  {format(new Date(meeting.startTime), "dd/MM/yyyy")}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>
                  {format(new Date(meeting.startTime), "HH:mm")} - 
                  {meeting.endTime && format(new Date(meeting.endTime), " HH:mm")}
                  {` (${analytics.duration} minutos)`}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{analytics.participantsCount} participantes</span>
              </div>
            </div>
            <div>
              {meeting.description && (
                <p className="text-sm text-gray-600">{meeting.description}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Análise da Reunião */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="summary" className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center">
              <BarChart2 className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="action-items" className="flex items-center">
              <ListChecks className="h-4 w-4 mr-2" />
              Ações
            </TabsTrigger>
            <TabsTrigger value="recordings" className="flex items-center">
              <Video className="h-4 w-4 mr-2" />
              Gravações
            </TabsTrigger>
            <TabsTrigger value="transcript" className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-2" />
              Transcrição
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo da aba Resumo */}
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Resumo da Reunião</CardTitle>
                <CardDescription>
                  Gerado por IA com base na análise da reunião
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Resumo Geral</h3>
                  <p className="text-gray-700">{analytics.summary}</p>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Pontos-Chave</h3>
                  <ul className="space-y-1">
                    {analytics.keyPoints.map((point, index) => (
                      <li key={index} className="text-gray-700 flex items-start">
                        <span className="text-[#FFD600] mr-2">•</span> {point}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-2">Participantes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {meeting.participants.map((participant) => (
                      <div key={participant.id} className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                          {participant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{participant.name}</p>
                          <p className="text-xs text-gray-500">
                            {participant.role === "client" ? "Cliente" : "Equipe"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {meeting.recording && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="font-medium mb-2">Gravação</h3>
                      <Button className="bg-[#FFD600] hover:bg-[#E6C200] text-black" asChild>
                        <a href={meeting.recording} target="_blank" rel="noopener noreferrer">
                          <Video className="h-4 w-4 mr-2" /> Assistir Gravação
                        </a>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo da aba Insights */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sentimento Geral</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <div className="inline-block p-2 rounded-full bg-gray-100 mb-2">
                      <div 
                        className={`h-16 w-16 rounded-full flex items-center justify-center ${
                          sentiment.color
                        }`}
                      >
                        {Math.round(analytics.sentimentScore * 100)}%
                      </div>
                    </div>
                    <h3 className="font-medium">{sentiment.text}</h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    O sentimento geral da reunião foi {sentiment.text.toLowerCase()}, 
                    indicando uma {analytics.sentimentScore >= 0.5 ? "boa" : "baixa"} receptividade 
                    às ideias discutidas.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Distribuição de Fala</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {analytics.speakingDistribution.map((person, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{person.participant}</span>
                        <span>{person.timePercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#FFD600] h-2 rounded-full" 
                          style={{ width: `${person.timePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg">Tópicos Abordados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      {analytics.topicsCovered.map((topic, index) => (
                        <div key={index}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{topic.topic}</span>
                            <span className="text-gray-500">
                              {topic.timeSpent} min
                              <Badge className="ml-2 text-xs" variant="outline">
                                {topic.sentiment === "positive" ? "😀" : 
                                 topic.sentiment === "negative" ? "😕" : "😐"}
                              </Badge>
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                topic.sentiment === "positive" ? "bg-green-400" :
                                topic.sentiment === "negative" ? "bg-red-400" : "bg-gray-400"
                              }`}
                              style={{ width: `${(topic.timeSpent / analytics.duration) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="inline-block p-3 rounded-full bg-gray-100 mb-3">
                          <Clock className="h-10 w-10 text-[#FFD600]" />
                        </div>
                        <h3 className="text-2xl font-bold">{analytics.duration}</h3>
                        <p className="text-gray-500">minutos totais</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Conteúdo da aba Ações */}
          <TabsContent value="action-items">
            <Card>
              <CardHeader>
                <CardTitle>Itens de Ação</CardTitle>
                <CardDescription>
                  Tarefas identificadas durante a reunião
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.actionItems.map((item, index) => (
                    <div 
                      key={index} 
                      className="p-4 border rounded-lg flex items-start hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-shrink-0 mr-4">
                        <div className="h-6 w-6 rounded-full bg-[#FFD600] flex items-center justify-center text-black">
                          {index + 1}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium">{item}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-[#FFD600] hover:bg-[#E6C200] text-black">
                  Exportar para Lista de Tarefas
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Conteúdo da aba Gravações */}
          <TabsContent value="recordings">
            <Card>
              <CardHeader>
                <CardTitle>Gravações da Reunião</CardTitle>
                <CardDescription>
                  Acesse todas as gravações desta videoconferência
                </CardDescription>
              </CardHeader>
              <CardContent>
                {recordingsLoading ? (
                  <div className="animate-pulse space-y-4 py-8">
                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                    <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded"></div>
                  </div>
                ) : recordingsData && recordingsData.length > 0 ? (
                  <div className="space-y-4 py-4">
                    {recordingsData.map((recording) => (
                      <div 
                        key={recording.id}
                        className="flex flex-col md:flex-row justify-between items-start md:items-center p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        <div className="flex items-center gap-3 mb-3 md:mb-0">
                          <div className="bg-[#FFD600] rounded-full p-2 text-black">
                            <Video className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center">
                              <h4 className="font-medium">{recording.title}</h4>
                              {recording.status && (
                                <Badge 
                                  variant="outline" 
                                  className={`ml-2 text-xs ${
                                    recording.status === 'processed' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                                    recording.status === 'processing' ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' :
                                    recording.status === 'error' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800' :
                                    ''
                                  }`}
                                >
                                  {recording.status === 'processed' ? 'Analisado' :
                                   recording.status === 'processing' ? 'Processando' :
                                   recording.status === 'error' ? 'Erro' :
                                   recording.status === 'available' ? 'Disponível' :
                                   recording.status}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <span>
                                {new Date(recording.startTime).toLocaleDateString()} • {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')} min
                              </span>
                              {recording.description && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {recording.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 w-full md:w-auto"
                            asChild
                          >
                            <a href={recording.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                              <span className="hidden md:inline">Visualizar</span>
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex items-center gap-1 w-full md:w-auto"
                            asChild
                          >
                            <a href={recording.fileUrl} download>
                              <Download className="h-4 w-4" />
                              <span className="hidden md:inline">Download</span>
                            </a>
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex items-center gap-1 w-full md:w-auto bg-[#FFD600] hover:bg-[#E6C200] text-black"
                            onClick={() => handleTranscribe(recording.id)}
                            disabled={recording.status === 'processing' || analysisLoading}
                          >
                            {recording.status === 'processing' || analysisLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <MessageSquare className="h-4 w-4" />
                            )}
                            <span className="hidden md:inline">
                              {recording.status === 'processed' ? 'Ver Análise' : 'Transcrever'}
                            </span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Nenhuma gravação disponível para esta reunião.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conteúdo da aba Transcrição */}
          <TabsContent value="transcript">
            <Card>
              <CardHeader>
                <CardTitle>Transcrição Completa</CardTitle>
                <CardDescription>
                  Texto completo da reunião processado por IA
                </CardDescription>
              </CardHeader>
              <CardContent>
                {analysisLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-[#FFD600] mb-4" />
                    <h3 className="text-xl font-medium mb-2">Processando Transcrição</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Estamos transcrevendo e analisando a reunião com IA. 
                      Este processo pode levar alguns minutos dependendo do tamanho da gravação.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="space-y-4">
                      {analytics.transcript ? (
                        <>
                          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-md mb-4 border border-yellow-200 dark:border-yellow-700">
                            <h3 className="font-medium text-sm mb-2 text-yellow-800 dark:text-yellow-300">Sobre esta transcrição</h3>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">
                              Esta transcrição foi gerada automaticamente por IA e pode conter imprecisões.
                              Os resultados da análise estão disponíveis nas outras abas.
                            </p>
                          </div>
                          <p className="whitespace-pre-line">{analytics.transcript}</p>
                        </>
                      ) : (
                        <div className="text-center py-10">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-3 inline-flex mb-4">
                            <MessageSquare className="h-6 w-6 text-gray-500" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">Transcrição não disponível</h3>
                          <p className="text-muted-foreground max-w-md mx-auto mb-6">
                            A transcrição desta reunião ainda não foi processada. Selecione uma gravação da aba "Gravações" e clique em "Transcrever".
                          </p>
                          <Button 
                            variant="outline" 
                            onClick={() => setActiveTab("recordings")}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Ver Gravações
                          </Button>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MeetingDetailsPage;