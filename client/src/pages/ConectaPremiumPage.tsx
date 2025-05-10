import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

// Componente principal da página ConectaPremium
export default function ConectaPremiumPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState('calc(100vh - 180px)');

  // Ajusta a altura do iframe baseado no tamanho da janela
  useEffect(() => {
    const handleResize = () => {
      setIframeHeight(`calc(100vh - 180px)`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Simula carregamento do iframe
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // URL da plataforma externa
  const platformUrl = 'https://conectaflix.greenn.club/home';

  return (
    <div className="container mx-auto px-4 py-6">
      <Helmet>
        <title>ConectaPremium | ConectaWorking</title>
        <meta 
          name="description" 
          content="Acesse cursos premium exclusivos para arquitetos e designers de interiores na plataforma ConectaPremium." 
        />
      </Helmet>

      <div className="flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-1">ConectaPremium</h1>
            <p className="text-muted-foreground">
              Cursos premium exclusivos para aprimorar seus conhecimentos
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Button
              variant="default"
              className="bg-primary hover:bg-primary/90"
              onClick={() => window.open('https://conectaflix.greenn.club/login', '_blank')}
            >
              <Star className="mr-2 h-4 w-4" />
              Acessar Área do Assinante
            </Button>
          </div>
        </div>

        <Card className="w-full overflow-hidden border border-border">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="w-full h-[60px]" />
                <Skeleton className="w-full h-[400px]" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="w-full h-[180px]" />
                  <Skeleton className="w-full h-[180px]" />
                  <Skeleton className="w-full h-[180px]" />
                </div>
              </div>
            ) : (
              <iframe
                src={platformUrl}
                title="ConectaPremium - Cursos Premium para profissionais"
                width="100%"
                height={iframeHeight}
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                loading="lazy"
              />
            )}
          </CardContent>
        </Card>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard 
            title="Conteúdo Exclusivo" 
            description="Acesse cursos e treinamentos exclusivos desenvolvidos pelos melhores profissionais do mercado."
            icon="✨"
          />
          <FeatureCard 
            title="Certificados Reconhecidos" 
            description="Obtenha certificados profissionais que valorizam seu currículo e demonstram seu conhecimento especializado."
            icon="🏆"
          />
          <FeatureCard 
            title="Comunidade Premium" 
            description="Conecte-se com outros profissionais e especialistas para networking e colaborações exclusivas."
            icon="👥"
          />
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar características do ConectaPremium
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}