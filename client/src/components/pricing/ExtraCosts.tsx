import React from 'react';
import { ExtraCostType } from '@/lib/useBudgetCalculator';

interface ExtraCostsProps {
  extraCosts: ExtraCostType;
  updateExtraCosts: (costs: Partial<ExtraCostType>) => void;
  totalExtraCosts: number;
  formatCurrency: (value: number) => string;
}

const ExtraCosts: React.FC<ExtraCostsProps> = ({
  extraCosts,
  updateExtraCosts,
  totalExtraCosts,
  formatCurrency,
}) => {
  const CurrencyInput = ({ 
    label, 
    value, 
    field 
  }: { 
    label: string; 
    value: number; 
    field: keyof ExtraCostType;
  }) => (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex">
        <span className="inline-flex items-center px-3 border border-r-0 border-border bg-secondary rounded-l-md">
          R$
        </span>
        <input 
          type="number" 
          className="w-full px-3 py-2 bg-secondary border border-border rounded-r-md focus:outline-none focus:ring-2 focus:ring-primary" 
          value={value || ''}
          onChange={(e) => updateExtraCosts({ [field]: Number(e.target.value) })}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );

  return (
    <div className="bg-background rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-receipt text-primary mr-2"></i>
          Custos Extras do Projeto
        </h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CurrencyInput 
            label="Visita Técnica" 
            value={extraCosts.technicalVisit}
            field="technicalVisit"
          />
          <CurrencyInput 
            label="Transporte" 
            value={extraCosts.transport}
            field="transport"
          />
          <CurrencyInput 
            label="Impressão" 
            value={extraCosts.printing}
            field="printing"
          />
          <CurrencyInput 
            label="Taxas" 
            value={extraCosts.fees}
            field="fees"
          />
          <div className="md:col-span-2">
            <CurrencyInput 
              label="Outros Serviços Externos" 
              value={extraCosts.otherServices}
              field="otherServices"
            />
          </div>
        </div>
      </div>
      <div className="px-5 py-3 bg-secondary flex justify-end">
        <div className="font-semibold">
          Total Extras: <span className="text-primary">{formatCurrency(totalExtraCosts)}</span>
        </div>
      </div>
    </div>
  );
};

export default ExtraCosts;
