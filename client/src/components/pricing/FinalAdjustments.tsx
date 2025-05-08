import React from 'react';
import { FinalAdjustmentsType } from '@/lib/useBudgetCalculator';

interface FinalAdjustmentsProps {
  finalAdjustments: FinalAdjustmentsType;
  updateFinalAdjustments: (adjustments: Partial<FinalAdjustmentsType>) => void;
  valueWithAdjustments: number;
  profitValue: number;
  valueBeforeTaxes: number;
  taxesAndFeesValue: number;
  formatCurrency: (value: number) => string;
}

const FinalAdjustments: React.FC<FinalAdjustmentsProps> = ({
  finalAdjustments,
  updateFinalAdjustments,
  valueWithAdjustments,
  profitValue,
  valueBeforeTaxes,
  taxesAndFeesValue,
  formatCurrency,
}) => {
  const AdjustmentSlider = ({ 
    label, 
    value, 
    field, 
    min = 0,
    max = 50, 
    description 
  }: { 
    label: string; 
    value: number; 
    field: keyof FinalAdjustmentsType; 
    min?: number;
    max?: number;
    description?: string;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center space-x-3">
        <input 
          type="range" 
          min={min} 
          max={max} 
          step="1" 
          value={value} 
          className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
          onChange={(e) => updateFinalAdjustments({ [field]: Number(e.target.value) })}
        />
        <span className="font-medium w-12 text-center">{value}%</span>
      </div>
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </div>
  );

  return (
    <div className="bg-background rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-money-bill-wave text-primary mr-2"></i>
          Ajustes Finais
        </h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <AdjustmentSlider 
            label="Lucro Desejado" 
            value={finalAdjustments.profit} 
            field="profit" 
            min={10}
            description="Percentual de lucro sobre o custo com ajustes"
          />
          <AdjustmentSlider 
            label="Impostos" 
            value={finalAdjustments.taxes} 
            field="taxes" 
            max={20}
            description="Aplicado com cálculo reverso para não afetar sua margem"
          />
          <AdjustmentSlider 
            label="Taxa de Cartão/Parcelamento" 
            value={finalAdjustments.cardFee} 
            field="cardFee" 
            max={15}
            description="Taxa cobrada pela operadora de pagamentos"
          />
        </div>
      </div>
      <div className="px-5 py-4 bg-secondary flex flex-col md:flex-row gap-3 md:justify-between">
        <div className="text-sm">
          <div className="flex items-center mb-1">
            <i className="fa-solid fa-calculator text-primary mr-2"></i>
            <span>Valor com ajustes técnicos: <strong>{formatCurrency(valueWithAdjustments)}</strong></span>
          </div>
          <div className="flex items-center">
            <i className="fa-solid fa-plus text-primary mr-2"></i>
            <span>Lucro (+{finalAdjustments.profit}%): <strong>{formatCurrency(profitValue)}</strong></span>
          </div>
        </div>
        <div>
          <div className="flex items-center text-sm mb-1">
            <i className="fa-solid fa-arrow-right text-primary mr-2"></i>
            <span>Valor antes de impostos/taxas: <strong>{formatCurrency(valueBeforeTaxes)}</strong></span>
          </div>
          <div className="flex items-center text-sm">
            <i className="fa-solid fa-rotate text-primary mr-2"></i>
            <span>Cálculo reverso (impostos+taxas: {finalAdjustments.taxes + finalAdjustments.cardFee}%): <strong className="text-success">{formatCurrency(taxesAndFeesValue)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalAdjustments;
