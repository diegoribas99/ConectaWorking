import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Video, Users, VideoOff, Clock, ChevronRight, Edit, Trash2, Calendar as CalendarIcon2, ExternalLink } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Link, useLocation, useRoute } from "wouter";
import { FaRegBuilding, FaVideo } from "react-icons/fa";
import { SiZoom } from "react-icons/si";
import { FaGoogle } from "react-icons/fa6";
import { Switch } from "@/components/ui/switch";
import { 
  isConnectedToGoogle, 
  authenticateWithGoogle, 
  createCalendarEvent,
  convertMeetingToGoogleEvent
} from '@/lib/googleCalendar';

// Definindo os schemas de validação
const meetingFormSchema = z.object({
  title: z.string()
    .min(3, { message: "O título deve ter pelo menos 3 caracteres" })
    .max(100, { message: "O título deve ter no máximo 100 caracteres" }),
  description: z.string()
    .max(500, { message: "A descrição deve ter no máximo 500 caracteres" })
    .optional(),
  meetingType: z.enum(["client", "team", "other"]),
  platform: z.enum(["internal", "zoom", "google_meet"]),
  externalLink: z.string().url({ message: "Insira um link válido" }).optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  password: z.string().optional(),
  addToGoogleCalendar: z.boolean().default(false),
  participants: z.array(
    z.object({
      name: z.string(),
      email: z.string().email({ message: "Email inválido" }),
    })
  ).optional(),
});

type MeetingFormValues = z.infer<typeof meetingFormSchema>;

const VideoconferencePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, params] = useLocation();
  const [activeTab, setActiveTab] = React.useState<string>("upcoming");
  const [openCreateDialog, setOpenCreateDialog] = React.useState<boolean>(false);
  
  // Verifica se a URL contém o parâmetro 'new=true' para abrir automaticamente o diálogo
  useEffect(() => {
    const searchParams = new URLSearchParams(location.split('?')[1]);
    if (searchParams.get('new') === 'true') {
      setOpenCreateDialog(true);
    }
  }, [location]);

  // Consulta para obter reuniões
  const { data: meetings, isLoading } = useQuery({
    queryKey: ["/api/videoconferencia"],
    queryFn: () => apiRequest<any>({ url: "/api/videoconferencia" })
  });

  // Mutation para criar uma nova reunião
  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormValues) => {
      return apiRequest({
        url: "/api/videoconferencia",
        method: "POST",
        data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videoconferencia"] });
      toast({
        title: "Reunião criada",
        description: "Sua reunião foi agendada com sucesso.",
      });
      setOpenCreateDialog(false);
      form.reset();
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a reunião. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Mutation para excluir uma reunião
  const deleteMeetingMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest({
        url: `/api/videoconferencia/${id}`,
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/videoconferencia"] });
      toast({
        title: "Reunião excluída",
        description: "A reunião foi excluída com sucesso.",
      });
    },
    onError: (error) => {
      console.error(error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a reunião. Tente novamente.",
        variant: "destructive",
      });
    }
  });

  // Configuração do formulário
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingFormSchema),
    defaultValues: {
      title: "",
      description: "",
      meetingType: "team",
      platform: "internal",
      externalLink: "",
      password: "",
      addToGoogleCalendar: false,
      participants: [],
    }
  });

  // Manipulador para submissão do formulário
  const onSubmit = async (data: MeetingFormValues) => {
    // Verifica se precisa adicionar ao Google Calendar
    if (data.addToGoogleCalendar) {
      // Verifica se o usuário está conectado ao Google
      if (!isConnectedToGoogle()) {
        try {
          // Tenta autenticar com o Google
          const authenticated = await authenticateWithGoogle();
          
          if (!authenticated) {
            toast({
              title: "Autenticação necessária",
              description: "Por favor, conecte-se ao Google Calendar primeiro para adicionar a reunião.",
              variant: "destructive",
            });
            return;
          }
        } catch (error) {
          toast({
            title: "Erro na autenticação",
            description: "Não foi possível conectar ao Google Calendar.",
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    // Cria a reunião na plataforma
    createMeetingMutation.mutate(data, {
      onSuccess: async (createdMeeting) => {
        // Se a opção de adicionar ao Google Calendar estiver ativada e a autenticação estiver ok
        if (data.addToGoogleCalendar && isConnectedToGoogle()) {
          try {
            // Converte a reunião para o formato do Google Calendar
            const googleEvent = convertMeetingToGoogleEvent({
              ...createdMeeting,
              participants: data.participants || []
            });
            
            // Adiciona ao Google Calendar
            const result = await createCalendarEvent(googleEvent);
            
            if (result.success) {
              toast({
                title: "Reunião criada com sucesso",
                description: "A reunião também foi adicionada ao seu Google Calendar.",
                variant: "default",
              });
            } else {
              toast({
                title: "Reunião criada",
                description: "A reunião foi criada, mas houve um erro ao adicionar ao Google Calendar.",
                variant: "default",
              });
            }
          } catch (error) {
            toast({
              title: "Reunião criada",
              description: "A reunião foi criada, mas houve um erro ao adicionar ao Google Calendar.",
              variant: "default",
            });
          }
        } else {
          toast({
            title: "Reunião criada com sucesso",
            description: "Sua videoconferência foi agendada.",
            variant: "default",
          });
        }
        
        // Fecha o diálogo
        setOpenCreateDialog(false);
      }
    });
  };

  // Para fins de demonstração, vamos criar alguns dados de exemplo
  const demoMeetings = {
    upcoming: [
      {
        id: 1,
        title: "Reunião de projeto - Casa Moderna",
        description: "Apresentação do conceito e aprovação do cliente",
        meetingType: "client",
        platform: "internal",
        startTime: new Date(Date.now() + 86400000), // Amanhã
        roomId: "abc123",
        status: "scheduled",
        participants: [
          { id: 1, name: "Roberto Silva", email: "roberto@example.com", role: "client" },
          { id: 2, name: "Maria Souza", email: "maria@conectaworking.com", role: "team" }
        ]
      },
      {
        id: 2,
        title: "Planejamento semanal da equipe",
        description: "Revisão dos projetos em andamento e distribuição de tarefas",
        meetingType: "team",
        platform: "zoom",
        externalLink: "https://zoom.us/j/1234567890?pwd=abcdefgh",
        startTime: new Date(Date.now() + (2 * 86400000)), // Depois de amanhã
        roomId: "def456",
        status: "scheduled",
        participants: [
          { id: 3, name: "João Almeida", email: "joao@conectaworking.com", role: "team" },
          { id: 4, name: "Ana Castro", email: "ana@conectaworking.com", role: "team" }
        ]
      },
      {
        id: 3,
        title: "Reunião com Designers - Identidade Visual",
        description: "Alinhamento com a equipe de design sobre a nova identidade visual dos projetos",
        meetingType: "other",
        platform: "google_meet",
        externalLink: "https://meet.google.com/abc-defg-hij",
        startTime: new Date(Date.now() + (3 * 86400000)), // 3 dias a partir de agora
        roomId: "ghi789",
        status: "scheduled",
        participants: [
          { id: 5, name: "Carla Mendes", email: "carla@design.com", role: "guest" },
          { id: 6, name: "Teresa Oliveira", email: "teresa@conectaworking.com", role: "host" }
        ]
      }
    ],
    past: [
      {
        id: 4,
        title: "Revisão de orçamento - Projeto Verão",
        description: "Ajuste final dos valores e aprovação do cliente",
        meetingType: "client",
        platform: "internal",
        startTime: new Date(Date.now() - (3 * 86400000)), // 3 dias atrás
        endTime: new Date(Date.now() - (3 * 86400000) + 3600000), // +1 hora
        roomId: "ghi789",
        status: "completed",
        participants: [
          { id: 5, name: "Carla Mendes", email: "carla@example.com", role: "client" },
          { id: 6, name: "Paula Rocha", email: "paula@conectaworking.com", role: "team" }
        ],
        recording: "https://example.com/recording/123",
        analytics: {
          summary: "Orçamento aprovado com pequenos ajustes de escopo. Cliente deseja adicionar novo cômodo ao projeto.",
          duration: 58, // minutos
          actionItems: [
            "Atualizar planta baixa com novo cômodo",
            "Enviar novo orçamento até sexta-feira"
          ],
          keyPoints: [
            "Orçamento de materiais aprovado com valor de R$ 35.000",
            "Prazo estendido em 2 semanas",
            "Novo cômodo: escritório home office"
          ]
        }
      },
      {
        id: 5,
        title: "Apresentação para Investidores - Zoom",
        description: "Apresentação do portfólio para grupo de investidores via Zoom",
        meetingType: "other",
        platform: "zoom",
        externalLink: "https://zoom.us/j/9876543210?pwd=zyxwvuts",
        startTime: new Date(Date.now() - (5 * 86400000)), // 5 dias atrás
        endTime: new Date(Date.now() - (5 * 86400000) + 5400000), // +1.5 horas
        roomId: "mno345",
        status: "completed",
        participants: [
          { id: 8, name: "Grupo Investidores SA", email: "contato@investidores.com", role: "client" },
          { id: 2, name: "Maria Souza", email: "maria@conectaworking.com", role: "host" }
        ],
        recording: "https://example.com/recording/456",
        analytics: {
          summary: "Apresentação bem recebida. Investidores demonstraram interesse em dois projetos específicos.",
          duration: 85, // minutos
          actionItems: [
            "Enviar detalhamento financeiro dos projetos A e C",
            "Agendar visita ao escritório para próxima semana"
          ],
          keyPoints: [
            "Interesse em investir R$ 500.000 no próximo trimestre",
            "Foco em projetos comerciais de médio porte",
            "Necessidade de demonstrar maior escalabilidade"
          ]
        }
      }
    ]
  };

  // Função para renderizar reuniões
  const renderMeetings = (meetings: any[], isPast = false) => {
    if (meetings.length === 0) {
      return (
        <div className="text-center p-6">
          <p className="text-gray-500 dark:text-gray-400">Nenhuma reunião {isPast ? "realizada" : "agendada"}.</p>
        </div>
      );
    }

    return meetings.map((meeting) => (
      <Card key={meeting.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{meeting.title}</CardTitle>
              <CardDescription className="mt-1">
                {meeting.meetingType === "client" ? (
                  <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded">Cliente</span>
                ) : meeting.meetingType === "team" ? (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded">Equipe</span>
                ) : (
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">Outro</span>
                )}
              </CardDescription>
            </div>
            {!isPast && (
              <div className="flex gap-2">
                <Button variant="outline" size="icon" asChild>
                  <Link to={`/videoconferencia/edit/${meeting.id}`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => deleteMeetingMutation.mutate(meeting.id)}
                  disabled={deleteMeetingMutation.isPending}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          {meeting.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{meeting.description}</p>}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon2 className="h-4 w-4 text-gray-500" />
              <span>{format(new Date(meeting.startTime), "dd/MM/yyyy")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{format(new Date(meeting.startTime), "HH:mm")}</span>
              {meeting.endTime && (
                <span>- {format(new Date(meeting.endTime), "HH:mm")}</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-gray-500" />
              <span>{meeting.participants.length} participantes</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              {meeting.platform === "internal" ? (
                <><FaRegBuilding className="h-4 w-4 text-amber-500" /> <span>Plataforma Interna</span></>
              ) : meeting.platform === "zoom" ? (
                <><SiZoom className="h-4 w-4 text-blue-600" /> <span>Zoom</span></>
              ) : meeting.platform === "google_meet" ? (
                <><FaGoogle className="h-4 w-4 text-red-500" /> <span>Google Meet</span></>
              ) : (
                <><FaVideo className="h-4 w-4 text-gray-500" /> <span>Plataforma Externa</span></>
              )}
              
              {meeting.externalLink && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-1 h-7 px-2 text-xs"
                  asChild
                >
                  <a 
                    href={meeting.externalLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Abrir <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-2">
          {isPast ? (
            <Button variant="outline" className="w-full" asChild>
              <Link to={`/videoconferencia/${meeting.id}`}>
                Ver detalhes e análise <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          ) : (
            meeting.platform === "internal" ? (
              <Button className="w-full bg-[#FFD600] hover:bg-[#E6C200] text-black" asChild>
                <Link to={`/videoconferencia/join/${meeting.id}`} className="flex items-center">
                  <FaVideo className="h-4 w-4 mr-2" />
                  Entrar na videoconferência
                </Link>
              </Button>
            ) : meeting.platform === "zoom" && meeting.externalLink ? (
              <Button className="w-full bg-[#0E72ED] hover:bg-[#0D68D8] text-white" asChild>
                <a href={meeting.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <SiZoom className="h-4 w-4 mr-2" />
                  Entrar na reunião Zoom
                </a>
              </Button>
            ) : meeting.platform === "google_meet" && meeting.externalLink ? (
              <Button className="w-full bg-[#00897B] hover:bg-[#007D70] text-white" asChild>
                <a href={meeting.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <FaGoogle className="h-4 w-4 mr-2" />
                  Entrar no Google Meet
                </a>
              </Button>
            ) : meeting.externalLink ? (
              <Button className="w-full bg-[#FFD600] hover:bg-[#E6C200] text-black" asChild>
                <a href={meeting.externalLink} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Acessar reunião externa
                </a>
              </Button>
            ) : (
              <Button className="w-full bg-[#FFD600] hover:bg-[#E6C200] text-black" asChild>
                <Link to={`/videoconferencia/join/${meeting.id}`} className="flex items-center">
                  <Video className="h-4 w-4 mr-2" />
                  Entrar na videoconferência
                </Link>
              </Button>
            )
          )}
        </CardFooter>
      </Card>
    ));
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Videoconferências</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gerencie suas reuniões e videoconferências com clientes e equipe
          </p>
        </div>
        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#FFD600] hover:bg-[#E6C200] text-black">
              <Plus className="h-4 w-4 mr-2" /> Nova videoconferência
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Agendar nova videoconferência</DialogTitle>
              <DialogDescription>
                Preencha os dados abaixo para agendar uma nova reunião online.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Reunião de projeto" {...field} />
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
                          placeholder="Descreva o propósito da reunião" 
                          className="resize-none" 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Opcional. Máximo de 500 caracteres.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="meetingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de reunião</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <Button 
                            type="button" 
                            variant={field.value === "client" ? "default" : "outline"}
                            className={field.value === "client" ? "bg-[#FFD600] hover:bg-[#E6C200] text-black" : ""}
                            onClick={() => form.setValue("meetingType", "client")}
                          >
                            Cliente
                          </Button>
                          <Button 
                            type="button" 
                            variant={field.value === "team" ? "default" : "outline"}
                            className={field.value === "team" ? "bg-[#FFD600] hover:bg-[#E6C200] text-black" : ""}
                            onClick={() => form.setValue("meetingType", "team")}
                          >
                            Equipe
                          </Button>
                          <Button 
                            type="button" 
                            variant={field.value === "other" ? "default" : "outline"}
                            className={field.value === "other" ? "bg-[#FFD600] hover:bg-[#E6C200] text-black" : ""}
                            onClick={() => form.setValue("meetingType", "other")}
                          >
                            Outro
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plataforma de videoconferência</FormLabel>
                      <FormControl>
                        <div className="flex gap-4">
                          <Button 
                            type="button" 
                            variant={field.value === "internal" ? "default" : "outline"}
                            className={field.value === "internal" ? "bg-[#FFD600] hover:bg-[#E6C200] text-black" : ""}
                            onClick={() => form.setValue("platform", "internal")}
                          >
                            <Video className="h-4 w-4 mr-2" /> Plataforma interna
                          </Button>
                          <Button 
                            type="button" 
                            variant={field.value === "zoom" ? "default" : "outline"}
                            className={field.value === "zoom" ? "bg-[#FFD600] hover:bg-[#E6C200] text-black" : ""}
                            onClick={() => form.setValue("platform", "zoom")}
                          >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Zoom_Communications_Logo.svg/200px-Zoom_Communications_Logo.svg.png" 
                              alt="Zoom" className="h-4 w-4 mr-2" /> Zoom
                          </Button>
                          <Button 
                            type="button" 
                            variant={field.value === "google_meet" ? "default" : "outline"}
                            className={field.value === "google_meet" ? "bg-[#FFD600] hover:bg-[#E6C200] text-black" : ""}
                            onClick={() => form.setValue("platform", "google_meet")}
                          >
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Google_Meet_icon.svg/200px-Google_Meet_icon.svg.png" 
                              alt="Google Meet" className="h-4 w-4 mr-2" /> Google Meet
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="externalLink"
                  render={({ field }) => (
                    <FormItem className={form.watch("platform") === "internal" ? "hidden" : ""}>
                      <FormLabel>Link da reunião {form.watch("platform") === "zoom" ? "Zoom" : "Google Meet"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={`Ex: https://${form.watch("platform") === "zoom" ? "zoom.us/j/1234567890" : "meet.google.com/abc-defg-hij"}`} 
                          {...field} 
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Informe o link da reunião externa para compartilhar com os participantes.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data e hora</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha (opcional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Definir senha para a sala" 
                            {...field} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Deixe em branco para sala sem senha
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Seção de participantes */}
                <div className="border rounded-md p-4 mt-4">
                  <h3 className="text-lg font-medium mb-2 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Participantes
                  </h3>
                  
                  <div className="space-y-4">
                    {form.watch("participants")?.map((participant, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <div className="flex-1">
                          <Input 
                            placeholder="Nome do participante"
                            value={participant.name}
                            onChange={(e) => {
                              const updatedParticipants = [...(form.watch("participants") || [])];
                              updatedParticipants[index].name = e.target.value;
                              form.setValue("participants", updatedParticipants);
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <Input 
                            placeholder="Email do participante"
                            type="email"
                            value={participant.email}
                            onChange={(e) => {
                              const updatedParticipants = [...(form.watch("participants") || [])];
                              updatedParticipants[index].email = e.target.value;
                              form.setValue("participants", updatedParticipants);
                            }}
                          />
                        </div>
                        <Button 
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updatedParticipants = [...(form.watch("participants") || [])];
                            updatedParticipants.splice(index, 1);
                            form.setValue("participants", updatedParticipants);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const currentParticipants = form.watch("participants") || [];
                        form.setValue("participants", [
                          ...currentParticipants,
                          { name: "", email: "" }
                        ]);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Participante
                    </Button>
                  </div>
                </div>

                {/* Opção para adicionar ao Google Calendar */}
                <FormField
                  control={form.control}
                  name="addToGoogleCalendar"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mt-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base flex items-center">
                          <FaGoogle className="h-5 w-5 text-blue-600 mr-2" />
                          Adicionar ao Google Calendar
                        </FormLabel>
                        <FormDescription>
                          A reunião será adicionada automaticamente ao seu Google Calendar
                        </FormDescription>
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

                <DialogFooter className="mt-6 sticky bottom-0 bg-white dark:bg-gray-950 py-4 border-t">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setOpenCreateDialog(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-[#FFD600] hover:bg-[#E6C200] text-black"
                    disabled={createMeetingMutation.isPending}
                  >
                    {createMeetingMutation.isPending ? "Criando..." : "Criar reunião"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="upcoming" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800">
          <TabsTrigger value="upcoming" className="flex items-center">
            <Video className="h-4 w-4 mr-2" />
            Próximas reuniões
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center">
            <VideoOff className="h-4 w-4 mr-2" />
            Reuniões passadas
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p>Carregando reuniões...</p>
            </div>
          ) : (
            renderMeetings(meetings?.upcoming || demoMeetings.upcoming)
          )}
        </TabsContent>
        
        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-6">
              <p>Carregando reuniões...</p>
            </div>
          ) : (
            renderMeetings(meetings?.past || demoMeetings.past, true)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoconferencePage;