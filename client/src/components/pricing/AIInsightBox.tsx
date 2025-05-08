import React from 'react';
import { Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

interface AIInsightBoxProps {
  insights: string[];
  type?: 'info' | 'success' | 'warning';
  title?: string;
}

const AIInsightBox: React.FC<AIInsightBoxProps> = ({ 
  insights, 
  type = 'info',
  title = 'Insights da IA'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className={`rounded-lg border ${getBackgroundColor()} p-4`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            {title}
            <span className="text-xs font-normal text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
              IA
            </span>
          </h3>
          <div className="mt-2 text-sm">
            <ul className="list-disc pl-5 space-y-1">
              {insights.map((insight, index) => (
                <li key={index} className="text-muted-foreground">{insight}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightBox;