import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, ArrowLeft, Video } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import MainLayout from '@/components/layout/MainLayout';
import { useToast } from '@/hooks/use-toast';

const JoinMeetingPage = () => {
  const { roomId } = useParams();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const [userName, setUserName] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Iniciar a videoconferência
  const startMeeting = () => {
    if (!roomId) {
      setError('ID da sala não encontrado. Verifique o link da reunião.');
      return;
    }

    if (!userName.trim()) {
      setError('Por favor, informe seu nome para entrar na reunião.');
      return;
    }

    setIsJoining(true);
    setError(null);

    try {
      // Valores de configuração do ZegoCloud
      // Em produção, estes devem vir de variáveis de ambiente seguras
      const appID = import.meta.env.VITE_ZEGOCLOUD_APP_ID 
        ? parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID) 
        : 1234; // valor de demonstração
      
      const serverSecret = import.meta.env.VITE_ZEGOCLOUD_SERVER_SECRET || 'seu_server_secret';
      
      // Gerar token de autenticação
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        Date.now().toString(), // ID de sessão único
        userName // Nome do usuário que aparecerá na chamada
      );

      // Criar instância do ZegoUIKit
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      // Iniciar a chamada com as configurações necessárias
      zp.joinRoom({
        container: document.querySelector('#zegocloud-container') as HTMLElement,
        sharedLinks: [
          {
            name: 'Link da reunião',
            url: `${window.location.origin}/meeting/join/${roomId}`,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.GroupCall,
        },
        showScreenSharingButton: true,
        showTurnOffRemoteCameraButton: true,
        showTurnOffRemoteMicrophoneButton: true,
        onJoinRoom: () => {
          setHasJoined(true);
          setIsJoining(false);
          
          // Registrar participante na API
          registerParticipant(roomId, userName);
          
          toast({
            title: 'Conectado com sucesso!',
            description: 'Você entrou na videoconferência.',
          });
        },
        onLeaveRoom: () => {
          setHasJoined(false);
          toast({
            title: 'Reunião encerrada',
            description: 'Você saiu da videoconferência.',
          });
        },
        onError: (error: any) => {
          console.error('Erro ao conectar:', error);
          setError('Erro ao conectar à videoconferência. Tente novamente.');
          setIsJoining(false);
        }
      });
    } catch (err) {
      console.error('Erro ao iniciar videoconferência:', err);
      setError('Não foi possível iniciar a videoconferência. Verifique suas configurações.');
      setIsJoining(false);
    }
  };

  // Registrar participante na API
  const registerParticipant = async (roomId: string, name: string) => {
    try {
      // Obter ID da reunião a partir do roomId
      const meetingsResponse = await fetch(`/api/meetings?roomId=${roomId}`);
      const meetings = await meetingsResponse.json();
      
      if (meetings && meetings.length > 0) {
        const meetingId = meetings[0].id;
        
        // Registrar participante
        await fetch(`/api/meetings/${meetingId}/participants`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, role: 'participant' }),
        });
      }
    } catch (error) {
      console.error('Erro ao registrar participante:', error);
      // Não interrompe o fluxo se falhar, apenas loga o erro
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <Button 
          variant="ghost" 
          onClick={() => setLocation('/meeting')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Videoconferências
        </Button>
        
        <h1 className="text-3xl font-bold mb-6 flex items-center">
          <Video className="h-6 w-6 mr-2 text-yellow-500" />
          Participar da Videoconferência
        </h1>
        
        {!hasJoined ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Entrar na Reunião</CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para participar da videoconferência.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="meeting-id">ID da Reunião</Label>
                    <Input 
                      id="meeting-id" 
                      value={roomId || ''} 
                      disabled 
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-name">Seu Nome</Label>
                    <Input 
                      id="user-name" 
                      placeholder="Digite seu nome" 
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={startMeeting} 
                  disabled={isJoining || !roomId || !userName.trim()}
                  className="w-full"
                >
                  {isJoining ? 'Conectando...' : 'Entrar na Reunião'}
                </Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Dicas para Reuniões</CardTitle>
                <CardDescription>
                  Recomendações para uma melhor experiência
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 list-disc pl-5">
                  <li>Utilize fones de ouvido para evitar eco</li>
                  <li>Encontre um ambiente silencioso para a chamada</li>
                  <li>Mantenha sua câmera ligada para uma melhor interação</li>
                  <li>Use o botão de "compartilhar tela" para apresentações</li>
                  <li>Aproveite as ferramentas de colaboração durante a reunião</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Reunião em andamento</CardTitle>
              <CardDescription>
                Você está conectado à videoconferência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div id="zegocloud-container" className="w-full h-[600px] rounded-md bg-slate-100 dark:bg-slate-800"></div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default JoinMeetingPage;