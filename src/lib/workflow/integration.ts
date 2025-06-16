import React from 'react';
import { ETF } from '@/types';
import { PortfolioAllocation } from '@/lib/portfolio/simulator';

export interface WorkflowState {
  currentStep: 'recommendations' | 'simulation' | 'comparison' | 'implementation';
  selectedETFs: ETF[];
  simulationResults?: any;
  comparisonData?: any;
  userActions: WorkflowAction[];
}

export interface WorkflowAction {
  type: 'etf_selected' | 'simulation_run' | 'comparison_made' | 'strategy_implemented';
  timestamp: Date;
  data: any;
}

export interface WorkflowButtonProps {
  selectedETFs: ETF[];
  onNavigate?: () => void;
  variant?: 'primary' | 'secondary';
}

// Gerenciador global do workflow
class WorkflowManager {
  private state: WorkflowState = {
    currentStep: 'recommendations',
    selectedETFs: [],
    userActions: []
  };

  private listeners: ((state: WorkflowState) => void)[] = [];

  getState(): WorkflowState {
    return { ...this.state };
  }

  setState(newState: Partial<WorkflowState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  addAction(action: WorkflowAction) {
    this.state.userActions.push(action);
    this.notifyListeners();
  }

  subscribe(listener: (state: WorkflowState) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  selectETFsForSimulation(etfs: ETF[]) {
    this.setState({
      selectedETFs: etfs,
      currentStep: 'simulation'
    });
    this.addAction({
      type: 'etf_selected',
      timestamp: new Date(),
      data: { etfs: etfs.map(e => e.symbol) }
    });
  }

  getNextStepData() {
    switch (this.state.currentStep) {
      case 'recommendations':
        return {
          nextStep: 'simulation',
          buttonText: 'Simular Carteira',
          description: 'Teste essa carteira no simulador'
        };
      case 'simulation':
        return {
          nextStep: 'comparison',
          buttonText: 'Comparar ETFs',
          description: 'Analise detalhadamente os ETFs'
        };
      case 'comparison':
        return {
          nextStep: 'implementation',
          buttonText: 'Implementar Estratégia',
          description: 'Adicione aos favoritos e configure alertas'
        };
      default:
        return null;
    }
  }
}

export const workflowManager = new WorkflowManager();

// Hook para usar o workflow em React
export function useWorkflow() {
  const [state, setState] = React.useState(workflowManager.getState());

  React.useEffect(() => {
    const unsubscribe = workflowManager.subscribe(setState);
    return unsubscribe;
  }, []);

  return {
    state,
    selectETFsForSimulation: workflowManager.selectETFsForSimulation.bind(workflowManager),
    getNextStepData: workflowManager.getNextStepData.bind(workflowManager)
  };
} 