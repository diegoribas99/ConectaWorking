import React, { useEffect } from 'react';
import { OfficeCostType } from '@/lib/useBudgetCalculator';
import AIInsightBox from './AIInsightBox';
import { useLocation } from 'wouter';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Settings, Clock2, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OfficeCostsProps {
  officeCost: OfficeCostType;
  updateOfficeCost: (cost: Partial<OfficeCostType>) => void;
  hourlyRate: number;
  projectHours: number;
  totalOfficeCost: number;
  formatCurrency: (value: number) => string;
}

const OfficeCosts: React.FC<OfficeCostsProps> = ({
  officeCost,
  updateOfficeCost,
  hourlyRate,
  projectHours,
  totalOfficeCost,
  formatCurrency,
}) => {
  const [, navigate] = useLocation();

  // Buscar os dados dos colaboradores para calcular as horas produtivas
  const { data: collaborators } = useQuery({
    queryKey: ['/api/users/1/collaborators'],
    queryFn: async () => {
      try {
        return await apiRequest<any[]>('/api/users/1/collaborators');
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
        return [];
      }
    }
  });

  // Buscar os custos do escritório
  const { data: officeCostData } = useQuery({
    queryKey: ['/api/office-costs'],
    queryFn: async () => {
      try {
        return await apiRequest<any>('/api/office-costs');
      } catch (error) {
        console.error('Erro ao buscar custos do escritório:', error);
        return null;
      }
    }
  });

  // Atualizar os custos fixos e variáveis quando os dados forem carregados
  useEffect(() => {
    if (officeCostData) {
      // Se fixedCosts e variableCosts são arrays, calcular a soma dos valores
      let fixedCostsTotal = 0;
      let variableCostsTotal = 0;

      if (Array.isArray(officeCostData.fixedCosts)) {
        fixedCostsTotal = officeCostData.fixedCosts.reduce(
          (sum, cost) => sum + (Number(cost.value) || 0), 0
        );
      } else if (typeof officeCostData.fixedCosts === 'string') {
        fixedCostsTotal = Number(officeCostData.fixedCosts) || 0;
      }

      if (Array.isArray(officeCostData.variableCosts)) {
        variableCostsTotal = officeCostData.variableCosts.reduce(
          (sum, cost) => sum + (Number(cost.value) || 0), 0
        );
      } else if (typeof officeCostData.variableCosts === 'string') {
        variableCostsTotal = Number(officeCostData.variableCosts) || 0;
      }

      updateOfficeCost({
        fixedCosts: fixedCostsTotal,
        variableCosts: variableCostsTotal,
        productiveHoursMonth: officeCostData.productiveHoursMonth || 160
      });
    }
  }, [officeCostData, updateOfficeCost]);

  // Calcular horas produtivas com base nos colaboradores
  useEffect(() => {
    if (collaborators && collaborators.length > 0) {
      // Calcular o total de horas produtivas mensais com base nos colaboradores fixos
      const totalHours = collaborators.reduce((total, collab) => {
        if (collab.isFixed) {
          // Consideramos dias úteis × horas por dia
          const hoursPerMonth = (collab.hoursPerDay || 8) * 21; // 21 dias úteis por mês em média
          return total + hoursPerMonth;
        }
        return total;
      }, 0);
      
      // Atualizar as horas produtivas no state
      if (totalHours > 0) {
        updateOfficeCost({
          productiveHoursMonth: totalHours
        });
      }
    }
  }, [collaborators, updateOfficeCost]);

  const handleEditOfficeCosts = () => {
    // Navegar para a página de configuração dos custos do escritório
    navigate('/office-costs');
  };

  return (
    <div className="bg-background rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-building text-primary mr-2"></i>
          Custo Médio por Hora do Escritório
        </h2>
      </div>
      <div className="p-5">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="flex-1">
            <div className="border border-border rounded-md p-4 bg-secondary">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Custos Fixos + Variáveis Mensais</span>
                  <span className="ml-1 text-xs text-muted-foreground">(configurados na página Custos do Escritório)</span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(
                    Number(officeCost.fixedCosts) + Number(officeCost.variableCosts)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <span className="text-sm font-medium">Horas Produtivas Mensais</span>
                  <span className="ml-1 text-xs text-muted-foreground">(calculadas com base nos colaboradores)</span>
                </div>
                <span className="font-semibold">{officeCost.productiveHoursMonth} horas</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className="text-sm font-semibold">Custo por Hora</span>
                <span className="font-bold text-primary">{formatCurrency(hourlyRate)}</span>
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <div className="flex gap-2">
                <Button
                  className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                  onClick={handleEditOfficeCosts}
                >
                  <Settings className="h-4 w-4 mr-2" /> Editar custos do escritório
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/collaborators')}
                >
                  <Users className="h-4 w-4 mr-2" /> Gerenciar colaboradores
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64 p-4 bg-muted rounded-md">
            <AIInsightBox
              insights={[
                "Este valor é calculado automaticamente dividindo os custos totais mensais do escritório pelas horas produtivas.",
                "As horas produtivas são calculadas com base na carga horária de todos os colaboradores fixos.",
                `Para este projeto, o custo do escritório será de ${formatCurrency(totalOfficeCost)} (${projectHours}h × ${formatCurrency(hourlyRate)}).`
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfficeCosts;
