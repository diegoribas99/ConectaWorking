import React, { useState, useEffect, useRef } from "react";
import { useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AlertCircle, ArrowLeft, Mic, Video, Users, Settings, Copy, Video as VideoIcon, FileVideo, StopCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useAuth } from "@/lib/AuthContext";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle 
} from "@/components/ui/dialog";

// Definindo o esquema de validação do formulário
const joinMeetingFormSchema = z.object({
  displayName: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  password: z.string().optional(),
  camera: z.boolean().default(true),
  microphone: z.boolean().default(true),
});

type JoinMeetingFormValues = z.infer<typeof joinMeetingFormSchema>;

// Definindo o esquema de validação do formulário para gravação
const recordingFormSchema = z.object({
  title: z.string().min(2, { message: "Título deve ter pelo menos 2 caracteres" }),
  description: z.string().optional(),
});

type RecordingFormValues = z.infer<typeof recordingFormSchema>;

const JoinMeetingPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showMeetingRoom, setShowMeetingRoom] = useState(false);
  const [meetingElement, setMeetingElement] = useState<HTMLDivElement | null>(null);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [showSaveRecordingDialog, setShowSaveRecordingDialog] = useState(false);
  const zpRef = useRef<any>(null); // Referência para a instância do Zego

  // Consulta para obter detalhes da reunião
  const { data: meetingData, isLoading, error } = useQuery({
    queryKey: [`/api/videoconferencia/sala/${roomId}`],
    queryFn: () => apiRequest<any>({ url: `/api/videoconferencia/sala/${roomId}` }),
    enabled: !!roomId
  });

  // Dados simulados para fins de demonstração
  const mockMeeting = {
    id: 1,
    title: "Reunião de Projeto - Casa Moderna",
    description: "Apresentação do conceito e aprovação do cliente",
    meetingType: "client",
    startTime: new Date(Date.now() + 86400000),
    endTime: new Date(Date.now() + 86400000 + 3600000),
    participants: [
      { id: 1, name: "Maria Silva", email: "maria@example.com", role: "host" },
      { id: 2, name: "João Santos", email: "joao@example.com", role: "participant" },
    ],
    host: { id: 1, name: "Maria Silva" },
    roomId: roomId || "abc123",
    password: null,
    status: "scheduled"
  };

  const meeting = meetingData || mockMeeting;

  // Configuração do formulário
  const form = useForm<JoinMeetingFormValues>({
    resolver: zodResolver(joinMeetingFormSchema),
    defaultValues: {
      displayName: user ? `${user.username}` : "",
      password: "",
      camera: true,
      microphone: true,
    },
  });

  // Mutation para salvar a gravação
  const saveMeetingRecordingMutation = useMutation({
    mutationFn: async (recordingData: {
      title: string;
      description?: string;
      meetingId: number;
      fileUrl: string;
      duration: number;
      startTime: Date;
      endTime: Date;
    }) => {
      return apiRequest({
        url: `/api/videoconferencia/${recordingData.meetingId}/gravacoes`,
        method: "POST",
        data: recordingData
      });
    },
    onSuccess: () => {
      toast({
        title: "Gravação salva com sucesso",
        description: "A gravação da reunião foi salva com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/videoconferencia/${meeting?.id}/gravacoes`] });
      setShowSaveRecordingDialog(false);
    },
    onError: () => {
      toast({
        title: "Erro ao salvar gravação",
        description: "Ocorreu um erro ao salvar a gravação. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Formulário para salvar a gravação
  const recordingForm = useForm<RecordingFormValues>({
    resolver: zodResolver(recordingFormSchema),
    defaultValues: {
      title: `Gravação - ${meeting?.title || 'Reunião'}`,
      description: '',
    },
  });

  useEffect(() => {
    // Atualizar URL completa da reunião para compartilhamento
    const baseUrl = window.location.origin;
    setMeetingUrl(`${baseUrl}/videoconferencia/entrar/${roomId}`);
  }, [roomId]);

  // Função para compartilhar o link da reunião
  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingUrl).then(() => {
      toast({
        title: "Link copiado",
        description: "O link da reunião foi copiado para a área de transferência",
      });
    }).catch(() => {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link da reunião",
        variant: "destructive",
      });
    });
  };

  // Iniciar/parar gravação
  const toggleRecording = () => {
    if (!isRecording) {
      // Inicia a gravação
      if (zpRef.current?.startRecording) {
        try {
          zpRef.current.startRecording();
          setIsRecording(true);
          setRecordingStartTime(new Date());
          toast({
            title: "Gravação iniciada",
            description: "A gravação da reunião foi iniciada."
          });
        } catch (err) {
          console.error("Erro ao iniciar gravação:", err);
          toast({
            title: "Erro ao iniciar gravação",
            description: "Não foi possível iniciar a gravação. Tente novamente.",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Gravação não disponível",
          description: "A gravação não está disponível nesta sessão.",
          variant: "destructive",
        });
      }
    } else {
      // Para a gravação
      if (zpRef.current?.stopRecording) {
        try {
          zpRef.current.stopRecording();
          setIsRecording(false);
          setShowSaveRecordingDialog(true);
        } catch (err) {
          console.error("Erro ao parar gravação:", err);
          toast({
            title: "Erro ao parar gravação",
            description: "Não foi possível parar a gravação. Tente novamente.",
            variant: "destructive",
          });
        }
      }
    }
  };

  // Salvar gravação no banco de dados
  const handleSaveRecording = (data: RecordingFormValues) => {
    if (!meeting || !recordingStartTime) {
      toast({
        title: "Erro ao salvar gravação",
        description: "Informações da reunião incompletas.",
        variant: "destructive",
      });
      return;
    }

    const endTime = new Date();
    const durationMs = endTime.getTime() - recordingStartTime.getTime();
    const durationSeconds = Math.round(durationMs / 1000);

    // Em um ambiente real, obteríamos a URL do arquivo de gravação do serviço
    // Para demonstração, usamos uma URL fictícia que representaria um arquivo real
    const fileUrl = `https://storage.example.com/meetings/${meeting.id}/recording-${Date.now()}.mp4`;

    saveMeetingRecordingMutation.mutate({
      meetingId: meeting.id,
      title: data.title,
      description: data.description,
      fileUrl: fileUrl,
      duration: durationSeconds,
      startTime: recordingStartTime,
      endTime: endTime
    });
  };

  // Função para entrar na reunião
  const handleJoinMeeting = (data: JoinMeetingFormValues) => {
    if (!meetingElement) return;

    // Em uma implementação real, verificariamos a senha se necessário
    if (meeting.password && meeting.password !== data.password) {
      toast({
        title: "Senha incorreta",
        description: "A senha fornecida está incorreta",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Entrando na reunião",
      description: "Preparando sua experiência de videoconferência...",
    });

    try {
      // Simulando a integração com ZegoCloud
      setShowMeetingRoom(true);

      // Criando a instância do Zego (Em uma implementação real, isso seria feito com chaves reais)
      const appID = 12345678;  // Isso seria uma chave real da ZegoCloud
      const serverSecret = "abcdefghijklmnopqrstuvwxyz123456";  // Isso seria um segredo real

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId || "default-room",
        Date.now().toString(),
        data.displayName
      );

      // Criar a instância da sala de reunião
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp; // Salvar a referência para uso posterior

      // Entrar na sala
      zp.joinRoom({
        container: meetingElement,
        sharedLinks: [
          {
            name: "Link de convite",
            url: meetingUrl,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: true,
        showPreJoinView: false,
        turnOnMicrophoneWhenJoining: data.microphone,
        turnOnCameraWhenJoining: data.camera,
        onJoinRoom: () => {
          console.log("Joined the room!");
        },
        onLeaveRoom: () => {
          console.log("Left the room.");
          setShowMeetingRoom(false);
          // Se estiver gravando quando sair, para a gravação
          if (isRecording && zpRef.current?.stopRecording) {
            zpRef.current.stopRecording();
            setIsRecording(false);
            setShowSaveRecordingDialog(true);
          }
        },
        onError: (error: any) => {
          console.error("Zego error:", error);
          toast({
            title: "Erro na videoconferência",
            description: "Ocorreu um erro ao conectar à sala. Tente novamente.",
            variant: "destructive",
          });
          setShowMeetingRoom(false);
        }
      });
    } catch (err) {
      console.error("Error joining meeting:", err);
      toast({
        title: "Erro ao entrar na reunião",
        description: "Não foi possível conectar à sala de videoconferência",
        variant: "destructive",
      });
      setShowMeetingRoom(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center">
        <div className="animate-pulse text-center">
          <p>Carregando informações da reunião...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Não foi possível encontrar esta reunião. Verifique o link e tente novamente.
            </AlertDescription>
          </Alert>
          <Button asChild>
            <Link to="/videoconferencia">
              <ArrowLeft className="h-4 w-4 mr-2" /> Voltar para Videoconferências
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container py-6">
        {!showMeetingRoom ? (
          <div className="max-w-2xl mx-auto">
            <Button variant="outline" size="sm" asChild className="mb-6">
              <Link to="/videoconferencia">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Link>
            </Button>
            
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">{meeting.title}</CardTitle>
                <CardDescription>
                  {meeting.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      Anfitrião: {meeting.host?.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center" 
                      onClick={copyMeetingLink}
                    >
                      <Copy className="h-4 w-4 mr-2" /> Copiar link
                    </Button>
                  </div>
                </div>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleJoinMeeting)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Seu nome</FormLabel>
                          <FormControl>
                            <Input placeholder="Como você quer ser visto na reunião" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {meeting.password && (
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Senha da reunião</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="Digite a senha para entrar" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <div className="space-y-3 pt-2">
                      <FormField
                        control={form.control}
                        name="camera"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center space-x-3">
                              <Video className={`h-5 w-5 ${field.value ? 'text-[#FFD600]' : 'text-gray-400'}`} />
                              <div className="space-y-0.5">
                                <FormLabel>Câmera</FormLabel>
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="microphone"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between rounded-lg border p-3">
                            <div className="flex items-center space-x-3">
                              <Mic className={`h-5 w-5 ${field.value ? 'text-[#FFD600]' : 'text-gray-400'}`} />
                              <div className="space-y-0.5">
                                <FormLabel>Microfone</FormLabel>
                              </div>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="pt-4">
                      <Button 
                        type="submit" 
                        className="w-full bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
                      >
                        Entrar na videoconferência
                      </Button>
                    </div>
                  </form>
                </Form>
                
                <div className="text-center mt-6">
                  <Button variant="outline" size="sm" className="flex items-center mx-auto">
                    <Settings className="h-4 w-4 mr-2" /> Testar áudio e vídeo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex flex-col h-[85vh]">
            <div className="flex justify-between items-center mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  if (isRecording && zpRef.current?.stopRecording) {
                    zpRef.current.stopRecording();
                    setIsRecording(false);
                    setShowSaveRecordingDialog(true);
                  }
                  setShowMeetingRoom(false);
                }} 
                className="flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" /> Sair da reunião
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  onClick={toggleRecording} 
                  size="sm"
                  className={`flex items-center gap-1 ${isRecording ? 'bg-red-600 hover:bg-red-700' : ''}`}
                  variant={isRecording ? 'default' : 'outline'}
                >
                  {isRecording ? (
                    <>
                      <StopCircle className="h-4 w-4" />
                      Parar Gravação
                    </>
                  ) : (
                    <>
                      <FileVideo className="h-4 w-4" />
                      Gravar
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center" 
                  onClick={copyMeetingLink}
                >
                  <Copy className="h-4 w-4 mr-1" /> Compartilhar
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg overflow-hidden border flex-grow relative">
              {isRecording && (
                <div className="absolute top-0 left-0 right-0 p-2 bg-red-600 text-white flex items-center justify-center z-10">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-white animate-pulse"></div>
                    <span>Gravando</span>
                  </div>
                </div>
              )}
              <div 
                ref={setMeetingElement} 
                className="w-full h-full"
              ></div>
            </div>
          </div>
        )}
      </div>
      
      <Dialog open={showSaveRecordingDialog} onOpenChange={setShowSaveRecordingDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Salvar Gravação</DialogTitle>
            <DialogDescription>
              Forneça informações para salvar sua gravação. Você poderá acessá-la
              posteriormente na página de detalhes da reunião.
            </DialogDescription>
          </DialogHeader>
          <Form {...recordingForm}>
            <form onSubmit={recordingForm.handleSubmit(handleSaveRecording)} className="space-y-4">
              <FormField
                control={recordingForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título da gravação</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Discussão sobre orçamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={recordingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Pontos principais da conversa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowSaveRecordingDialog(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={saveMeetingRecordingMutation.isPending}
                >
                  {saveMeetingRecordingMutation.isPending ? "Salvando..." : "Salvar Gravação"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JoinMeetingPage;