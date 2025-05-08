import React, { useState } from 'react';
import ProjectInformation from './ProjectInformation';
import ProjectTasks from './ProjectTasks';
import OfficeCosts from './OfficeCosts';
import ExtraCosts from './ExtraCosts';
import TechnicalAdjustments from './TechnicalAdjustments';
import FinalAdjustments from './FinalAdjustments';
import HourM2Comparison from './HourM2Comparison';
import FinalSummary from './FinalSummary';
import AIInsightBox from './AIInsightBox';
import { useBudgetCalculator, CollaboratorType } from '@/lib/useBudgetCalculator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Lightbulb, Hourglass, Wallet, BarChart2, Percent, Calculator } from 'lucide-react';

const mockCollaborators: CollaboratorType[] = [
  { id: 1, name: 'Ana Silva', hourlyRate: 120 },
  { id: 2, name: 'Carlos Mendes', hourlyRate: 150 },
  { id: 3, name: 'Patrícia Santos', hourlyRate: 180 },
];

const NewBudgetForm: React.FC = () => {
  const {
    state,
    updateProjectInfo,
    addTask,
    updateTask,
    removeTask,
    updateOfficeCost,
    updateExtraCosts,
    updateTechnicalAdjustments,
    updateFinalAdjustments,
    updateDiscount,
    formatCurrency,
  } = useBudgetCalculator();

  const [isSaving, setIsSaving] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const { toast } = useToast();

  const handleSaveDraft = async () => {
    if (!state.projectInfo.name) {
      toast({
        title: "Nome do projeto obrigatório",
        description: "Por favor, defina um nome para o projeto antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSavingDraft(true);
    try {
      const budget = {
        userId: 1, // Would come from auth context in a real app
        name: state.projectInfo.name,
        projectType: state.projectInfo.type,
        area: state.projectInfo.area,
        city: state.projectInfo.city,
        deliveryLevel: state.projectInfo.deliveryLevel,
        status: 'draft',
      };

      const tasks = state.tasks.map(task => ({
        budgetId: 0, // This will be set by the server
        description: task.description,
        collaboratorId: task.collaboratorId || null,
        hours: task.hours,
        hourlyRate: task.hourlyRate,
      }));

      const extraCosts = {
        budgetId: 0, // This will be set by the server
        technicalVisit: state.extraCosts.technicalVisit,
        transport: state.extraCosts.transport,
        printing: state.extraCosts.printing,
        fees: state.extraCosts.fees,
        otherServices: state.extraCosts.otherServices,
      };

      const adjustments = {
        budgetId: 0, // This will be set by the server
        complexity: state.technicalAdjustments.complexity,
        technicalReserve: state.technicalAdjustments.technicalReserve,
        clientDifficulty: state.technicalAdjustments.clientDifficulty,
        extras: state.technicalAdjustments.extras,
        profit: state.finalAdjustments.profit,
        taxes: state.finalAdjustments.taxes,
        cardFee: state.finalAdjustments.cardFee,
        discount: state.discount,
      };

      const results = {
        budgetId: 0, // This will be set by the server
        baseValue: state.calculations.baseCost,
        technicalAdjustmentsValue: state.calculations.technicalAdjustmentsValue,
        profitValue: state.calculations.profitValue,
        taxesAndFeesValue: state.calculations.taxesAndFeesValue,
        finalValue: state.calculations.finalValue,
        hourlyRate: state.calculations.finalValuePerHour,
        sqMeterRate: state.calculations.finalValuePerSqMeter,
        discountValue: state.calculations.discountValue,
        finalValueWithDiscount: state.calculations.discountedFinalValue,
        profitMarginPercentage: state.calculations.profitMarginPercentage,
      };

      const response = await apiRequest('POST', '/api/full-budget', {
        budget,
        tasks,
        extraCosts,
        adjustments,
        results,
      });

      toast({
        title: "Rascunho salvo",
        description: "Seu orçamento foi salvo como rascunho com sucesso.",
      });
    } catch (error) {
      console.error('Error saving draft:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o rascunho. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleSaveFinal = async () => {
    if (!state.projectInfo.name) {
      toast({
        title: "Nome do projeto obrigatório",
        description: "Por favor, defina um nome para o projeto antes de salvar.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const budget = {
        userId: 1, // Would come from auth context in a real app
        name: state.projectInfo.name,
        projectType: state.projectInfo.type,
        area: state.projectInfo.area,
        city: state.projectInfo.city,
        deliveryLevel: state.projectInfo.deliveryLevel,
        status: 'final',
      };

      const tasks = state.tasks.map(task => ({
        budgetId: 0, // This will be set by the server
        description: task.description,
        collaboratorId: task.collaboratorId || null,
        hours: task.hours,
        hourlyRate: task.hourlyRate,
      }));

      const extraCosts = {
        budgetId: 0, // This will be set by the server
        technicalVisit: state.extraCosts.technicalVisit,
        transport: state.extraCosts.transport,
        printing: state.extraCosts.printing,
        fees: state.extraCosts.fees,
        otherServices: state.extraCosts.otherServices,
      };

      const adjustments = {
        budgetId: 0, // This will be set by the server
        complexity: state.technicalAdjustments.complexity,
        technicalReserve: state.technicalAdjustments.technicalReserve,
        clientDifficulty: state.technicalAdjustments.clientDifficulty,
        extras: state.technicalAdjustments.extras,
        profit: state.finalAdjustments.profit,
        taxes: state.finalAdjustments.taxes,
        cardFee: state.finalAdjustments.cardFee,
        discount: state.discount,
      };

      const results = {
        budgetId: 0, // This will be set by the server
        baseValue: state.calculations.baseCost,
        technicalAdjustmentsValue: state.calculations.technicalAdjustmentsValue,
        profitValue: state.calculations.profitValue,
        taxesAndFeesValue: state.calculations.taxesAndFeesValue,
        finalValue: state.calculations.finalValue,
        hourlyRate: state.calculations.finalValuePerHour,
        sqMeterRate: state.calculations.finalValuePerSqMeter,
        discountValue: state.calculations.discountValue,
        finalValueWithDiscount: state.calculations.discountedFinalValue,
        profitMarginPercentage: state.calculations.profitMarginPercentage,
      };

      const response = await apiRequest('POST', '/api/full-budget', {
        budget,
        tasks,
        extraCosts,
        adjustments,
        results,
      });

      toast({
        title: "Orçamento salvo",
        description: "Seu orçamento foi finalizado e salvo com sucesso.",
      });
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o orçamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Insights da IA com base no estado atual do orçamento
  const getProjectInsights = () => {
    const insights = [];
    
    if (state.calculations.totalHours < 10 && state.projectInfo.area > 50) {
      insights.push("As horas estimadas parecem baixas para a área do projeto. Considere revisar as etapas de trabalho.");
    }
    
    if (state.calculations.profitMarginPercentage < 15) {
      insights.push("Atenção: sua margem de lucro está abaixo do recomendado (mínimo 15%).");
    }
    
    if (state.finalAdjustments.profit < 25) {
      insights.push("Para projetos deste tipo, o percentual de lucro recomendado é de 25-35%.");
    }
    
    if (state.tasks.length === 0) {
      insights.push("Adicione as etapas do projeto para um orçamento mais preciso.");
    }
    
    if (state.discount > 10) {
      insights.push("O desconto aplicado está reduzindo significativamente sua margem de lucro.");
    }
    
    if (insights.length === 0) {
      insights.push("Seu orçamento parece equilibrado. Revise os valores antes de finalizar.");
    }
    
    return insights;
  };

  return (
    <div className="space-y-8">
      {/* Seção 1: Informações do Projeto */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">1</div>
            Informações do Projeto
          </CardTitle>
          <CardDescription>
            Preencha os dados básicos do projeto para começar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProjectInformation
            projectInfo={state.projectInfo}
            updateProjectInfo={updateProjectInfo}
          />
        </CardContent>
      </Card>
      
      {/* Seção 2: Etapas do Projeto */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">2</div>
            Etapas do Projeto
            <Hourglass className="w-5 h-5 ml-auto text-muted-foreground" />
          </CardTitle>
          <CardDescription>
            Adicione cada etapa de trabalho com seu colaborador responsável e horas estimadas
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ProjectTasks
            tasks={state.tasks}
            collaborators={mockCollaborators}
            addTask={addTask}
            updateTask={updateTask}
            removeTask={removeTask}
            formatCurrency={formatCurrency}
            totalHours={state.calculations.totalHours}
            totalCost={state.calculations.totalTasksCost}
          />
        </CardContent>
      </Card>
      
      {/* Seção 3: Custo do Escritório */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">3</div>
            Custo Médio por Hora do Escritório
            <Wallet className="w-5 h-5 ml-auto text-muted-foreground" />
          </CardTitle>
          <CardDescription>
            Custo operacional aplicado proporcionalmente ao tempo do projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <OfficeCosts
            officeCost={state.officeCost}
            updateOfficeCost={updateOfficeCost}
            hourlyRate={state.calculations.officeHourlyRate}
            projectHours={state.calculations.totalHours}
            totalOfficeCost={state.calculations.totalOfficeCost}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
      
      {/* Seção 4: Custos Extras */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">4</div>
            Custos Extras do Projeto
            <BarChart2 className="w-5 h-5 ml-auto text-muted-foreground" />
          </CardTitle>
          <CardDescription>
            Despesas adicionais específicas deste projeto
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ExtraCosts
            extraCosts={state.extraCosts}
            updateExtraCosts={updateExtraCosts}
            totalExtraCosts={state.calculations.totalExtraCost}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
      
      {/* Seção 5: Ajustes Técnicos */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">5</div>
            Ajustes Técnicos
            <Percent className="w-5 h-5 ml-auto text-muted-foreground" />
          </CardTitle>
          <CardDescription>
            Ajustes sobre o custo real do projeto (complexidade, imprevistos, cliente)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <TechnicalAdjustments
            technicalAdjustments={state.technicalAdjustments}
            updateTechnicalAdjustments={updateTechnicalAdjustments}
            baseCost={state.calculations.baseCost}
            totalAdjustmentValue={state.calculations.technicalAdjustmentsValue}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
      
      {/* Seção 6: Ajustes Finais */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">6</div>
            Ajustes Finais
            <Calculator className="w-5 h-5 ml-auto text-muted-foreground" />
          </CardTitle>
          <CardDescription>
            Lucro, impostos e taxas com cálculo reverso para proteção da margem
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <FinalAdjustments
            finalAdjustments={state.finalAdjustments}
            updateFinalAdjustments={updateFinalAdjustments}
            valueWithAdjustments={state.calculations.valueWithTechnicalAdjustments}
            profitValue={state.calculations.profitValue}
            valueBeforeTaxes={state.calculations.valueBeforeTaxes}
            taxesAndFeesValue={state.calculations.taxesAndFeesValue}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
      
      {/* Seção 7: Comparativo Hora × m² */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">7</div>
            Comparativo Hora × m²
          </CardTitle>
          <CardDescription>
            Análise comparativa entre valores por hora e por metro quadrado
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <HourM2Comparison
            totalHours={state.calculations.totalHours}
            finalValue={state.calculations.finalValue}
            area={state.projectInfo.area}
            valuePerHour={state.calculations.finalValuePerHour}
            valuePerSqMeter={state.calculations.finalValuePerSqMeter}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>
      
      {/* Seção 8: Resumo Final com IA */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="bg-black/5 dark:bg-white/5 pb-3">
          <CardTitle className="flex items-center gap-2 text-xl font-medium">
            <div className="w-8 h-8 rounded-full bg-[#FFD600] text-black flex items-center justify-center">8</div>
            Resumo Final
            <Lightbulb className="w-5 h-5 ml-auto text-muted-foreground" />
          </CardTitle>
          <CardDescription>
            Resumo dos valores calculados e ajustes finais do orçamento
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <FinalSummary
            projectInfo={state.projectInfo}
            baseCost={state.calculations.baseCost}
            technicalAdjustmentsValue={state.calculations.technicalAdjustmentsValue}
            profitValue={state.calculations.profitValue}
            taxesAndFeesValue={state.calculations.taxesAndFeesValue}
            finalValue={state.calculations.finalValue}
            discount={state.discount}
            updateDiscount={updateDiscount}
            discountValue={state.calculations.discountValue}
            discountedFinalValue={state.calculations.discountedFinalValue}
            profitMarginPercentage={state.calculations.profitMarginPercentage}
            formatCurrency={formatCurrency}
          />
          
          {/* IA Insights */}
          <AIInsightBox 
            title="Insights da IA para seu orçamento"
            insights={getProjectInsights()}
            type={state.calculations.profitMarginPercentage < 15 ? 'warning' : 'info'}
          />
        </CardContent>
      </Card>
      
      {/* Botão de salvar orçamento */}
      <div className="flex justify-end">
        <button 
          className="flex items-center px-5 py-3 bg-[#FFD600] text-black font-medium rounded-md hover:bg-[#FFD600]/90 transition shadow-sm ml-auto"
          onClick={handleSaveFinal}
          disabled={isSaving}
        >
          {isSaving ? 'Salvando...' : 'Finalizar Orçamento'}
        </button>
      </div>
    </div>
  );
};

export default NewBudgetForm;
