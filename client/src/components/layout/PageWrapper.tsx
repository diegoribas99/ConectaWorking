import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

/**
 * Componente para padronizar o layout das páginas e evitar duplicação
 * de cabeçalhos e elementos de navegação. Use este componente em vez
 * de definir cabeçalhos e containers diretamente nas páginas.
 */
const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  title, 
  description, 
  actions 
}) => {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center gap-2 justify-end flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
      
      {children}
    </div>
  );
};

export default PageWrapper;