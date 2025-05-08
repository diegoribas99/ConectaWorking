import React from 'react';
import { TechnicalAdjustmentsType } from '@/lib/useBudgetCalculator';

interface TechnicalAdjustmentsProps {
  technicalAdjustments: TechnicalAdjustmentsType;
  updateTechnicalAdjustments: (adjustments: Partial<TechnicalAdjustmentsType>) => void;
  baseCost: number;
  totalAdjustmentValue: number;
  formatCurrency: (value: number) => string;
}

const TechnicalAdjustments: React.FC<TechnicalAdjustmentsProps> = ({
  technicalAdjustments,
  updateTechnicalAdjustments,
  baseCost,
  totalAdjustmentValue,
  formatCurrency,
}) => {
  const AdjustmentSlider = ({ 
    label, 
    value, 
    field, 
    max = 50, 
    description 
  }: { 
    label: string; 
    value: number; 
    field: keyof TechnicalAdjustmentsType; 
    max?: number;
    description?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center space-x-3">
        <input 
          type="range" 
          min="0" 
          max={max} 
          step="5" 
          value={value} 
          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
          onChange={(e) => updateTechnicalAdjustments({ [field]: Number(e.target.value) })}
        />
        <span className="font-medium w-12 text-center">{value}%</span>
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );

  const totalAdjustmentPercentage = Object.values(technicalAdjustments).reduce((sum, value) => sum + value, 0);

  return (
    <div className="bg-background rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-sliders text-primary mr-2"></i>
          Ajustes Técnicos
          <div className="ml-2 group relative cursor-pointer">
            <i className="fa-solid fa-circle-info text-muted-foreground"></i>
            <div className="absolute z-10 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 rounded-md shadow-lg p-3 bg-popover text-popover-foreground text-sm invisible group-hover:visible">
              Estes percentuais são aplicados sobre o custo real do projeto para ajustar de acordo com características específicas.
            </div>
          </div>
        </h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AdjustmentSlider 
            label="Complexidade do Projeto" 
            value={technicalAdjustments.complexity} 
            field="complexity" 
            description="Aumento com base na complexidade técnica e nível do projeto"
          />
          <AdjustmentSlider 
            label="Reserva Técnica" 
            value={technicalAdjustments.technicalReserve} 
            field="technicalReserve" 
            max={30}
            description="Margem de segurança para imprevistos e ajustes"
          />
          <AdjustmentSlider 
            label="Taxa de Pentelhice" 
            value={technicalAdjustments.clientDifficulty} 
            field="clientDifficulty" 
            max={30}
            description="Baseado no histórico ou previsão de múltiplas revisões"
          />
          <AdjustmentSlider 
            label="Extras" 
            value={technicalAdjustments.extras} 
            field="extras" 
            max={30}
            description="Outros fatores (localização, prazos especiais, etc)"
          />
        </div>
      </div>
      <div className="px-5 py-3 bg-secondary flex flex-col md:flex-row md:justify-between md:items-center gap-3">
        <div className="text-sm text-muted-foreground">
          Custo base: <span className="font-medium">{formatCurrency(baseCost)}</span> (Custo equipe + escritório + extras)
        </div>
        <div className="font-semibold">
          Ajustes: <span className="text-primary">{formatCurrency(totalAdjustmentValue)}</span> ({totalAdjustmentPercentage}% do custo base)
        </div>
      </div>
    </div>
  );
};

export default TechnicalAdjustments;
