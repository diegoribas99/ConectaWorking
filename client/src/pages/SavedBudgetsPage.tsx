import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Loader, Plus, Calendar, ArrowRight, FolderOpen } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

interface Budget {
  id: number;
  name: string;
  projectType: string;
  area: number;
  city: string;
  deliveryLevel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const SavedBudgetsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'drafts' | 'final'>('all');
  
  const { data: budgets = [], isLoading, error } = useQuery<Budget[]>({
    queryKey: ['/api/users/1/budgets'],
    retry: 1,
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  const getProjectTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'residential': 'Residencial',
      'commercial': 'Comercial',
      'corporate': 'Corporativo',
      'retail': 'Loja/Varejo',
      'hospitality': 'Hotelaria',
    };
    return typeMap[type] || type;
  };

  const getDeliveryLevelName = (level: string) => {
    const levelMap: Record<string, string> = {
      'basic': 'Básico',
      'executive': 'Executivo',
      'premium': 'Premium',
    };
    return levelMap[level] || level;
  };

  const filteredBudgets = budgets.filter(budget => {
    if (activeTab === 'all') return true;
    if (activeTab === 'drafts') return budget.status === 'draft';
    if (activeTab === 'final') return budget.status === 'final';
    return true;
  });

  return (
    <MainLayout>
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Orçamentos Salvos</h1>
        <div className="flex items-center space-x-4 border-b border-border">
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
            onClick={() => setActiveTab('all')}
          >
            Todos
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'drafts' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
            onClick={() => setActiveTab('drafts')}
          >
            Rascunhos
          </button>
          <button 
            className={`px-4 py-2 font-medium ${activeTab === 'final' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground transition-colors'}`}
            onClick={() => setActiveTab('final')}
          >
            Finalizados
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : error ? (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>Erro ao carregar orçamentos. Por favor, tente novamente.</p>
        </div>
      ) : filteredBudgets.length === 0 ? (
        <div className="bg-background/60 rounded-lg shadow-sm p-8 text-center">
          <div className="mb-4 text-muted-foreground">
            <FolderOpen className="h-16 w-16 mx-auto text-muted-foreground/70" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum orçamento encontrado</h3>
          <p className="text-muted-foreground mb-6">
            {activeTab === 'all' 
              ? 'Você ainda não criou nenhum orçamento.' 
              : activeTab === 'drafts' 
                ? 'Você não tem rascunhos salvos.'
                : 'Você não tem orçamentos finalizados.'}
          </p>
          <Link href="/budget/new">
            <div className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md inline-flex items-center cursor-pointer hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4 mr-2" /> Criar Novo Orçamento
            </div>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBudgets.map(budget => (
            <div key={budget.id} className="bg-background/60 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow border border-border/50">
              <Link href={`/budget/${budget.id}`}>
                <div className="block cursor-pointer">
                  <div className="p-5 flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{budget.name}</h3>
                      <div className="text-sm text-muted-foreground mb-2">
                        <span className="mr-3">{getProjectTypeName(budget.projectType)}</span>
                        {budget.area > 0 && <span className="mr-3">{budget.area} m²</span>}
                        <span>{getDeliveryLevelName(budget.deliveryLevel)}</span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${budget.status === 'draft' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-green-500/10 text-green-500'}`}>
                        {budget.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                      </span>
                    </div>
                  </div>
                  <div className="px-5 py-3 bg-secondary/50 flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {formatDate(budget.updatedAt)}
                    </span>
                    <div className="text-primary flex items-center hover:text-primary/80 transition-colors">
                      Ver detalhes <ArrowRight className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filteredBudgets.length > 0 && (
        <div className="mt-8 text-center">
          <Link href="/budget/new">
            <div className="px-5 py-3 bg-primary text-primary-foreground font-medium rounded-md inline-flex items-center shadow-sm cursor-pointer hover:bg-primary/90 transition-colors">
              <Plus className="h-4 w-4 mr-2" /> Criar Novo Orçamento
            </div>
          </Link>
        </div>
      )}
    </MainLayout>
  );
};

export default SavedBudgetsPage;