import { useState, useEffect, useCallback } from 'react';

export type CollaboratorType = {
  id: number;
  name: string;
  hourlyRate: number;
  role?: string;
};

export type TaskType = {
  id: number;
  description: string;
  collaboratorId?: number;
  collaborator?: CollaboratorType;
  hours: number;
  hourlyRate: number;
};

export type OfficeCostType = {
  fixedCosts: number;
  variableCosts: number;
  productiveHoursMonth: number;
  defaultPricePerSqMeter?: number;
};

export type ExtraCostType = {
  technicalVisit: number;
  transport: number;
  printing: number;
  fees: number;
  otherServices: number;
};

export type TechnicalAdjustmentsType = {
  complexity: number;
  technicalReserve: number;
  clientDifficulty: number;
  extras: number;
};

export type FinalAdjustmentsType = {
  profit: number;
  taxes: number;
  cardFee: number;
};

export type ProjectInfoType = {
  name: string;
  type: string;
  area: number;
  city: string;
  deliveryLevel: 'basic' | 'executive' | 'premium';
  clientId?: number;
  clientName?: string;
  urgency?: boolean;
};

export interface BudgetCalculatorState {
  projectInfo: ProjectInfoType;
  tasks: TaskType[];
  officeCost: OfficeCostType;
  extraCosts: ExtraCostType;
  technicalAdjustments: TechnicalAdjustmentsType;
  finalAdjustments: FinalAdjustmentsType;
  discount: number;
  calculations: {
    totalHours: number;
    totalTasksCost: number;
    officeHourlyRate: number;
    totalOfficeCost: number;
    totalExtraCost: number;
    baseCost: number;
    technicalAdjustmentsValue: number;
    valueWithTechnicalAdjustments: number;
    profitValue: number;
    valueBeforeTaxes: number;
    taxesAndFeesValue: number;
    finalValue: number;
    finalValuePerHour: number;
    finalValuePerSqMeter: number;
    discountValue: number;
    discountedFinalValue: number;
    profitMarginPercentage: number;
  };
}

const defaultState: BudgetCalculatorState = {
  projectInfo: {
    name: '',
    type: 'residential',
    area: 0,
    city: '',
    deliveryLevel: 'basic',
    urgency: false,
  },
  tasks: [],
  officeCost: {
    fixedCosts: 0,
    variableCosts: 0,
    productiveHoursMonth: 160,
    defaultPricePerSqMeter: 0,
  },
  extraCosts: {
    technicalVisit: 0,
    transport: 0,
    printing: 0,
    fees: 0,
    otherServices: 0,
  },
  technicalAdjustments: {
    complexity: 0,
    technicalReserve: 0,
    clientDifficulty: 0,
    extras: 0,
  },
  finalAdjustments: {
    profit: 30,
    taxes: 11,
    cardFee: 0,
  },
  discount: 0,
  calculations: {
    totalHours: 0,
    totalTasksCost: 0,
    officeHourlyRate: 0,
    totalOfficeCost: 0,
    totalExtraCost: 0,
    baseCost: 0,
    technicalAdjustmentsValue: 0,
    valueWithTechnicalAdjustments: 0,
    profitValue: 0,
    valueBeforeTaxes: 0,
    taxesAndFeesValue: 0,
    finalValue: 0,
    finalValuePerHour: 0,
    finalValuePerSqMeter: 0,
    discountValue: 0,
    discountedFinalValue: 0,
    profitMarginPercentage: 0,
  },
};

