import React, { useState } from 'react';
import { Lightbulb, AlertTriangle, CheckCircle, Brain, X, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AIInsightBoxProps {
  insights: string[];
  type?: 'info' | 'success' | 'warning';
  title?: string;
  onFeedback?: (helpful: boolean) => void;
}

const AIInsightBox: React.FC<AIInsightBoxProps> = ({ 
  insights, 
  type = 'info',
  title = 'Insights da IA',
  onFeedback
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isFeedbackGiven, setIsFeedbackGiven] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-[#FFD600]" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Brain className="h-5 w-5 text-[#FFD600]" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-black/5 dark:bg-white/5 border-[#FFD600]/30';
      case 'success':
        return 'bg-black/5 dark:bg-white/5 border-green-500/30';
      default:
        return 'bg-black/5 dark:bg-white/5 border-[#FFD600]/30';
    }
  };

  const handleFeedback = (helpful: boolean) => {
    if (onFeedback) {
      onFeedback(helpful);
    }
    setIsFeedbackGiven(true);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`rounded-lg border ${getBackgroundColor()} overflow-hidden mb-4`}>
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center gap-2">
          {getIcon()}
          <h3 className="text-sm font-medium flex items-center gap-2">
            {title}
            <span className="text-xs font-normal text-muted-foreground bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded-full">
              IA
            </span>
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {!isCollapsed && !isFeedbackGiven && (
            <div className="flex items-center mr-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleFeedback(true)}
                title="Útil"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => handleFeedback(false)}
                title="Não útil"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {!isCollapsed && (
        <div className="p-4">
          <div className="text-sm">
            <ul className="space-y-2">
              {insights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Lightbulb className="h-4 w-4 text-[#FFD600] mt-1 flex-shrink-0" />
                  <span className="text-foreground">{insight}</span>
                </li>
              ))}
            </ul>
            
            {isFeedbackGiven && (
              <div className="mt-3 text-xs text-muted-foreground italic">
                Obrigado pelo seu feedback! Isso nos ajuda a melhorar nossas recomendações.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Componente de factory para gerar insights baseado no estado atual do orçamento
export const generateInsights = (budget: any) => {
  const insights: string[] = [];
  
  // Lógica para gerar insights baseados no orçamento atual
  // Exemplos:
  if (budget?.tasks?.length === 0) {
    insights.push("Adicione pelo menos uma etapa ao projeto para começar a calcular o orçamento.");
  } else if (budget?.tasks?.length < 3) {
    insights.push("Projetos típicos geralmente têm mais etapas. Considere adicionar mais detalhes para um orçamento mais preciso.");
  }
  
  if (budget?.projectInfo?.area && budget?.projectInfo?.area > 0) {
    if (budget?.calculations?.finalValuePerSqMeter < 50) {
      insights.push("O valor por m² está bem abaixo do mercado. Verifique se você não está subvalorizando seu trabalho.");
    } else if (budget?.calculations?.finalValuePerSqMeter > 500) {
      insights.push("O valor por m² está acima da média. Confirme se este preço é competitivo para o mercado local.");
    }
  }
  
  if (budget?.extraCosts?.technicalVisit === 0 && budget?.projectInfo?.area > 100) {
    insights.push("Para projetos maiores que 100m², é recomendável incluir ao menos uma visita técnica.");
  }
  
  if (budget?.calculations?.profitMarginPercentage < 15) {
    insights.push("Sua margem de lucro está baixa. Considere ajustar para pelo menos 15-20% para garantir a sustentabilidade do seu negócio.");
  }
  
  // Se nenhum insight relevante for encontrado, inclua insights genéricos
  if (insights.length === 0) {
    insights.push("Seu orçamento está equilibrado e parece competitivo com o mercado atual.");
    insights.push("Lembre-se de verificar os custos extras e ajustes técnicos para garantir que todos os aspectos estejam cobertos.");
  }
  
  return insights;
};

export default AIInsightBox;