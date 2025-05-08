import React from 'react';

interface AIInsightBoxProps {
  insights: string[];
  type?: 'info' | 'success' | 'warning';
  title?: string;
}

const AIInsightBox: React.FC<AIInsightBoxProps> = ({ 
  insights, 
  type = 'info',
  title
}) => {
  const getBackgroundClass = () => {
    switch (type) {
      case 'success': return 'bg-success/10 border-success/20';
      case 'warning': return 'bg-warning/10 border-warning/20';
      default: return 'bg-primary/10 border-primary/20';
    }
  };

  const getIconClass = () => {
    switch (type) {
      case 'success': return 'fa-circle-check text-success';
      case 'warning': return 'fa-triangle-exclamation text-warning';
      default: return 'fa-robot text-primary';
    }
  };

  return (
    <div className={`p-4 ${getBackgroundClass()} rounded-md border mb-4`}>
      <div className="flex items-start">
        <div className="rounded-full bg-primary/10 p-1 mr-2 mt-0.5">
          <i className={`fa-solid ${getIconClass()} text-xs`}></i>
        </div>
        <div>
          {title && <p className="text-sm mb-1"><strong>{title}</strong></p>}
          {insights.map((insight, index) => (
            <p key={index} className="text-sm mb-1 last:mb-0">{insight}</p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightBox;
