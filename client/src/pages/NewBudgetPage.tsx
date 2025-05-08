import React from 'react';
import NewBudgetForm from '@/components/pricing/NewBudgetForm';
import { useToast } from '@/hooks/use-toast';

const NewBudgetPage: React.FC = () => {
  const { toast } = useToast();
  
  const handleSaveDraft = () => {
    toast({
      title: "Rascunho salvo",
      description: "Seu orçamento foi salvo como rascunho com sucesso.",
    });
  };

  return (
    <div>
      <header className="hidden md:block px-6 py-4 border-b border-border">
        <div className="text-xl font-semibold flex justify-between items-center">
          <h1>Novo Orçamento</h1>
          <button 
            className="px-4 py-2 bg-secondary text-sm font-medium rounded-md hover:bg-muted transition flex items-center gap-2"
            onClick={handleSaveDraft}
          >
            <i className="fa-solid fa-floppy-disk"></i> Salvar Rascunho
          </button>
        </div>
      </header>
      <div className="bg-secondary min-h-[calc(100vh-4rem)]">
        <NewBudgetForm />
      </div>
    </div>
  );
};

export default NewBudgetPage;
