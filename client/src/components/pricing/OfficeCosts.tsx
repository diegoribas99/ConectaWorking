import React from 'react';
import { OfficeCostType } from '@/lib/useBudgetCalculator';
import AIInsightBox from './AIInsightBox';

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
  const handleEditOfficeCosts = () => {
    // In a real application, this would open a modal to edit costs
    // For now, we'll just update with some sample values
    updateOfficeCost({
      fixedCosts: 6000,
      variableCosts: 2500,
      productiveHoursMonth: 160,
    });
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
                <span className="font-semibold">{formatCurrency(officeCost.fixedCosts + officeCost.variableCosts)}</span>
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
            <div className="mt-3">
              <button 
                className="inline-flex items-center text-sm text-primary hover:text-primary/80 transition"
                onClick={handleEditOfficeCosts}
              >
                <i className="fa-solid fa-gear mr-1"></i> Editar custos do escritório
              </button>
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
