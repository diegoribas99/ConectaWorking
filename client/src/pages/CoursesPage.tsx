import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const COURSE_PLATFORM_URL = "https://siteparaeditar.conectaflix.com.br/";

const CoursesPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState<number>(800);

  useEffect(() => {
    // Ajustar a altura do iframe com base na altura da janela
    const updateIframeHeight = () => {
      // Deixa um espaço para o header e outras partes da UI
      const newHeight = window.innerHeight - 120;
      setIframeHeight(Math.max(newHeight, 600)); // Altura mínima de 600px
    };

    // Atualizar tamanho inicialmente e em cada redimensionamento
    updateIframeHeight();
    window.addEventListener("resize", updateIframeHeight);

    // Simular tempo de carregamento
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateIframeHeight);
    };
  }, []);

  const handleExternalOpen = () => {
    window.open(COURSE_PLATFORM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <Helmet>
        <title>Cursos | ConectaWorking</title>
        <meta name="description" content="Plataforma de cursos da ConectaWorking para arquitetos e designers" />
      </Helmet>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Cursos</h1>
          <p className="text-muted-foreground mt-1">
            Acesse nossa plataforma de cursos e capacitações
          </p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-1" 
          onClick={handleExternalOpen}>
          <ExternalLink size={16} />
          <span>Abrir em nova aba</span>
        </Button>
      </div>

      <Card className="overflow-hidden border shadow-sm bg-background">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-96 w-full" />
              <div className="flex space-x-4">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          ) : (
            <iframe
              src={COURSE_PLATFORM_URL}
              title="Plataforma de Cursos ConectaWorking"
              width="100%"
              height={iframeHeight}
              className="border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              loading="lazy"
            />
          )}
        </CardContent>
      </Card>
      
      <div className="mt-6 text-sm text-muted-foreground">
        <p>© ConectaWorking - Plataforma integrada de cursos</p>
      </div>
    </div>
  );
};

export default CoursesPage;