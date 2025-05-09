import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card, CardContent } from '@/components/ui/card';
import { Info } from 'lucide-react';

// Componente principal da página
const CollaboratorsPage: React.FC = () => {
  return (
    <MainLayout>
      <PageWrapper 
        title="Colaboradores"
        description="Gerencie sua equipe de trabalho e acompanhe a carga horária e custos"
      >
        {/* Introdução */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-start gap-2">
              <Info size={20} className="text-[#FFD600] mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-lg">Entenda este passo:</h3>
                <p className="text-muted-foreground mt-2">
                  Aqui você vai cadastrar as pessoas que trabalham com você, como equipe fixa ou freelancers. 
                  A plataforma usa essas informações para calcular os custos do escritório e montar o valor certo dos seus projetos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conteúdo básico */}
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-lg">
              Página de Colaboradores
            </p>
            <p className="text-center text-muted-foreground mt-2">
              Esta é uma versão simplificada da página para demonstrar o PageWrapper
            </p>
          </CardContent>
        </Card>
      </PageWrapper>
    </MainLayout>
  );
};

export default CollaboratorsPage;