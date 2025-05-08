import React, { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

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
    <div className="bg-secondary min-h-screen">
      <div className="container mx-auto max-w-5xl py-6 px-4">
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Orçamentos Salvos</h1>
          <div className="flex items-center space-x-4 border-b border-border">
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'all' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('all')}
            >
              Todos
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'drafts' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('drafts')}
            >
              Rascunhos
            </button>
            <button 
              className={`px-4 py-2 font-medium ${activeTab === 'final' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
              onClick={() => setActiveTab('final')}
            >
              Finalizados
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-primary">
              <i className="fa-solid fa-circle-notch fa-spin text-4xl"></i>
            </div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p>Erro ao carregar orçamentos. Por favor, tente novamente.</p>
          </div>
        ) : filteredBudgets.length === 0 ? (
          <div className="bg-background rounded-lg shadow-sm p-8 text-center">
            <div className="mb-4 text-muted-foreground">
              <i className="fa-solid fa-folder-open text-6xl"></i>
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
              <a className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md inline-flex items-center">
                <i className="fa-solid fa-plus mr-2"></i> Criar Novo Orçamento
              </a>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBudgets.map(budget => (
              <div key={budget.id} className="bg-background rounded-lg shadow-sm overflow-hidden hover:shadow-md transition">
                <Link href={`/budget/${budget.id}`}>
                  <a className="block">
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
                        <span className={`px-2 py-1 text-xs rounded-full ${budget.status === 'draft' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'}`}>
                          {budget.status === 'draft' ? 'Rascunho' : 'Finalizado'}
                        </span>
                      </div>
                    </div>
                    <div className="px-5 py-3 bg-secondary flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        <i className="fa-regular fa-calendar mr-1"></i> {formatDate(budget.updatedAt)}
                      </span>
                      <div className="text-muted-foreground hover:text-foreground transition">
                        Ver detalhes <i className="fa-solid fa-arrow-right ml-1"></i>
                      </div>
                    </div>
                  </a>
                </Link>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filteredBudgets.length > 0 && (
          <div className="mt-6 text-center">
            <Link href="/budget/new">
              <a className="px-4 py-2 bg-primary text-primary-foreground font-medium rounded-md inline-flex items-center">
                <i className="fa-solid fa-plus mr-2"></i> Criar Novo Orçamento
              </a>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedBudgetsPage;
