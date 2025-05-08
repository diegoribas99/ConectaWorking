import React, { useState } from 'react';
import ProjectInformation from './ProjectInformation';
import ProjectTasks from './ProjectTasks';
import OfficeCosts from './OfficeCosts';
import ExtraCosts from './ExtraCosts';
import TechnicalAdjustments from './TechnicalAdjustments';
import FinalAdjustments from './FinalAdjustments';
import HourM2Comparison from './HourM2Comparison';
import FinalSummary from './FinalSummary';
import { useBudgetCalculator, CollaboratorType } from '@/lib/useBudgetCalculator';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

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

  const exportAsPdf = () => {
    toast({
      title: "Exportando PDF",
      description: "Funcionalidade de exportação PDF será implementada em breve.",
    });
  };

  const sendByEmail = () => {
    toast({
      title: "Enviando por e-mail",
      description: "Funcionalidade de envio por e-mail será implementada em breve.",
    });
  };

  const sendByWhatsApp = () => {
    toast({
      title: "Enviando por WhatsApp",
      description: "Funcionalidade de envio por WhatsApp será implementada em breve.",
    });
  };

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button 
          className="lg:hidden flex items-center px-4 py-2 bg-background text-sm font-medium rounded-md shadow-sm hover:bg-muted transition"
          onClick={handleSaveDraft}
          disabled={isSavingDraft}
        >
          <i className="fa-solid fa-floppy-disk mr-2"></i> 
          {isSavingDraft ? 'Salvando...' : 'Salvar'}
        </button>
        <button className="flex items-center px-4 py-2 bg-background text-sm font-medium rounded-md shadow-sm hover:bg-muted transition">
          <i className="fa-solid fa-copy mr-2"></i> Usar Anterior
        </button>
      </div>
      
      {/* Project Information */}
      <ProjectInformation
        projectInfo={state.projectInfo}
        updateProjectInfo={updateProjectInfo}
      />
      
      {/* Project Tasks */}
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
      
      {/* Office Costs */}
      <OfficeCosts
        officeCost={state.officeCost}
        updateOfficeCost={updateOfficeCost}
        hourlyRate={state.calculations.officeHourlyRate}
        projectHours={state.calculations.totalHours}
        totalOfficeCost={state.calculations.totalOfficeCost}
        formatCurrency={formatCurrency}
      />
      
      {/* Extra Costs */}
      <ExtraCosts
        extraCosts={state.extraCosts}
        updateExtraCosts={updateExtraCosts}
        totalExtraCosts={state.calculations.totalExtraCost}
        formatCurrency={formatCurrency}
      />
      
      {/* Technical Adjustments */}
      <TechnicalAdjustments
        technicalAdjustments={state.technicalAdjustments}
        updateTechnicalAdjustments={updateTechnicalAdjustments}
        baseCost={state.calculations.baseCost}
        totalAdjustmentValue={state.calculations.technicalAdjustmentsValue}
        formatCurrency={formatCurrency}
      />
      
      {/* Final Adjustments */}
      <FinalAdjustments
        finalAdjustments={state.finalAdjustments}
        updateFinalAdjustments={updateFinalAdjustments}
        valueWithAdjustments={state.calculations.valueWithTechnicalAdjustments}
        profitValue={state.calculations.profitValue}
        valueBeforeTaxes={state.calculations.valueBeforeTaxes}
        taxesAndFeesValue={state.calculations.taxesAndFeesValue}
        formatCurrency={formatCurrency}
      />
      
      {/* Hour × m² Comparison */}
      <HourM2Comparison
        totalHours={state.calculations.totalHours}
        finalValue={state.calculations.finalValue}
        area={state.projectInfo.area}
        valuePerHour={state.calculations.finalValuePerHour}
        valuePerSqMeter={state.calculations.finalValuePerSqMeter}
        formatCurrency={formatCurrency}
      />
      
      {/* Final Summary */}
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
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 pb-10">
        <button 
          className="flex items-center px-5 py-3 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 transition shadow-sm"
          onClick={exportAsPdf}
        >
          <i className="fa-solid fa-file-pdf mr-2"></i> Exportar PDF
        </button>
        <button 
          className="flex items-center px-5 py-3 bg-background font-medium rounded-md hover:bg-muted transition shadow-sm"
          onClick={sendByEmail}
        >
          <i className="fa-solid fa-envelope mr-2"></i> Enviar por E-mail
        </button>
        <button 
          className="flex items-center px-5 py-3 bg-background font-medium rounded-md hover:bg-muted transition shadow-sm"
          onClick={sendByWhatsApp}
        >
          <i className="fa-brands fa-whatsapp mr-2"></i> Enviar por WhatsApp
        </button>
        <button 
          className="flex items-center px-5 py-3 bg-success/10 text-success font-medium rounded-md hover:bg-success/20 transition shadow-sm ml-auto"
          onClick={handleSaveFinal}
          disabled={isSaving}
        >
          <i className="fa-solid fa-check mr-2"></i> 
          {isSaving ? 'Salvando...' : 'Salvar Orçamento'}
        </button>
      </div>
    </div>
  );
};

export default NewBudgetForm;
