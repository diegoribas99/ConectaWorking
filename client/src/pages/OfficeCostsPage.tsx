import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import PageWrapper from "@/components/layout/PageWrapper";
import {
  AlertTriangle,
  ArrowUp,
  DollarSign,
  FileText,
  HelpCircle,
  Info,
  Lightbulb,
  Pencil,
  Plus,
  Save,
  Trash2
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";

interface FixedCost {
  id: number;
  name: string;
  value: number;
  description: string | null;
}

interface VariableCost {
  id: number;
  name: string;
  value: number;
  description: string | null;
}

interface OfficeCost {
  id: number;
  userId: number;
  fixedCosts: FixedCost[];
  variableCosts: VariableCost[];
  technicalReservePercentage: number;
  lastUpdated: Date | null;
  productiveHoursPerMonth: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

import MainLayout from "@/components/layout/MainLayout";

export default function OfficeCostsPage() {
  const [officeCost, setOfficeCost] = useState<OfficeCost>({
    id: 1,
    userId: 1,
    fixedCosts: [],
    variableCosts: [],
    technicalReservePercentage: 15,
    lastUpdated: null,
    productiveHoursPerMonth: 168 // Padrão de 21 dias úteis × 8 horas
  });

  const [newFixedCost, setNewFixedCost] = useState<{ name: string; value: number; description: string | null }>({
    name: '',
    value: 0,
    description: ''
  });

  const [newVariableCost, setNewVariableCost] = useState<{ name: string; value: number; description: string | null }>({
    name: '',
    value: 0,
    description: ''
  });

  const [editingFixedCost, setEditingFixedCost] = useState<FixedCost | null>(null);
  const [editingVariableCost, setEditingVariableCost] = useState<VariableCost | null>(null);
  const [isExampleDialogOpen, setIsExampleDialogOpen] = useState(false);
  const [duplicateCostAlert, setDuplicateCostAlert] = useState({ show: false, name: '', isFixed: true });
  
  // Fetch office costs from API
  const { data, isLoading, isError } = useQuery({
    queryKey: ['/api/office-costs'],
    queryFn: async () => {
      return await apiRequest<OfficeCost>('/api/office-costs');
    }
  });

  const queryClient = useQueryClient();
  
  // Mutation for saving office costs
  const saveOfficeCostsMutation = useMutation({
    mutationFn: async (data: OfficeCost) => {
      return await apiRequest<OfficeCost>('/api/office-costs', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/office-costs'] });
    }
  });

  useEffect(() => {
    if (data) {
      console.log("Dados recebidos do backend:", data);
      
      // Converter os valores string do backend para arrays se necessário
      const formattedData = {
        ...data,
        fixedCosts: Array.isArray(data.fixedCosts) 
          ? data.fixedCosts 
          : [{ id: 1, name: 'Custos Fixos Totais', value: parseFloat(data.fixedCosts) || 0, description: null }],
        variableCosts: Array.isArray(data.variableCosts) 
          ? data.variableCosts 
          : [{ id: 1, name: 'Custos Variáveis Totais', value: parseFloat(data.variableCosts) || 0, description: null }],
        // Garantir que technicalReservePercentage existe
        technicalReservePercentage: data.technicalReservePercentage || 15,
        // Garantir que productiveHoursPerMonth existe
        productiveHoursPerMonth: data.productiveHoursPerMonth || 168
      };
      
      console.log("Dados formatados para o componente:", formattedData);
      setOfficeCost(formattedData);
    }
  }, [data]);

  const getTotalFixedCosts = () => {
    return officeCost.fixedCosts.reduce((total, cost) => total + cost.value, 0);
  };

  const getTotalVariableCosts = () => {
    return officeCost.variableCosts.reduce((total, cost) => total + cost.value, 0);
  };

  const getTotalCosts = () => {
    return getTotalFixedCosts() + getTotalVariableCosts();
  };

  const getTechnicalReserve = () => {
    return getTotalCosts() * (officeCost.technicalReservePercentage / 100);
  };

  const getTotalWithReserve = () => {
    return getTotalCosts() + getTechnicalReserve();
  };

  const getHourlyCost = () => {
    return officeCost.productiveHoursPerMonth > 0 
      ? getTotalWithReserve() / officeCost.productiveHoursPerMonth
      : 0;
  };

  const shouldRemindUpdate = () => {
    if (!officeCost.lastUpdated) return true;
    
    const lastUpdate = new Date(officeCost.lastUpdated);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return lastUpdate < threeMonthsAgo;
  };

  const addFixedCost = () => {
    if (!newFixedCost.name.trim()) return;
    
    // Verifique se já existe um custo com o mesmo nome
    if (officeCost.fixedCosts.some(cost => cost.name.toLowerCase() === newFixedCost.name.toLowerCase())) {
      setDuplicateCostAlert({
        show: true,
        name: newFixedCost.name,
        isFixed: true
      });
      return;
    }
    
    const newId = Math.max(0, ...officeCost.fixedCosts.map(cost => cost.id)) + 1;
    setOfficeCost({
      ...officeCost,
      fixedCosts: [
        ...officeCost.fixedCosts,
        { 
          id: newId, 
          name: newFixedCost.name, 
          value: newFixedCost.value, 
          description: newFixedCost.description 
        }
      ],
      lastUpdated: new Date()
    });
    
    setNewFixedCost({ name: '', value: 0, description: '' });
  };

  const addVariableCost = () => {
    if (!newVariableCost.name.trim()) return;
    
    // Verifique se já existe um custo com o mesmo nome
    if (officeCost.variableCosts.some(cost => cost.name.toLowerCase() === newVariableCost.name.toLowerCase())) {
      setDuplicateCostAlert({
        show: true,
        name: newVariableCost.name,
        isFixed: false
      });
      return;
    }
    
    const newId = Math.max(0, ...officeCost.variableCosts.map(cost => cost.id)) + 1;
    setOfficeCost({
      ...officeCost,
      variableCosts: [
        ...officeCost.variableCosts,
        { 
          id: newId, 
          name: newVariableCost.name, 
          value: newVariableCost.value, 
          description: newVariableCost.description 
        }
      ],
      lastUpdated: new Date()
    });
    
    setNewVariableCost({ name: '', value: 0, description: '' });
  };

  const removeFixedCost = (id: number) => {
    setOfficeCost({
      ...officeCost,
      fixedCosts: officeCost.fixedCosts.filter(cost => cost.id !== id),
      lastUpdated: new Date()
    });
  };

  const removeVariableCost = (id: number) => {
    setOfficeCost({
      ...officeCost,
      variableCosts: officeCost.variableCosts.filter(cost => cost.id !== id),
      lastUpdated: new Date()
    });
  };

  const startEditFixedCost = (cost: FixedCost) => {
    setEditingFixedCost(cost);
  };

  const startEditVariableCost = (cost: VariableCost) => {
    setEditingVariableCost(cost);
  };

  const saveEditFixedCost = () => {
    if (!editingFixedCost) return;
    
    setOfficeCost({
      ...officeCost,
      fixedCosts: officeCost.fixedCosts.map(cost => 
        cost.id === editingFixedCost.id ? editingFixedCost : cost
      ),
      lastUpdated: new Date()
    });
    
    setEditingFixedCost(null);
  };

  const saveEditVariableCost = () => {
    if (!editingVariableCost) return;
    
    setOfficeCost({
      ...officeCost,
      variableCosts: officeCost.variableCosts.map(cost => 
        cost.id === editingVariableCost.id ? editingVariableCost : cost
      ),
      lastUpdated: new Date()
    });
    
    setEditingVariableCost(null);
  };

  const saveAllChanges = () => {
    // Enviar os dados completos para o backend, incluindo os arrays de custos individuais
    // O backend calculará o total e armazenará os detalhes
    const dataToSave = {
      ...officeCost,
      fixedCosts: officeCost.fixedCosts, // Enviamos o array completo
      variableCosts: officeCost.variableCosts, // Enviamos o array completo
      productiveHoursPerMonth: officeCost.productiveHoursPerMonth,
      technicalReservePercentage: officeCost.technicalReservePercentage,
      lastUpdated: new Date()
    };
    
    saveOfficeCostsMutation.mutate(dataToSave);
  };

  const applyExamples = () => {
    setOfficeCost({
      ...officeCost,
      fixedCosts: [
        { id: 1, name: 'Aluguel', value: 3500, description: 'Escritório no centro comercial' },
        { id: 2, name: 'Internet', value: 250, description: 'Conexão de banda larga 500MB' },
        { id: 3, name: 'Água', value: 120, description: null },
        { id: 4, name: 'Energia', value: 380, description: null },
        { id: 5, name: 'Softwares', value: 890, description: 'Licenças de programas e serviços na nuvem' },
        { id: 6, name: 'Contador', value: 450, description: null },
      ],
      variableCosts: [
        { id: 1, name: 'Material de escritório', value: 250, description: 'Papéis, canetas, cartuchos de impressora' },
        { id: 2, name: 'Manutenção', value: 300, description: 'Reparos e manutenção de equipamentos' },
        { id: 3, name: 'Café e lanches', value: 180, description: 'Para equipe e clientes' },
        { id: 4, name: 'Produtos de limpeza', value: 120, description: null },
      ],
      technicalReservePercentage: 15,
      productiveHoursPerMonth: 168,
      lastUpdated: new Date()
    });
    
    setIsExampleDialogOpen(false);
  };

  const HeaderActions = () => {
    return (
      <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setIsExampleDialogOpen(true)}
        className="mr-2"
      >
        <Lightbulb size={16} className="mr-1" /> Ver Exemplo
      </Button>
      <Button 
        onClick={saveAllChanges} 
        size="sm"
        className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
        disabled={saveOfficeCostsMutation.isPending}
      >
        <Save size={16} className="mr-1" /> Salvar Custos
      </Button>
      </>
    );
  };

  return (
    <MainLayout>
      <PageWrapper 
        title="Custos do Escritório"
        description="Gerencie os custos fixos e variáveis do seu escritório para cálculos precisos em seus orçamentos"
        actions={<HeaderActions />}
      >
      {/* Introdução */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <Info size={20} className="text-[#FFD600] mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-lg">Entenda este passo:</h3>
              <p className="text-muted-foreground">
                Aqui você cadastra todos os custos mensais do seu escritório, tanto fixos quanto variáveis, 
                que são necessários para o funcionamento geral do seu negócio (e não de projetos específicos).
                Esses valores serão distribuídos automaticamente nos seus projetos, ajudando a calcular o 
                custo real por hora trabalhada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {shouldRemindUpdate() && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-6 flex items-center gap-3">
          <AlertTriangle size={20} className="text-amber-500" />
          <div>
            <p className="font-medium">Você não atualiza seus custos há mais de 3 meses.</p>
            <p className="text-sm text-muted-foreground">Recomendamos revisar os valores para manter seus orçamentos precisos.</p>
          </div>
          <Button 
            variant="outline" 
            className="ml-auto bg-amber-100 dark:bg-amber-900 border-amber-200 dark:border-amber-800"
          >
            Ignorar
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Custos Fixos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} className="text-[#FFD600]" /> 
              Custos Fixos Mensais
            </CardTitle>
            <CardDescription>
              Inclua despesas recorrentes como aluguel, internet, salários, contador e softwares.
              Não inclua itens pontuais ou ligados a um projeto específico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_120px_auto] gap-2 items-end">
                <div>
                  <label className="block text-sm mb-1">Nome do Custo</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                    placeholder="Ex: Aluguel"
                    value={newFixedCost.name}
                    onChange={(e) => setNewFixedCost({ ...newFixedCost, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    value={newFixedCost.value || ''}
                    onChange={(e) => setNewFixedCost({ ...newFixedCost, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <Button
                  onClick={addFixedCost}
                  className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                >
                  <Plus size={16} /> Adicionar
                </Button>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  placeholder="Descrição ou detalhes adicionais"
                  value={newFixedCost.description || ''}
                  onChange={(e) => setNewFixedCost({ ...newFixedCost, description: e.target.value })}
                />
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium mb-2">Custos Fixos Cadastrados</h4>
                {officeCost.fixedCosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum custo fixo cadastrado</p>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                    {officeCost.fixedCosts.map((cost) => (
                      <div 
                        key={cost.id} 
                        className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{cost.name}</div>
                          {cost.description && (
                            <div className="text-xs text-muted-foreground">{cost.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-right">
                            {formatCurrency(cost.value)}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => startEditFixedCost(cost)}
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => removeFixedCost(cost.id)}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Custos Variáveis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={18} className="text-[#FFD600]" /> 
              Custos Variáveis Estimados
            </CardTitle>
            <CardDescription>
              Use para itens que oscilam, mas que são do funcionamento do escritório, como café, material, manutenção interna.
              Não inclua deslocamentos, renderizações ou plotagens de um projeto específico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-[1fr_120px_auto] gap-2 items-end">
                <div>
                  <label className="block text-sm mb-1">Nome do Custo</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                    placeholder="Ex: Material de escritório"
                    value={newVariableCost.name}
                    onChange={(e) => setNewVariableCost({ ...newVariableCost, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Valor (R$)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                    placeholder="0,00"
                    min="0"
                    step="0.01"
                    value={newVariableCost.value || ''}
                    onChange={(e) => setNewVariableCost({ ...newVariableCost, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <Button
                  onClick={addVariableCost}
                  className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                >
                  <Plus size={16} /> Adicionar
                </Button>
              </div>
              
              <div>
                <label className="block text-sm mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  placeholder="Descrição ou detalhes adicionais"
                  value={newVariableCost.description || ''}
                  onChange={(e) => setNewVariableCost({ ...newVariableCost, description: e.target.value })}
                />
              </div>
              
              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium mb-2">Custos Variáveis Cadastrados</h4>
                {officeCost.variableCosts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhum custo variável cadastrado</p>
                ) : (
                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                    {officeCost.variableCosts.map((cost) => (
                      <div 
                        key={cost.id} 
                        className="flex items-center justify-between p-3 bg-black/5 dark:bg-white/5 rounded-md"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{cost.name}</div>
                          {cost.description && (
                            <div className="text-xs text-muted-foreground">{cost.description}</div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-right">
                            {formatCurrency(cost.value)}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => startEditVariableCost(cost)}
                            title="Editar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path><path d="m15 5 4 4"></path></svg>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                            onClick={() => removeVariableCost(cost.id)}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Configurações e resumo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUp size={18} className="text-[#FFD600]" /> 
            Configurações Adicionais
          </CardTitle>
          <CardDescription>
            Defina a reserva técnica e as horas produtivas para o cálculo do custo por hora do escritório.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Percentual de Reserva Técnica (%)
                <HelpCircle size={14} className="inline-block ml-1 text-muted-foreground" />
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                min="0"
                max="100"
                value={officeCost.technicalReservePercentage}
                onChange={(e) => setOfficeCost({
                  ...officeCost,
                  technicalReservePercentage: parseFloat(e.target.value) || 0
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Reserva para cobrir imprevistos e variações nos custos mensais.
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                Horas Produtivas por Mês
                <HelpCircle size={14} className="inline-block ml-1 text-muted-foreground" />
              </label>
              <input
                type="number"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                min="1"
                max="744"
                value={officeCost.productiveHoursPerMonth}
                onChange={(e) => setOfficeCost({
                  ...officeCost,
                  productiveHoursPerMonth: parseFloat(e.target.value) || 1
                })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Horas reais trabalhadas por toda equipe fixa (não inclui terceirizados).
              </p>
            </div>
          </div>
          
          {/* Resumo dos custos */}
          <div className="border border-border rounded-lg p-4 mb-4">
            <h3 className="font-medium text-lg mb-4">Resumo dos Custos</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Custos Fixos:</span>
                <span className="font-medium">{formatCurrency(getTotalFixedCosts())}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Custos Variáveis:</span>
                <span className="font-medium">{formatCurrency(getTotalVariableCosts())}</span>
              </div>
              
              <div className="border-t border-border my-2 pt-2 flex justify-between">
                <span>Total de Custos Mensais:</span>
                <span className="font-medium">{formatCurrency(getTotalCosts())}</span>
              </div>
              
              <div className="flex justify-between">
                <span>Reserva Técnica ({officeCost.technicalReservePercentage}%):</span>
                <span className="font-medium">{formatCurrency(getTechnicalReserve())}</span>
              </div>
              
              <div className="border-t border-border my-2 pt-2 flex justify-between font-medium">
                <span>Total Final Mensal:</span>
                <span>{formatCurrency(getTotalWithReserve())}</span>
              </div>
              
              <div className="flex justify-between font-bold text-[#FFD600]">
                <span>Custo por Hora do Escritório:</span>
                <span>{formatCurrency(getHourlyCost())}/hora</span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={saveAllChanges}
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              disabled={saveOfficeCostsMutation.isPending}
            >
              <Save size={18} className="mr-2" /> Salvar Todas as Alterações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de exemplos */}
      <Dialog open={isExampleDialogOpen} onOpenChange={setIsExampleDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Exemplo de Custos do Escritório</DialogTitle>
            <DialogDescription>
              Veja uma simulação completa de custos para um escritório de arquitetura fictício.
              Você pode aplicar este exemplo para começar a personalizar seus próprios custos.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Exemplos de Custos Fixos</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Aluguel</span>
                  <span className="font-medium">R$ 3.500,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Internet</span>
                  <span className="font-medium">R$ 250,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Água</span>
                  <span className="font-medium">R$ 120,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Energia</span>
                  <span className="font-medium">R$ 380,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Softwares</span>
                  <span className="font-medium">R$ 890,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Contador</span>
                  <span className="font-medium">R$ 450,00</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Exemplos de Custos Variáveis</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Material de escritório</span>
                  <span className="font-medium">R$ 250,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Manutenção</span>
                  <span className="font-medium">R$ 300,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Café e lanches</span>
                  <span className="font-medium">R$ 180,00</span>
                </div>
                <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                  <span>Produtos de limpeza</span>
                  <span className="font-medium">R$ 120,00</span>
                </div>
              </div>
              
              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">Configurações</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                    <span>Reserva Técnica</span>
                    <span className="font-medium">15%</span>
                  </div>
                  <div className="flex justify-between text-sm p-2 bg-black/5 dark:bg-white/5 rounded">
                    <span>Horas produtivas</span>
                    <span className="font-medium">168 horas/mês</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#FFD600]/10 p-4 rounded-md mt-4">
            <div className="flex justify-between">
              <span className="font-medium">Total de Custos:</span>
              <span className="font-medium">R$ 6.440,00</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Reserva Técnica (15%):</span>
              <span className="font-medium">R$ 966,00</span>
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Total Final:</span>
              <span>R$ 7.406,00</span>
            </div>
            <div className="flex justify-between font-bold text-[#FFD600] mt-2">
              <span>Custo por hora:</span>
              <span>R$ 44,08/hora</span>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsExampleDialogOpen(false)}
            >
              Fechar
            </Button>
            <Button
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={applyExamples}
            >
              Aplicar Exemplos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de alerta de custo duplicado */}
      <Dialog open={duplicateCostAlert.show} onOpenChange={(open) => !open && setDuplicateCostAlert({ show: false, name: '', isFixed: true })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Item já cadastrado</DialogTitle>
            <DialogDescription>
              Um custo com o nome "{duplicateCostAlert.name}" já foi adicionado anteriormente.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => setDuplicateCostAlert({ show: false, name: '', isFixed: true })}
            >
              Voltar e Editar
            </Button>
            <Button
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={() => {
                // Adicionar mesmo com nome duplicado
                if (duplicateCostAlert.isFixed) {
                  const newId = Math.max(0, ...officeCost.fixedCosts.map(c => c.id)) + 1;
                  setOfficeCost(prev => ({
                    ...prev,
                    fixedCosts: [
                      ...prev.fixedCosts,
                      { id: newId, name: newFixedCost.name, value: newFixedCost.value, description: newFixedCost.description }
                    ],
                    lastUpdated: new Date()
                  }));
                  setNewFixedCost({ name: '', value: 0, description: '' });
                } else {
                  const newId = Math.max(0, ...officeCost.variableCosts.map(c => c.id)) + 1;
                  setOfficeCost(prev => ({
                    ...prev,
                    variableCosts: [
                      ...prev.variableCosts,
                      { id: newId, name: newVariableCost.name, value: newVariableCost.value, description: newVariableCost.description }
                    ],
                    lastUpdated: new Date()
                  }));
                  setNewVariableCost({ name: '', value: 0, description: '' });
                }
                setDuplicateCostAlert({ show: false, name: '', isFixed: true });
              }}
            >
              Manter os Dois
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de edição de custo fixo */}
      <Dialog open={!!editingFixedCost} onOpenChange={(open) => !open && setEditingFixedCost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Custo Fixo</DialogTitle>
            <DialogDescription>
              Atualize as informações do custo fixo abaixo.
            </DialogDescription>
          </DialogHeader>
          
          {editingFixedCost && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Custo</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  value={editingFixedCost.name}
                  onChange={(e) => setEditingFixedCost({...editingFixedCost, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  min="0"
                  step="0.01"
                  value={editingFixedCost.value}
                  onChange={(e) => setEditingFixedCost({...editingFixedCost, value: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  value={editingFixedCost.description || ''}
                  onChange={(e) => setEditingFixedCost({...editingFixedCost, description: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFixedCost(null)}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={saveEditFixedCost}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Dialog de edição de custo variável */}
      <Dialog open={!!editingVariableCost} onOpenChange={(open) => !open && setEditingVariableCost(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Custo Variável</DialogTitle>
            <DialogDescription>
              Atualize as informações do custo variável abaixo.
            </DialogDescription>
          </DialogHeader>
          
          {editingVariableCost && (
            <div className="space-y-4 py-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Custo</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  value={editingVariableCost.name}
                  onChange={(e) => setEditingVariableCost({...editingVariableCost, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  min="0"
                  step="0.01"
                  value={editingVariableCost.value}
                  onChange={(e) => setEditingVariableCost({...editingVariableCost, value: parseFloat(e.target.value) || 0})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Descrição (opcional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                  value={editingVariableCost.description || ''}
                  onChange={(e) => setEditingVariableCost({...editingVariableCost, description: e.target.value})}
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingVariableCost(null)}>
              Cancelar
            </Button>
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={saveEditVariableCost}
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageWrapper>
  </MainLayout>
  );
}