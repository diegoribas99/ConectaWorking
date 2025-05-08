import React from 'react';
import AIInsightBox from './AIInsightBox';

interface HourM2ComparisonProps {
  totalHours: number;
  finalValue: number;
  area: number;
  valuePerHour: number;
  valuePerSqMeter: number;
  formatCurrency: (value: number) => string;
}

const HourM2Comparison: React.FC<HourM2ComparisonProps> = ({
  totalHours,
  finalValue,
  area,
  valuePerHour,
  valuePerSqMeter,
  formatCurrency,
}) => {
  // Determine if project values are reasonable based on market standards
  const isPerSqMeterReasonable = valuePerSqMeter >= 150 && valuePerSqMeter <= 250;
  const isPerHourReasonable = valuePerHour >= 300 && valuePerHour <= 600;

  // Generate AI insights based on values
  const generateAIInsights = () => {
    const insights = [];
    
    // Per square meter analysis
    if (area > 0) {
      if (isPerSqMeterReasonable) {
        insights.push(`O valor por m² (${formatCurrency(valuePerSqMeter)}) está dentro da média de mercado para projetos deste tipo (R$ 150-250/m²).`);
      } else if (valuePerSqMeter < 150) {
        insights.push(`O valor por m² (${formatCurrency(valuePerSqMeter)}) está abaixo da média de mercado (R$ 150-250/m²). Considere revisar seus custos e ajustes.`);
      } else {
        insights.push(`O valor por m² (${formatCurrency(valuePerSqMeter)}) está acima da média de mercado (R$ 150-250/m²), o que pode ser adequado para projetos de alta complexidade ou premium.`);
      }
    }
    
    // Per hour analysis
    if (totalHours > 0) {
      if (isPerHourReasonable) {
        insights.push(`O valor por hora (${formatCurrency(valuePerHour)}) está adequado para a complexidade do projeto e garante margem de lucro saudável.`);
      } else if (valuePerHour < 300) {
        insights.push(`O valor por hora (${formatCurrency(valuePerHour)}) está abaixo do recomendado. Considere aumentar a margem de lucro ou revisar suas horas estimadas.`);
      } else {
        insights.push(`O valor por hora (${formatCurrency(valuePerHour)}) está acima da média, o que é positivo para sua rentabilidade.`);
      }
    }
    
    return insights;
  };

  return (
    <div className="bg-background rounded-lg shadow-sm mb-6 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-scale-balanced text-primary mr-2"></i>
          Comparativo por Hora × m²
        </h2>
      </div>
      <div className="p-5">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="border border-border rounded-md p-4 bg-secondary">
              <h3 className="text-sm font-semibold mb-4">Cálculo por Hora</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-muted-foreground">Horas Totais</span>
                  <p className="font-medium">{totalHours} horas</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Valor por Hora</span>
                  <p className="font-medium">{formatCurrency(valuePerHour)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Valor Total (com ajustes)</span>
                  <p className="font-medium text-xl">{formatCurrency(finalValue)}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="border border-border rounded-md p-4 bg-secondary">
              <h3 className="text-sm font-semibold mb-4">Cálculo por m²</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-muted-foreground">Área Total</span>
                  <p className="font-medium">{area} m²</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Valor por m²</span>
                  <p className="font-medium">{formatCurrency(valuePerSqMeter)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Valor Total (por m²)</span>
                  <p className="font-medium text-xl">{formatCurrency(finalValue)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {(area > 0 && totalHours > 0) && (
          <div className="mt-4">
            <AIInsightBox
              title="Análise da IA:"
              insights={generateAIInsights()}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default HourM2Comparison;
