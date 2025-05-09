import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Trash2, Info, Calculator, Clock, AlertTriangle,
  DollarSign, FileText, HelpCircle, Save
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { formatCurrency } from '@/lib/utils';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

// Interface para os custos do escritório
interface OfficeCost {
  id: number;
  userId: number;
  fixedCosts: FixedCost[];
  variableCosts: VariableCost[];
  technicalReservePercentage: number;
  lastUpdated: Date | null;
  productiveHoursPerMonth: number;
}

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

// Componente principal
const OfficeCostsPage: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isExampleDialogOpen, setIsExampleDialogOpen] = useState(false);
  const [duplicateCostAlert, setDuplicateCostAlert] = useState<{ show: boolean; name: string; isFixed: boolean }>({ 
    show: false, name: '', isFixed: true 
  });

  // Estado para os custos do escritório
  const [officeCost, setOfficeCost] = useState<OfficeCost>({
    id: 0,
    userId: 0,
    fixedCosts: [],
    variableCosts: [],
    technicalReservePercentage: 10,
    lastUpdated: null,
    productiveHoursPerMonth: 160
  });

  // Estado para o novo custo fixo
  const [newFixedCost, setNewFixedCost] = useState<Omit<FixedCost, 'id'>>({
    name: '',
    value: 0,
    description: ''
  });

  // Estado para o novo custo variável
  const [newVariableCost, setNewVariableCost] = useState<Omit<VariableCost, 'id'>>({
    name: '',
    value: 0,
    description: ''
  });

  // Fetch dos custos do escritório
  const { data: fetchedOfficeCost, isLoading } = useQuery({
    queryKey: ['/api/office-costs'],
    queryFn: async () => {
      try {
        return await apiRequest<OfficeCost>('/api/office-costs');
      } catch (error) {
        console.error('Erro ao buscar custos do escritório:', error);
        // Criar custos padrão se não existirem
        return null;
      }
    }
  });

  // Mutation para salvar os custos do escritório
  const { mutate: saveOfficeCost, isPending: isSaving } = useMutation({
    mutationFn: async (data: OfficeCost) => {
      return await apiRequest<OfficeCost>('/api/office-costs', {
        method: 'POST',
        body: data
      });
    },
    onSuccess: () => {
      toast({
        title: 'Custos do escritório salvos com sucesso!',
        description: 'Os valores foram atualizados e serão aplicados nos seus orçamentos.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/office-costs'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar custos',
        description: 'Ocorreu um erro ao salvar os custos do escritório. Tente novamente.',
        variant: 'destructive',
      });
      console.error('Erro ao salvar custos:', error);
    }
  });

  // Atualizar state quando os dados forem buscados
  useEffect(() => {
    if (fetchedOfficeCost) {
      setOfficeCost(fetchedOfficeCost);
    }
  }, [fetchedOfficeCost]);

  // Verificar se um custo com o mesmo nome já existe
  const checkDuplicateCost = (name: string, isFixed: boolean): boolean => {
    const costsList = isFixed ? officeCost.fixedCosts : officeCost.variableCosts;
    const isDuplicate = costsList.some(cost => cost.name.toLowerCase() === name.toLowerCase());
    
    if (isDuplicate) {
      setDuplicateCostAlert({ show: true, name, isFixed });
      return true;
    }
    return false;
  };

  // Adicionar um novo custo fixo
  const addFixedCost = () => {
    if (!newFixedCost.name) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe um nome para o custo fixo.',
        variant: 'destructive',
      });
      return;
    }

    if (checkDuplicateCost(newFixedCost.name, true)) {
      return;
    }

    const newId = Math.max(0, ...officeCost.fixedCosts.map(c => c.id)) + 1;
    
    setOfficeCost(prev => ({
      ...prev,
      fixedCosts: [
        ...prev.fixedCosts,
        { id: newId, ...newFixedCost }
      ],
      lastUpdated: new Date()
    }));

    setNewFixedCost({ name: '', value: 0, description: '' });
  };

  // Adicionar um novo custo variável
  const addVariableCost = () => {
    if (!newVariableCost.name) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe um nome para o custo variável.',
        variant: 'destructive',
      });
      return;
    }

    if (checkDuplicateCost(newVariableCost.name, false)) {
      return;
    }

    const newId = Math.max(0, ...officeCost.variableCosts.map(c => c.id)) + 1;
    
    setOfficeCost(prev => ({
      ...prev,
      variableCosts: [
        ...prev.variableCosts,
        { id: newId, ...newVariableCost }
      ],
      lastUpdated: new Date()
    }));

    setNewVariableCost({ name: '', value: 0, description: '' });
  };

  // Remover um custo fixo
  const removeFixedCost = (id: number) => {
    setOfficeCost(prev => ({
      ...prev,
      fixedCosts: prev.fixedCosts.filter(cost => cost.id !== id),
      lastUpdated: new Date()
    }));
  };

  // Remover um custo variável
  const removeVariableCost = (id: number) => {
    setOfficeCost(prev => ({
      ...prev,
      variableCosts: prev.variableCosts.filter(cost => cost.id !== id),
      lastUpdated: new Date()
    }));
  };

  // Atualizar a porcentagem de reserva técnica
  const handleTechnicalReserveChange = (value: string) => {
    const percentage = parseFloat(value);
    if (!isNaN(percentage) && percentage >= 0 && percentage <= 100) {
      setOfficeCost(prev => ({
        ...prev,
        technicalReservePercentage: percentage,
        lastUpdated: new Date()
      }));
    }
  };

  // Atualizar as horas produtivas por mês
  const handleProductiveHoursChange = (value: string) => {
    const hours = parseInt(value);
    if (!isNaN(hours) && hours > 0) {
      setOfficeCost(prev => ({
        ...prev,
        productiveHoursPerMonth: hours,
        lastUpdated: new Date()
      }));
    }
  };

  // Salvar os custos do escritório
  const handleSaveOfficeCosts = () => {
    saveOfficeCost(officeCost);
  };

  // Mostrar exemplos de custos
  const showExamples = () => {
    setIsExampleDialogOpen(true);
  };

  // Aplicar exemplos de custos
  const applyExamples = () => {
    const exampleFixedCosts = [
      { id: 1, name: 'Aluguel', value: 3500, description: 'Aluguel do espaço físico' },
      { id: 2, name: 'Internet', value: 250, description: 'Plano de internet 500mb' },
      { id: 3, name: 'Água', value: 120, description: 'Conta de água mensal' },
      { id: 4, name: 'Energia', value: 380, description: 'Conta de energia elétrica' },
      { id: 5, name: 'Softwares', value: 890, description: 'Assinaturas de softwares' },
      { id: 6, name: 'Contador', value: 450, description: 'Serviços de contabilidade' }
    ];

    const exampleVariableCosts = [
      { id: 1, name: 'Material de escritório', value: 250, description: 'Papel, canetas, etc.' },
      { id: 2, name: 'Manutenção', value: 300, description: 'Manutenção geral' },
      { id: 3, name: 'Café e lanches', value: 180, description: 'Para equipe e clientes' },
      { id: 4, name: 'Produtos de limpeza', value: 120, description: 'Materiais para limpeza' }
    ];

    setOfficeCost(prev => ({
      ...prev,
      fixedCosts: exampleFixedCosts,
      variableCosts: exampleVariableCosts,
      technicalReservePercentage: 15,
      productiveHoursPerMonth: 168,
      lastUpdated: new Date()
    }));

    setIsExampleDialogOpen(false);
    
    toast({
      title: 'Exemplos aplicados',
      description: 'Os valores de exemplo foram aplicados. Você pode editá-los conforme necessário.',
      variant: 'default',
    });
  };

  // Cálculos finais
  const totalFixedCosts = officeCost.fixedCosts.reduce((sum, cost) => sum + cost.value, 0);
  const totalVariableCosts = officeCost.variableCosts.reduce((sum, cost) => sum + cost.value, 0);
  const totalBeforeReserve = totalFixedCosts + totalVariableCosts;
  const technicalReserveAmount = (totalBeforeReserve * officeCost.technicalReservePercentage) / 100;
  const totalFinalCost = totalBeforeReserve + technicalReserveAmount;
  
  // Custo por hora do escritório
  const costPerHour = officeCost.productiveHoursPerMonth > 0 
    ? totalFinalCost / officeCost.productiveHoursPerMonth 
    : 0;

  // Verificar se os custos foram atualizados recentemente
  const shouldRemindUpdate = () => {
    if (!officeCost.lastUpdated) return false;
    
    const lastUpdate = new Date(officeCost.lastUpdated);
    const now = new Date();
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return lastUpdate < threeMonthsAgo;
  };

  // Formatação da última atualização
  const formatLastUpdated = () => {
    if (!officeCost.lastUpdated) return 'Nunca atualizado';
    
    const lastUpdate = new Date(officeCost.lastUpdated);
    return lastUpdate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">Custos do Escritório</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie os custos fixos e variáveis do seu escritório para cálculos precisos em seus orçamentos
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={showExamples}
              variant="outline"
              className="gap-1"
            >
              <HelpCircle size={16} /> Ver Exemplo Completo
            </Button>
            <Button
              onClick={handleSaveOfficeCosts}
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              disabled={isSaving}
            >
              <Save size={16} className="mr-1" /> Salvar Custos
            </Button>
          </div>
        </div>

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
                              onClick={() => removeFixedCost(cost.id)}
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
                              onClick={() => removeVariableCost(cost.id)}
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

        {/* Configurações Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator size={18} className="text-[#FFD600]" /> 
                Reserva Técnica (opcional)
              </CardTitle>
              <CardDescription>
                Uma margem de segurança para cobrir o tempo ocioso, imprevistos ou projetos não fechados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">% de Reserva Técnica</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                      placeholder="10"
                      min="0"
                      max="100"
                      step="1"
                      value={officeCost.technicalReservePercentage || ''}
                      onChange={(e) => handleTechnicalReserveChange(e.target.value)}
                    />
                    <span className="ml-2">%</span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Valor adicional de segurança sobre o total (ex: 10%)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={18} className="text-[#FFD600]" /> 
                Horas Produtivas
              </CardTitle>
              <CardDescription>
                Número de horas produtivas mensais do escritório para distribuição dos custos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm mb-1">Horas produtivas por mês</label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                      placeholder="160"
                      min="1"
                      step="1"
                      value={officeCost.productiveHoursPerMonth || ''}
                      onChange={(e) => handleProductiveHoursChange(e.target.value)}
                    />
                    <span className="ml-2">horas</span>
                  </div>
                  <p className="text-sm mt-1 text-muted-foreground">
                    Total de horas produtivas do escritório por mês (ex: 160 horas = 4 pessoas × 40h semanais)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resultado Final */}
        <Card className="bg-[#FFD600]/5 border-[#FFD600]/20">
          <CardHeader>
            <CardTitle>Resultado Final</CardTitle>
            <CardDescription>
              Resumo dos custos do escritório calculados automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de Custos Fixos:</span>
                    <span className="font-medium">{formatCurrency(totalFixedCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total de Custos Variáveis:</span>
                    <span className="font-medium">{formatCurrency(totalVariableCosts)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Reserva Técnica Aplicada ({officeCost.technicalReservePercentage}%):</span>
                    <span className="font-medium">{formatCurrency(technicalReserveAmount)}</span>
                  </div>
                </div>
                
                <div className="bg-[#FFD600]/10 p-4 rounded-md flex flex-col justify-center">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Total Final do Escritório:</span>
                    <span className="font-bold text-lg">{formatCurrency(totalFinalCost)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex items-center">
                      <span className="font-medium">Custo médio por hora do escritório:</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info size={14} className="ml-1 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Este valor será usado como base para calcular os custos fixos + variáveis mensais 
                              em todos os seus projetos, distribuído pelo tempo dedicado.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <span className="font-bold text-lg text-[#FFD600]">{formatCurrency(costPerHour)}/hora</span>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-2 border-t border-border pt-2 flex justify-between">
                <div>Última atualização: {formatLastUpdated()}</div>
                <div>
                  {officeCost.productiveHoursPerMonth > 0 
                    ? `Baseado em ${officeCost.productiveHoursPerMonth} horas produtivas mensais`
                    : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
    </MainLayout>
  );
};

export default OfficeCostsPage;