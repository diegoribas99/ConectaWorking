import React, { useCallback, useEffect, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import MainLayout from '@/components/layout/MainLayout';
import { useLocation } from 'wouter';
import { Loader2, Users, Video, MessageSquareText, FileText } from 'lucide-react';

// Schema para validação do formulário de reunião
const meetingFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  participants: z.string().optional(),
  status: z.enum(["scheduled", "in-progress", "completed", "cancelled"]).default("scheduled"),
  roomId: z.string().min(5, "O ID da sala deve ter pelo menos 5 caracteres"),
  userId: z.number().int().positive()
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

const VideoConferencePage = () => {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();
  const [selectedMeetingId, setSelectedMeetingId] = useState<number | null>(null);
  const [isRoomActive, setIsRoomActive] = useState(false);
  const [meetingDialogOpen, setMeetingDialogOpen] = useState(false);
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const queryClient = useQueryClient();

  // Carregar videoconferências existentes
  const { data: meetings, isLoading: isLoadingMeetings } = useQuery({
    queryKey: ['/api/meetings'],
    queryFn: async () => {
      const response = await apiRequest('/api/meetings?limit=50');
      return response.json();
    }
  });

  // Formulário para criar nova videoconferência
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      participants: "",
      status: "scheduled",
      roomId: `room-${Math.floor(Math.random() * 10000)}`,
      userId: 1 // Usuário logado
    },
  });

  // Mutação para criar nova videoconferência
  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormValues) => {
      const response = await apiRequest('/api/meetings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Videoconferência criada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setMeetingDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: "Não foi possível criar a videoconferência.",
        variant: "destructive",
      });
    }
  });

  // Mutação para analisar transcrição
  const analyzeTranscriptMutation = useMutation({
    mutationFn: async ({ id, transcript }: { id: number, transcript: string }) => {
      const response = await apiRequest(`/api/meetings/${id}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Análise completa!",
        description: "A transcrição foi analisada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
      setAnalysisDialogOpen(false);
      setTranscript('');
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: "Não foi possível analisar a transcrição.",
        variant: "destructive",
      });
    }
  });

  // Função para iniciar uma videoconferência
  const startVideoCall = useCallback((roomID: string) => {
    const appID = import.meta.env.VITE_ZEGOCLOUD_APP_ID || 1234; // Valor padrão caso não esteja configurado
    const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET || 'provisório';
    
    // Gerar token aleatório para demonstração
    // Em produção, isso deve ser gerado no servidor de forma segura
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID, 
      serverSecret, 
      roomID,
      Date.now().toString(), // sessionId
      "Usuário Atual" // nome do usuário
    );

    // Criar instância do ZegoUIKit
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Iniciar a chamada com os recursos necessários
    zp.joinRoom({
      container: document.querySelector('#zegocloud-container') as HTMLElement,
      sharedLinks: [
        {
          name: 'Link da reunião',
          url: `${window.location.origin}/meeting/${roomID}`,
        },
      ],
      scenario: {
        mode: ZegoUIKitPrebuilt.GroupCall,
      },
      showScreenSharingButton: true,
      showTurnOffRemoteCameraButton: true,
      showTurnOffRemoteMicrophoneButton: true,
      showRemoveUserButton: true,
      onJoinRoom: () => {
        setIsRoomActive(true);
      },
      onLeaveRoom: () => {
        setIsRoomActive(false);
      }
    });

  }, []);

  // Lidar com o envio do formulário de criação de reunião
  const onSubmit = (data: MeetingFormValues) => {
    createMeetingMutation.mutate(data);
  };

  // Lidar com o envio do formulário de análise de transcrição
  const handleAnalysisSubmit = () => {
    if (!transcript.trim() || !selectedMeetingId) {
      toast({
        title: "Erro!",
        description: "Transcrição não pode estar vazia.",
        variant: "destructive",
      });
      return;
    }

    analyzeTranscriptMutation.mutate({
      id: selectedMeetingId,
      transcript: transcript
    });
  };

  // Função para exibir o modal de análise
  const openAnalysisDialog = (meetingId: number) => {
    setSelectedMeetingId(meetingId);
    setAnalysisDialogOpen(true);
  };

  // Função para iniciar uma reunião
  const joinMeeting = (roomId: string) => {
    startVideoCall(roomId);
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Videoconferências</h1>
            <p className="text-muted-foreground">
              Crie e participe de reuniões online com análise de IA
            </p>
          </div>
          <Button onClick={() => setMeetingDialogOpen(true)}>
            Nova Videoconferência
          </Button>
        </div>

        {isRoomActive && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Reunião em andamento</CardTitle>
                <CardDescription>
                  Você está em uma videochamada ativa no momento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div id="zegocloud-container" className="w-full h-[600px] rounded-md bg-slate-100 dark:bg-slate-800"></div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoadingMeetings ? (
            <div className="col-span-full flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
            </div>
          ) : meetings && meetings.length > 0 ? (
            meetings.map((meeting: any) => (
              <Card key={meeting.id} className="overflow-hidden">
                <CardHeader className="bg-yellow-50 dark:bg-yellow-950/20">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5 text-yellow-600" />
                    {meeting.title}
                  </CardTitle>
                  <CardDescription>
                    {new Date(meeting.createdAt).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {meeting.participants || 'Sem participantes definidos'}
                      </span>
                    </div>
                    <p className="text-sm mb-2">
                      {meeting.description || 'Sem descrição'}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        meeting.status === 'completed' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300' 
                          : meeting.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : meeting.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300'
                      }`}>
                        {meeting.status === 'completed' ? 'Concluída' : 
                         meeting.status === 'in-progress' ? 'Em Andamento' :
                         meeting.status === 'cancelled' ? 'Cancelada' : 'Agendada'}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t p-4 bg-muted/10">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openAnalysisDialog(meeting.id)}
                  >
                    <MessageSquareText className="h-4 w-4 mr-2" />
                    Analisar
                  </Button>
                  <Button
                    onClick={() => joinMeeting(meeting.roomId)}
                    size="sm"
                  >
                    <Video className="h-4 w-4 mr-2" />
                    Entrar
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground mb-4">Nenhuma videoconferência encontrada</p>
              <Button onClick={() => setMeetingDialogOpen(true)}>
                Criar primeira reunião
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para criar nova videoconferência */}
      <Dialog open={meetingDialogOpen} onOpenChange={setMeetingDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Nova Videoconferência</DialogTitle>
            <DialogDescription>
              Preencha os detalhes para criar uma nova videoconferência.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Reunião de projeto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o objetivo da reunião" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participantes</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="João, Maria, Carlos" 
                        {...field} 
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Agendada</SelectItem>
                        <SelectItem value="in-progress">Em andamento</SelectItem>
                        <SelectItem value="completed">Concluída</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID da Sala</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setMeetingDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  disabled={createMeetingMutation.isPending}
                >
                  {createMeetingMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Criar Videoconferência
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para analisar transcrição */}
      <Dialog open={analysisDialogOpen} onOpenChange={setAnalysisDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Analisar Transcrição</DialogTitle>
            <DialogDescription>
              Cole a transcrição da reunião para análise automatizada com IA.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid w-full gap-2">
              <Textarea
                placeholder="Cole aqui a transcrição da reunião..."
                className="min-h-[200px]"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                A IA analisará a transcrição para identificar pontos-chave, ações e decisões importantes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setAnalysisDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleAnalysisSubmit}
              disabled={analyzeTranscriptMutation.isPending || !transcript.trim()}
            >
              {analyzeTranscriptMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Analisar com IA
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default VideoConferencePage;