export const useBudgetCalculator = (initialState = defaultState) => {
  const [state, setState] = useState<BudgetCalculatorState>(initialState);

  // Function to update project information
  const updateProjectInfo = useCallback((projectInfo: Partial<ProjectInfoType>) => {
    setState((prevState) => ({
      ...prevState,
      projectInfo: {
        ...prevState.projectInfo,
        ...projectInfo,
      },
    }));
  }, []);

  // Function to add a task
  const addTask = useCallback((task: Omit<TaskType, 'id'>) => {
    setState((prevState) => {
      const newId = prevState.tasks.length > 0 
        ? Math.max(...prevState.tasks.map(t => t.id)) + 1 
        : 1;
      
      return {
        ...prevState,
        tasks: [
          ...prevState.tasks,
          { ...task, id: newId },
        ],
      };
    });
  }, []);

  // Function to update a task
  const updateTask = useCallback((id: number, task: Partial<TaskType>) => {
    setState((prevState) => ({
      ...prevState,
      tasks: prevState.tasks.map(t =>
        t.id === id ? { ...t, ...task } : t
      ),
    }));
  }, []);

  // Function to remove a task
  const removeTask = useCallback((id: number) => {
    setState((prevState) => ({
      ...prevState,
      tasks: prevState.tasks.filter(t => t.id !== id),
    }));
  }, []);

  // Function to update office cost
  const updateOfficeCost = useCallback((officeCost: Partial<OfficeCostType>) => {
    setState((prevState) => ({
      ...prevState,
      officeCost: {
        ...prevState.officeCost,
        ...officeCost,
      },
    }));
  }, []);

  // Function to update extra costs
  const updateExtraCosts = useCallback((extraCosts: Partial<ExtraCostType>) => {
    setState((prevState) => ({
      ...prevState,
      extraCosts: {
        ...prevState.extraCosts,
        ...extraCosts,
      },
    }));
  }, []);

  // Function to update technical adjustments
  const updateTechnicalAdjustments = useCallback((adjustments: Partial<TechnicalAdjustmentsType>) => {
    setState((prevState) => ({
      ...prevState,
      technicalAdjustments: {
        ...prevState.technicalAdjustments,
        ...adjustments,
      },
    }));
  }, []);

  // Function to update final adjustments
  const updateFinalAdjustments = useCallback((adjustments: Partial<FinalAdjustmentsType>) => {
    setState((prevState) => ({
      ...prevState,
      finalAdjustments: {
        ...prevState.finalAdjustments,
        ...adjustments,
      },
    }));
  }, []);

  // Function to update discount
  const updateDiscount = useCallback((discount: number) => {
    setState((prevState) => ({
      ...prevState,
      discount,
    }));
  }, []);

  // Calculate all values whenever the state changes
  useEffect(() => {
    const calculations = calculateBudget(state);
    
    setState((prevState) => ({
      ...prevState,
      calculations,
    }));
  }, [
    state.projectInfo, 
    state.tasks, 
    state.officeCost, 
    state.extraCosts, 
    state.technicalAdjustments, 
    state.finalAdjustments, 
    state.discount
  ]);

  // Main calculation function
  const calculateBudget = (state: BudgetCalculatorState) => {
    // Calculate total hours and cost from tasks
    const totalHours = state.tasks.reduce((sum, task) => sum + Number(task.hours), 0);
    const totalTasksCost = state.tasks.reduce((sum, task) => sum + (Number(task.hours) * Number(task.hourlyRate)), 0);
    
    // Calculate office cost per hour
    const totalMonthlyCost = Number(state.officeCost.fixedCosts) + Number(state.officeCost.variableCosts);
    const officeHourlyRate = state.officeCost.productiveHoursMonth > 0 
      ? totalMonthlyCost / state.officeCost.productiveHoursMonth 
      : 0;
    
    // Calculate total office cost for this project
    const totalOfficeCost = officeHourlyRate * totalHours;
    
    // Calculate total extra costs
    const totalExtraCost = (
      Number(state.extraCosts.technicalVisit) +
      Number(state.extraCosts.transport) +
      Number(state.extraCosts.printing) +
      Number(state.extraCosts.fees) +
      Number(state.extraCosts.otherServices)
    );
    
    // Calculate base cost
    const baseCost = totalTasksCost + totalOfficeCost + totalExtraCost;
    
    // Calculate total technical adjustments percentage
    const technicalAdjustmentsPercentage = (
      Number(state.technicalAdjustments.complexity) +
      Number(state.technicalAdjustments.technicalReserve) +
      Number(state.technicalAdjustments.clientDifficulty) +
      Number(state.technicalAdjustments.extras)
    );
    
    // Calculate technical adjustments value
    const technicalAdjustmentsValue = baseCost * (technicalAdjustmentsPercentage / 100);
    
    // Calculate value with technical adjustments
    const valueWithTechnicalAdjustments = baseCost + technicalAdjustmentsValue;
    
    // Calculate profit
    const profitValue = valueWithTechnicalAdjustments * (Number(state.finalAdjustments.profit) / 100);
    
    // Calculate value before taxes and fees
    const valueBeforeTaxes = valueWithTechnicalAdjustments + profitValue;
    
    // Calculate total taxes and fees percentage
    const taxesAndFeesPercentage = Number(state.finalAdjustments.taxes) + Number(state.finalAdjustments.cardFee);
    
    // Apply reverse calculation for taxes and fees
    const taxesAndFeesValue = taxesAndFeesPercentage > 0
      ? (valueBeforeTaxes / (1 - (taxesAndFeesPercentage / 100))) - valueBeforeTaxes
      : 0;
    
    // Calculate final value
    const finalValue = valueBeforeTaxes + taxesAndFeesValue;
    
    // Calculate values per hour and per square meter
    const finalValuePerHour = totalHours > 0 ? finalValue / totalHours : 0;
    const finalValuePerSqMeter = state.projectInfo.area > 0 ? finalValue / state.projectInfo.area : 0;
    
    // Calculate discount
    const discountValue = finalValue * (Number(state.discount) / 100);
    const discountedFinalValue = finalValue - discountValue;
    
    // Calculate profit margin percentage
    const profitMarginPercentage = baseCost > 0 
      ? ((discountedFinalValue - baseCost) / discountedFinalValue) * 100 
      : 0;
    
    return {
      totalHours,
      totalTasksCost,
      officeHourlyRate,
      totalOfficeCost,
      totalExtraCost,
      baseCost,
      technicalAdjustmentsValue,
      valueWithTechnicalAdjustments,
      profitValue,
      valueBeforeTaxes,
      taxesAndFeesValue,
      finalValue,
      finalValuePerHour,
      finalValuePerSqMeter,
      discountValue,
      discountedFinalValue,
      profitMarginPercentage,
    };
  };

  // Format currency function
  const formatCurrency = useCallback((value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }, []);

  return {
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
  };
};
