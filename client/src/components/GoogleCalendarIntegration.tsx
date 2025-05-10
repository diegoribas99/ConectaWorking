import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Check, X } from "lucide-react";
import { FaGoogle } from "react-icons/fa6";
import { 
  isConnectedToGoogle, 
  authenticateWithGoogle, 
  removeGoogleAuthToken, 
  createCalendarEvent,
  convertMeetingToGoogleEvent
} from '@/lib/googleCalendar';

interface GoogleCalendarIntegrationProps {
  meetingData: any;
  onSuccess?: () => void;
}

export function GoogleCalendarIntegration({ meetingData, onSuccess }: GoogleCalendarIntegrationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [autoAddToCalendar, setAutoAddToCalendar] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se o usuário já está conectado ao Google
    const connected = isConnectedToGoogle();
    setIsConnected(connected);
    
    // Carregar preferência de auto-adição salva
    const savedPref = localStorage.getItem('auto_add_to_calendar');
    if (savedPref) {
      setAutoAddToCalendar(savedPref === 'true');
    }
  }, []);

  const handleConnectGoogle = async () => {
    setIsLoading(true);
    try {
      const success = await authenticateWithGoogle();
      if (success) {
        setIsConnected(true);
        toast({
          title: "Conectado com sucesso",
          description: "Sua conta Google foi conectada à plataforma.",
          variant: "default",
        });
      } else {
        toast({
          title: "Erro na conexão",
          description: "Não foi possível conectar à sua conta Google. Tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro na conexão",
        description: "Ocorreu um erro ao tentar conectar com o Google.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectGoogle = () => {
    removeGoogleAuthToken();
    setIsConnected(false);
    setAutoAddToCalendar(false);
    localStorage.removeItem('auto_add_to_calendar');
    toast({
      title: "Desconectado",
      description: "Sua conta Google foi desconectada da plataforma.",
      variant: "default",
    });
  };

  const handleAddToCalendar = async () => {
    setIsLoading(true);
    try {
      // Converter a reunião para o formato do Google Calendar
      const googleEvent = convertMeetingToGoogleEvent(meetingData);
      
      // Criar o evento no calendário
      const result = await createCalendarEvent(googleEvent);
      
      if (result.success) {
        toast({
          title: "Evento adicionado",
          description: "A reunião foi adicionada ao seu Google Calendar com sucesso.",
          variant: "default",
        });
        if (onSuccess) onSuccess();
      } else {
        toast({
          title: "Erro ao adicionar evento",
          description: result.error || "Não foi possível adicionar a reunião ao calendário.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao adicionar evento",
        description: "Ocorreu um erro ao adicionar a reunião ao calendário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAutoAdd = (checked: boolean) => {
    setAutoAddToCalendar(checked);
    localStorage.setItem('auto_add_to_calendar', checked.toString());
    
    toast({
      title: checked ? "Adição automática ativada" : "Adição automática desativada",
      description: checked 
        ? "As reuniões serão automaticamente adicionadas ao seu Google Calendar." 
        : "As reuniões não serão mais adicionadas automaticamente.",
      variant: "default",
    });
  };

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Integração com Google Calendar</CardTitle>
            <CardDescription>
              Adicione suas reuniões automaticamente ao seu calendário
            </CardDescription>
          </div>
          <FaGoogle className="h-6 w-6 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-500" />
                <span>Conectado ao Google Calendar</span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnectGoogle}
              >
                Desconectar
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-add" 
                checked={autoAddToCalendar}
                onCheckedChange={handleToggleAutoAdd}
              />
              <Label htmlFor="auto-add">Adicionar automaticamente novas reuniões ao calendário</Label>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <X className="h-5 w-5 text-red-500" />
              <span>Não conectado ao Google Calendar</span>
            </div>
            <Button
              onClick={handleConnectGoogle}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Conectando..." : "Conectar"}
            </Button>
          </div>
        )}
      </CardContent>
      {isConnected && meetingData && (
        <CardFooter className="border-t pt-3">
          <Button
            onClick={handleAddToCalendar}
            disabled={isLoading}
            className="w-full"
            variant="outline"
          >
            <Calendar className="h-4 w-4 mr-2" />
            {isLoading ? "Adicionando..." : "Adicionar esta reunião ao Google Calendar"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default GoogleCalendarIntegration;