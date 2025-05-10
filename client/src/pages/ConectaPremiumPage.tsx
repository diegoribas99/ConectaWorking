import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

// Componente principal da página ConectaPremium
export default function ConectaPremiumPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState('calc(100vh - 64px)'); // Altura ajustada para a altura da viewport menos o header

  // Ajusta a altura do iframe baseado no tamanho da janela
  useEffect(() => {
    const handleResize = () => {
      setIframeHeight(`calc(100vh - 64px)`); // 64px é a altura aproximada do header
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
    <>
      <Helmet>
        <title>ConectaPremium | ConectaWorking</title>
        <meta 
          name="description" 
          content="Acesse cursos premium exclusivos para arquitetos e designers de interiores na plataforma ConectaPremium." 
        />
      </Helmet>

      {isLoading ? (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full max-w-7xl space-y-4 p-4">
            <Skeleton className="w-full h-[60px]" />
            <Skeleton className="w-full h-[calc(100vh-200px)]" />
          </div>
        </div>
      ) : (
        <iframe
          src={platformUrl}
          title="ConectaPremium - Cursos Premium para profissionais"
          width="100%"
          height={iframeHeight}
          style={{ border: 'none', display: 'block' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          loading="lazy"
        />
      )}
    </>
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