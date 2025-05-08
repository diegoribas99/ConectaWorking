import React, { useState } from 'react';
import { ProjectInfoType } from '@/lib/useBudgetCalculator';
import AIInsightBox from './AIInsightBox';

interface FinalSummaryProps {
  projectInfo: ProjectInfoType;
  baseCost: number;
  technicalAdjustmentsValue: number;
  profitValue: number;
  taxesAndFeesValue: number;
  finalValue: number;
  discount: number;
  updateDiscount: (discount: number) => void;
  discountValue: number;
  discountedFinalValue: number;
  profitMarginPercentage: number;
  formatCurrency: (value: number) => string;
}

const FinalSummary: React.FC<FinalSummaryProps> = ({
  projectInfo,
  baseCost,
  technicalAdjustmentsValue,
  profitValue,
  taxesAndFeesValue,
  finalValue,
  discount,
  updateDiscount,
  discountValue,
  discountedFinalValue,
  profitMarginPercentage,
  formatCurrency,
}) => {
  // Generate technical justification for the client
  const generateTechnicalJustification = () => {
    const projectType = projectInfo.type === 'residential' ? 'residencial' :
                        projectInfo.type === 'commercial' ? 'comercial' :
                        projectInfo.type === 'corporate' ? 'corporativo' :
                        projectInfo.type === 'retail' ? 'loja/varejo' :
                        projectInfo.type === 'hospitality' ? 'hotelaria' : 'do projeto';
    
    const deliveryLevel = projectInfo.deliveryLevel === 'basic' ? 'básico' :
                          projectInfo.deliveryLevel === 'executive' ? 'executivo' :
                          'premium';
    
    return [
      `Este orçamento foi desenvolvido com base em uma análise detalhada das necessidades do seu projeto ${projectInfo.name || 'de ' + projectType}, ${projectInfo.area > 0 ? `com área de ${projectInfo.area}m²` : ''}.`,
      `O valor contempla todas as etapas necessárias para um resultado de qualidade, com nível de entrega ${deliveryLevel} ${projectInfo.area > 0 ? `para toda a área de ${projectInfo.area}m²` : ''}.`,
      'Estão inclusos todos os custos operacionais do escritório, visitas técnicas, impressões, e uma reserva técnica que garante a segurança do projeto contra imprevistos.',
      `${projectInfo.area > 0 ? `O valor por metro quadrado ficou em ${formatCurrency(finalValue / projectInfo.area)}, que está alinhado com o padrão de mercado para projetos ${projectType}s ${projectInfo.city ? `em ${projectInfo.city}` : ''}, considerando o nível de detalhamento e qualidade que oferecemos.` : ''}`,
      'Este investimento garante um projeto tecnicamente correto, esteticamente adequado às suas necessidades, e com todo o suporte necessário durante o processo.'
    ].filter(Boolean); // Remove empty strings (if area is 0)
  };

  // Generate diagnostic report based on calculations
  const generateDiagnostic = () => {
    const profitStatus = profitMarginPercentage >= 25 ? {
      type: 'success',
      title: 'Margem Saudável:',
      text: `Este orçamento mantém uma margem de lucro adequada (${profitMarginPercentage.toFixed(1)}%) e cobre todos os custos operacionais.`
    } : {
      type: 'warning',
      title: 'Margem Baixa:',
      text: `A margem atual (${profitMarginPercentage.toFixed(1)}%) está abaixo do recomendado (25%). Considere revisar os ajustes ou reduzir o desconto.`
    };

    const recommendationText = discount > 0 ?
      `Você está oferecendo um desconto de ${discount}%. Certifique-se de que isso é estrategicamente necessário, pois impacta diretamente sua margem de lucro.` :
      `Este cliente é novo. Se necessário para fechar o projeto, você poderia oferecer um pequeno desconto (5%) e ainda manter uma margem saudável de ${(profitMarginPercentage * 0.95).toFixed(1)}%.`;

    return {
      profitStatus,
      recommendation: {
        type: 'info',
        title: 'Recomendação:',
        text: recommendationText
      }
    };
  };

  const diagnostic = generateDiagnostic();

  return (
    <div className="bg-background rounded-lg shadow-sm mb-8 overflow-hidden">
      <div className="p-5 border-b border-border">
        <h2 className="text-lg font-semibold flex items-center">
          <i className="fa-solid fa-file-invoice-dollar text-primary mr-2"></i>
          Resumo Final
        </h2>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="bg-secondary rounded-lg p-5">
              <h3 className="font-semibold mb-4 text-center">Valores do Orçamento</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Valor mínimo (custos)</span>
                  <span className="font-medium">{formatCurrency(baseCost)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">+ Ajustes técnicos</span>
                  <span className="font-medium">{formatCurrency(technicalAdjustmentsValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">+ Lucro</span>
                  <span className="font-medium">{formatCurrency(profitValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">+ Impostos/taxas</span>
                  <span className="font-medium">{formatCurrency(taxesAndFeesValue)}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-border">
                  <span className="font-semibold">Valor Final</span>
                  <span className="font-bold text-xl text-primary">{formatCurrency(finalValue)}</span>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Simulador de Desconto</h4>
                <div className="flex items-center space-x-3">
                  <input 
                    type="range" 
                    min="0" 
                    max="20" 
                    step="1" 
                    value={discount} 
                    className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer" 
                    onChange={(e) => updateDiscount(Number(e.target.value))}
                  />
                  <span className="font-medium w-12 text-center">{discount}%</span>
                </div>
                <div className="mt-2 flex justify-between">
                  <span className="text-sm text-muted-foreground">Valor com desconto</span>
                  <span className="font-medium">{formatCurrency(discountedFinalValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Impacto na margem</span>
                  <span className={`font-medium ${profitMarginPercentage >= 25 ? 'text-success' : 'text-warning'}`}>
                    {profitMarginPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="p-5 rounded-lg border border-border">
              <h3 className="font-semibold mb-4">Justificativa Técnica para Cliente</h3>
              <div className="bg-secondary rounded-md p-4 h-64 overflow-y-auto">
                {generateTechnicalJustification().map((paragraph, index) => (
                  <p key={index} className="text-sm mb-3">{paragraph}</p>
                ))}
              </div>
              
              <h3 className="font-semibold mt-5 mb-4">Diagnóstico da IA</h3>
              <div className={`p-4 bg-${diagnostic.profitStatus.type === 'success' ? 'success' : 'warning'}/10 border border-${diagnostic.profitStatus.type === 'success' ? 'success' : 'warning'}/20 rounded-md mb-4`}>
                <div className="flex">
                  <i className={`fa-solid ${diagnostic.profitStatus.type === 'success' ? 'fa-circle-check text-success' : 'fa-triangle-exclamation text-warning'} mr-2 mt-0.5`}></i>
                  <p className="text-sm"><strong>{diagnostic.profitStatus.title}</strong> {diagnostic.profitStatus.text}</p>
                </div>
              </div>
              <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
                <div className="flex">
                  <i className="fa-solid fa-lightbulb text-primary mr-2 mt-0.5"></i>
                  <p className="text-sm"><strong>{diagnostic.recommendation.title}</strong> {diagnostic.recommendation.text}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalSummary;
