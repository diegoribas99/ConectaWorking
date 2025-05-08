import React from 'react';
import AIInsightBox from './AIInsightBox';

// Valores de referência por m² para cada tipo de projeto e nível de entrega
const referenceValues: Record<string, Record<string, number>> = {
  residential: {
    basic: 80,
    executive: 120,
    premium: 180
  },
  commercial: {
    basic: 100,
    executive: 150,
    premium: 220
  },
  corporate: {
    basic: 120,
    executive: 180,
    premium: 250
  },
  retail: {
    basic: 110,
    executive: 160,
    premium: 230
  },
  hospitality: {
    basic: 130,
    executive: 190,
    premium: 270
  }
};

interface HourM2ComparisonProps {
  totalHours: number;
  finalValue: number;
  area: number;
  valuePerHour: number;
  valuePerSqMeter: number;
  formatCurrency: (value: number) => string;
  projectType: string;
  deliveryLevel: 'basic' | 'executive' | 'premium';
}

const HourM2Comparison: React.FC<HourM2ComparisonProps> = ({
  totalHours,
  finalValue,
  area,
  valuePerHour,
  valuePerSqMeter,
  formatCurrency,
  projectType,
  deliveryLevel,
}) => {
  // Get reference price per square meter based on project type and delivery level
  const referencePrice = referenceValues[projectType]?.[deliveryLevel] || 0;
  
  // Calculate the reference total value based on area and the reference price
  const referenceTotalValue = area * referencePrice;
  
  // Determine if project values are reasonable based on market standards
  const isPerSqMeterReasonable = valuePerSqMeter >= referencePrice * 0.9 && valuePerSqMeter <= referencePrice * 1.5;
  const isPerHourReasonable = valuePerHour >= 300 && valuePerHour <= 600;

  // Generate AI insights based on values
  const generateAIInsights = () => {
    const insights = [];
    
    // Per square meter analysis
    if (area > 0) {
      if (isPerSqMeterReasonable) {
        insights.push(`O valor por m² (${formatCurrency(valuePerSqMeter)}) está dentro da faixa esperada para projetos ${projectType === 'residential' ? 'residenciais' : 
                 projectType === 'commercial' ? 'comerciais' : 
                 projectType === 'corporate' ? 'corporativos' : 
                 projectType === 'retail' ? 'de varejo' : 'de hotelaria'} 
                 com nível de entrega ${deliveryLevel === 'basic' ? 'básico' : 
                 deliveryLevel === 'executive' ? 'executivo' : 'premium'} 
                 (referência: ${formatCurrency(referencePrice)}/m²).`);
      } else if (valuePerSqMeter < referencePrice * 0.9) {
        insights.push(`O valor por m² (${formatCurrency(valuePerSqMeter)}) está abaixo da referência para este tipo de projeto com nível de entrega ${deliveryLevel} (referência: ${formatCurrency(referencePrice)}/m²). Considere revisar seus custos e ajustes.`);
      } else {
        insights.push(`O valor por m² (${formatCurrency(valuePerSqMeter)}) está acima da referência para este tipo de projeto com nível de entrega ${deliveryLevel} (referência: ${formatCurrency(referencePrice)}/m²), o que pode ser adequado para projetos de alta complexidade.`);
      }
      
      // Compare calculated total vs reference total
      const totalDifference = finalValue - referenceTotalValue;
      if (Math.abs(totalDifference) > referenceTotalValue * 0.2) {
        if (totalDifference > 0) {
          insights.push(`O valor total do orçamento está ${formatCurrency(totalDifference)} acima do calculado pela referência simples de m² (${formatCurrency(referenceTotalValue)}). Isto pode refletir a complexidade adicional ou serviços personalizados.`);
        } else {
          insights.push(`O valor total do orçamento está ${formatCurrency(Math.abs(totalDifference))} abaixo do calculado pela referência simples de m² (${formatCurrency(referenceTotalValue)}). Verifique se todos os custos foram corretamente incluídos.`);
        }
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
                <div>
                  <span className="text-sm text-muted-foreground">Referência para {deliveryLevel}</span>
                  <p className="font-medium">{formatCurrency(referencePrice)}/m²</p>
                </div>
                <div>
                  <span className="text-sm text-muted-foreground">Valor por referência</span>
                  <p className="font-medium">{formatCurrency(referenceTotalValue)}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-sm text-muted-foreground">Valor Total (final)</span>
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
