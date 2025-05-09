import React from 'react';
import { OfficeCostType } from '@/lib/useBudgetCalculator';
import AIInsightBox from './AIInsightBox';
import { useLocation } from 'wouter';
import { formatCurrency as formatCurrencyUtil } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

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
                <span className="text-sm font-medium">Custos Fixos + Variáveis Mensais</span>
                <span className="font-semibold">
                  {formatCurrency(
                    officeCost.fixedCosts.reduce((sum, cost) => sum + cost.value, 0) +
                    officeCost.variableCosts.reduce((sum, cost) => sum + cost.value, 0)
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium">Horas Produtivas Mensais</span>
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
                  <Clock className="h-4 w-4 mr-2" /> Editar horas produtivas
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full md:w-64 p-4 bg-muted rounded-md">
            <AIInsightBox
              insights={[
                "Este valor garante que cada hora trabalhada cubra seus custos operacionais.",
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
