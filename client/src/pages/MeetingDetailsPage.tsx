import React, { useState } from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import MainLayout from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Video,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  ClipboardCheck,
  MessageCircle,
  HelpCircle,
  Lightbulb,
  FileText,
  ArrowLeft
} from 'lucide-react';
import { useLocation } from 'wouter';

const MeetingDetailsPage = () => {
  const { id } = useParams();
  const [location, setLocation] = useLocation();
  const meetingId = Number(id);

  // Buscar detalhes da reunião
  const { data: meeting, isLoading: isLoadingMeeting } = useQuery({
    queryKey: [`/api/meetings/${meetingId}`],
    queryFn: async () => {
      const response = await apiRequest(`/api/meetings/${meetingId}`);
      return response.json();
    },
    enabled: !isNaN(meetingId) && meetingId > 0
  });

  // Buscar análises da reunião
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: [`/api/meetings/${meetingId}/analytics`],
    queryFn: async () => {
      const response = await apiRequest(`/api/meetings/analytics?meetingId=${meetingId}`);
      return response.json();
    },
    enabled: !isNaN(meetingId) && meetingId > 0
  });

  // Buscar participantes da reunião
  const { data: participants, isLoading: isLoadingParticipants } = useQuery({
    queryKey: [`/api/meetings/${meetingId}/participants`],
    queryFn: async () => {
      const response = await apiRequest(`/api/meetings/${meetingId}/participants`);
      return response.json();
    },
    enabled: !isNaN(meetingId) && meetingId > 0
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">Agendada</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Em Andamento</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Concluída</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">Cancelada</Badge>;
      default:
        return <Badge variant="outline">Indefinido</Badge>;
    }
  };

  if (isLoadingMeeting || isLoadingAnalytics || isLoadingParticipants) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12 flex justify-center items-center">
          <Loader2 className="h-12 w-12 animate-spin text-yellow-500" />
        </div>
      </MainLayout>
    );
  }

  if (!meeting) {
    return (
      <MainLayout>
        <div className="container mx-auto py-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Reunião não encontrada</CardTitle>
              <CardDescription>
                A videoconferência solicitada não foi encontrada ou não está mais disponível.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation('/meeting')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Videoconferências
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/meeting')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Videoconferências
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Video className="h-6 w-6 text-yellow-500" />
                {meeting.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-muted-foreground text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {formatDate(meeting.createdAt)}
                </span>
                <span className="text-sm">•</span>
                <span className="text-sm">{getStatusBadge(meeting.status)}</span>
              </div>
            </div>
            
            <Button onClick={() => setLocation(`/meeting/join/${meeting.roomId}`)}>
              <Video className="h-4 w-4 mr-2" />
              Entrar na Reunião
            </Button>
          </div>
          
          {meeting.description && (
            <p className="mt-4 text-muted-foreground">{meeting.description}</p>
          )}
        </div>
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="summary">
              <FileText className="h-4 w-4 mr-2" />
              Resumo
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participantes
            </TabsTrigger>
            <TabsTrigger value="transcript" disabled={!analytics?.transcriptText}>
              <MessageCircle className="h-4 w-4 mr-2" />
              Transcrição
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            {analytics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-yellow-500" />
                      Resumo da Reunião
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{analytics.summary || "Nenhum resumo disponível ainda."}</p>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <Lightbulb className="h-5 w-5 mr-2 text-yellow-500" />
                      Pontos-Chave
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.keyPoints && analytics.keyPoints.length > 0 ? (
                      <ul className="space-y-2">
                        {analytics.keyPoints.map((point: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">{index + 1}</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Nenhum ponto-chave identificado.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <ClipboardCheck className="h-5 w-5 mr-2 text-yellow-500" />
                      Itens de Ação
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.actionItems && analytics.actionItems.length > 0 ? (
                      <ul className="space-y-2">
                        {analytics.actionItems.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Nenhum item de ação identificado.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2 text-yellow-500" />
                      Perguntas Levantadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.questions && analytics.questions.length > 0 ? (
                      <ul className="space-y-2">
                        {analytics.questions.map((question: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">?</span>
                            <span>{question}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma pergunta identificada.</p>
                    )}
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-medium flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-yellow-500" />
                      Decisões Tomadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.decisions && analytics.decisions.length > 0 ? (
                      <ul className="space-y-2">
                        {analytics.decisions.map((decision: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full h-5 w-5 flex items-center justify-center text-xs mt-0.5">{index + 1}</span>
                            <span>{decision}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted-foreground">Nenhuma decisão identificada.</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sem análise disponível</CardTitle>
                  <CardDescription>
                    Esta reunião ainda não possui uma análise gerada com IA.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Após a conclusão da reunião, você pode submeter uma transcrição para análise
                    e obter um resumo detalhado com pontos-chave, itens de ação e decisões.
                  </p>
                  <Button onClick={() => setLocation('/meeting')}>
                    Voltar para Videoconferências
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="participants">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <Users className="h-5 w-5 mr-2 text-yellow-500" />
                  Participantes da Reunião
                </CardTitle>
                <CardDescription>
                  {participants && participants.length > 0 
                    ? `${participants.length} participante(s) nesta reunião`
                    : "Sem participantes registrados"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {participants && participants.length > 0 ? (
                  <div className="space-y-4">
                    {participants.map((participant: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                          <span className="text-yellow-800 dark:text-yellow-200 font-medium">
                            {participant.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{participant.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Entrou: {formatDate(participant.joinedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-muted-foreground mb-2">
                      Ainda não há participantes registrados nesta reunião.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Os participantes serão registrados quando entrarem na videochamada.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="transcript">
            {analytics?.transcriptText ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-yellow-500" />
                    Transcrição da Reunião
                  </CardTitle>
                  <CardDescription>
                    Transcrição completa da videoconferência
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-4 rounded-md max-h-[400px] overflow-y-auto whitespace-pre-wrap">
                    {analytics.transcriptText}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Sem transcrição disponível</CardTitle>
                  <CardDescription>
                    Esta reunião ainda não possui uma transcrição.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Após a conclusão da reunião, você pode submeter uma transcrição para análise.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default MeetingDetailsPage;