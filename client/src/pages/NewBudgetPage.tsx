import React from 'react';
import NewBudgetForm from '@/components/pricing/NewBudgetForm';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Save, Copy, Send, FileDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const NewBudgetPage: React.FC = () => {
  const { toast } = useToast();
  
  const handleSaveDraft = () => {
    toast({
      title: "Rascunho salvo",
      description: "Seu orçamento foi salvo como rascunho com sucesso.",
    });
  };

  const handleDuplicate = () => {
    toast({
      title: "Usar orçamento anterior",
      description: "Selecione um orçamento anterior para duplicar.",
    });
  };

  const handleExportPDF = () => {
    toast({
      title: "Exportar PDF",
      description: "Seu orçamento está sendo exportado como PDF.",
    });
  };

  const handleSendEmail = () => {
    toast({
      title: "Enviar por e-mail",
      description: "Abrindo opções para envio por e-mail.",
    });
  };

  const handleSendWhatsApp = () => {
    toast({
      title: "Enviar por WhatsApp",
      description: "Abrindo opções para envio por WhatsApp.",
    });
  };

  return (
    <MainLayout>
      <div className="flex flex-col">
        <header className="px-6 py-4 border-b border-border bg-background">
          <div className="container mx-auto">
            <div className="text-xl font-semibold flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h1>Novo Orçamento</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Preencha as informações necessárias para criar um novo orçamento
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={handleDuplicate}
                >
                  <Copy className="h-4 w-4" /> Usar orçamento anterior
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex items-center gap-2"
                  onClick={handleSaveDraft}
                >
                  <Save className="h-4 w-4" /> Salvar Rascunho
                </Button>
              </div>
            </div>
          </div>
        </header>
        
        <div className="p-6 bg-secondary/30">
          <div className="mx-auto max-w-4xl space-y-8">
            <NewBudgetForm />
            
            {/* Ações Finais */}
            <div className="bg-card p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-xl font-medium mb-6">Ações Finais</h2>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="default" 
                  className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                  onClick={handleExportPDF}
                >
                  <FileDown className="h-4 w-4 mr-2" /> Exportar PDF
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSendEmail}
                >
                  <Send className="h-4 w-4 mr-2" /> Enviar por E-mail
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleSendWhatsApp}
                >
                  <Send className="h-4 w-4 mr-2" /> Enviar por WhatsApp
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default NewBudgetPage;
