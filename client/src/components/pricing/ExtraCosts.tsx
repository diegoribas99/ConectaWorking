import React, { useState } from 'react';
import { ExtraCostType, CustomExtraCost } from '@/lib/useBudgetCalculator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, FolderOpen, Plus, X, Edit, Trash2 } from 'lucide-react';

interface ExtraCostsProps {
  extraCosts: ExtraCostType;
  updateExtraCosts: (costs: Partial<ExtraCostType>) => void;
  totalExtraCosts: number;
  formatCurrency: (value: number) => string;
  addCustomExtraCost?: (description: string, value: number) => void;
  updateCustomExtraCost?: (id: number, customCost: Partial<CustomExtraCost>) => void;
  removeCustomExtraCost?: (id: number) => void;
}

// Modelos de custos extras
const extraCostTemplates = [
  {
    id: 1,
    name: 'Projeto Residencial - Cidade Local',
    costs: {
      technicalVisit: 120,
      transport: 80,
      printing: 150,
      fees: 200,
      otherServices: 0,
      customCosts: [
        { id: 1, description: "Alimentação", value: 50 },
        { id: 2, description: "Estacionamento", value: 30 }
      ]
    }
  },
  {
    id: 2,
    name: 'Projeto Comercial - Cidade Local',
    costs: {
      technicalVisit: 200,
      transport: 120,
      printing: 300,
      fees: 400,
      otherServices: 150,
      customCosts: []
    }
  },
  {
    id: 3,
    name: 'Projeto Remoto - Outra Cidade',
    costs: {
      technicalVisit: 450,
      transport: 350,
      printing: 200,
      fees: 250,
      otherServices: 200,
      customCosts: [
        { id: 1, description: "Hospedagem", value: 220 },
        { id: 2, description: "Refeições", value: 180 },
        { id: 3, description: "Combustível", value: 150 }
      ]
    }
  }
];

const ExtraCosts: React.FC<ExtraCostsProps> = ({
  extraCosts,
  updateExtraCosts,
  totalExtraCosts,
  formatCurrency,
  addCustomExtraCost,
  updateCustomExtraCost,
  removeCustomExtraCost,
}) => {
  const [isModelDialogOpen, setIsModelDialogOpen] = useState(false);
  const [isSaveModelDialogOpen, setIsSaveModelDialogOpen] = useState(false);
  const [newModelName, setNewModelName] = useState('');

  const CurrencyInput = ({ 
    label, 
    value, 
    field 
  }: { 
    label: string; 
    value: number; 
    field: keyof ExtraCostType;
  }) => {
    // Função para formatar o valor como moeda brasileira no input
    const formatValueForInput = (val: number) => {
      // Garantir que o valor tenha sempre 2 casas decimais
      return val.toFixed(2);
    };
    
    return (
      <div>
        <label className="block text-sm font-medium mb-1">{label}</label>
        <div className="flex">
          <span className="inline-flex items-center px-3 border border-r-0 border-border bg-background rounded-l-md">
            R$
          </span>
          <input 
            type="number" 
            className="w-full px-3 py-2 bg-background border border-border rounded-r-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
            value={formatValueForInput(value || 0)}
            onChange={(e) => updateExtraCosts({ [field]: Number(e.target.value) })}
            min="0"
            step="0.01"
          />
        </div>
      </div>
    );
  };

  // Aplica um modelo de custos
  const applyExtraCostTemplate = (templateId: number) => {
    const template = extraCostTemplates.find(t => t.id === templateId);
    if (template) {
      updateExtraCosts(template.costs);
      setIsModelDialogOpen(false);
    }
  };

  // Salva os custos atuais como um novo modelo
  const saveAsTemplate = () => {
    if (newModelName) {
      // Em uma implementação real, você enviaria isso para o backend
      alert(`Modelo de custos "${newModelName}" salvo com sucesso!`);
      setNewModelName('');
      setIsSaveModelDialogOpen(false);
    }
  };

  // Verificar se não existem custos personalizados
  const hasNoCosts = !extraCosts.customCosts || extraCosts.customCosts.length === 0;

  return (
    <>
      <div className="bg-card rounded-lg shadow-sm mb-6 overflow-hidden border border-border">
        <div className="p-5 flex justify-between items-center border-b border-border">
          <h2 className="text-lg font-semibold flex items-center">
            Custos Extras do Projeto
          </h2>
          <div className="flex gap-2 justify-end">
            <Button 
              size="sm"
              onClick={() => setIsSaveModelDialogOpen(true)}
              className="flex items-center gap-1 bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              disabled={hasNoCosts}
            >
              <Save className="h-4 w-4" /> Salvar Modelo
            </Button>
          </div>
        </div>
        
        <div className="p-5">
          {hasNoCosts ? (
            <div className="text-center">
              <div className="text-muted-foreground mb-4">
                Nenhum custo extra adicionado. Use o botão "Adicionar Custo Extra" para começar.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {extraCosts.customCosts && extraCosts.customCosts.map((cost) => (
                <div key={cost.id} className="flex items-center gap-3">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Descrição do custo"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                      value={cost.description}
                      onChange={(e) => updateCustomExtraCost && updateCustomExtraCost(cost.id, { description: e.target.value })}
                    />
                  </div>
                  <div className="w-32">
                    <div className="flex">
                      <span className="inline-flex items-center px-3 border border-r-0 border-border bg-background rounded-l-md">
                        R$
                      </span>
                      <input
                        type="number"
                        className="w-full px-3 py-2 bg-background border border-border rounded-r-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]"
                        value={cost.value.toFixed(2)}
                        onChange={(e) => updateCustomExtraCost && updateCustomExtraCost(cost.id, { value: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => removeCustomExtraCost && removeCustomExtraCost(cost.id)}
                    className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="px-5 py-3 bg-black/5 dark:bg-white/5 flex justify-between items-center">
          <div className="font-semibold">
            Total Extras: <span className="text-[#FFD600]">{formatCurrency(totalExtraCosts)}</span>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              onClick={() => {
                // Limpa todos os custos
                updateExtraCosts({
                  technicalVisit: 0,
                  transport: 0,
                  printing: 0,
                  fees: 0,
                  otherServices: 0,
                  customCosts: []
                });
              }}
              className="flex items-center gap-1 bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
            >
              <Trash2 className="h-4 w-4" /> Limpar Custos
            </Button>
            <Button
              size="sm"
              onClick={() => setIsModelDialogOpen(true)}
              className="flex items-center gap-1 bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
            >
              <FolderOpen className="h-4 w-4" /> Importar Modelo
            </Button>
            <Button 
              size="sm"
              onClick={() => {
                // Adiciona um novo custo extra personalizado vazio
                if (addCustomExtraCost) {
                  addCustomExtraCost("", 0);
                }
              }}
              className="flex items-center gap-1 bg-[#FFD600] text-black hover:bg-[#FFD600]/90"
            >
              <Plus className="h-4 w-4" /> Adicionar Custo Extra
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog para escolher um modelo de custos */}
      <Dialog open={isModelDialogOpen} onOpenChange={setIsModelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Importar Modelo de Custos</DialogTitle>
            <DialogDescription>
              Escolha um modelo pré-definido de custos extras para aplicar ao seu projeto.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            {extraCostTemplates.map(template => (
              <div 
                key={template.id} 
                className="p-3 border border-border rounded-md hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer"
                onClick={() => applyExtraCostTemplate(template.id)}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  {template.costs.customCosts && template.costs.customCosts.length > 0 ? (
                    <div className="mt-1">
                      <div className="flex flex-wrap gap-1 mt-1">
                        {template.costs.customCosts.map(cost => (
                          <span key={cost.id} className="bg-black/5 dark:bg-white/5 px-2 py-0.5 rounded text-xs">
                            {cost.description}: {formatCurrency(cost.value)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs mt-1">Sem custos personalizados</div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={() => setIsModelDialogOpen(false)}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para salvar um modelo */}
      <Dialog open={isSaveModelDialogOpen} onOpenChange={setIsSaveModelDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Salvar Custos como Modelo</DialogTitle>
            <DialogDescription>
              Salve os custos extras atuais como um modelo para uso em projetos futuros.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm font-medium mb-1">Nome do Modelo</label>
            <input 
              type="text" 
              className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFD600]" 
              placeholder="Ex: Projeto com Custos Padrão" 
              value={newModelName}
              onChange={(e) => setNewModelName(e.target.value)}
            />
            <div className="mt-4 text-sm">
              <p className="text-muted-foreground">Total de custos no modelo: {formatCurrency(totalExtraCosts)}</p>
            </div>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={() => setIsSaveModelDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              className="bg-[#FFD600] hover:bg-[#FFD600]/90 text-black"
              onClick={saveAsTemplate}
              disabled={!newModelName}
            >
              Salvar Modelo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExtraCosts;
