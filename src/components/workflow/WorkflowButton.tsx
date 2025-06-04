"use client";

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ETF } from '@/types';
import { useWorkflow } from '@/lib/workflow/integration';

interface WorkflowButtonProps {
  selectedETFs: ETF[];
  onNavigate?: () => void;
  variant?: 'primary' | 'secondary';
}

export function WorkflowButton({ selectedETFs, onNavigate, variant = 'primary' }: WorkflowButtonProps) {
  const { selectETFsForSimulation, getNextStepData } = useWorkflow();
  const nextStep = getNextStepData();

  if (!nextStep || selectedETFs.length === 0) return null;

  const handleClick = () => {
    if (nextStep.nextStep === 'simulation') {
      selectETFsForSimulation(selectedETFs);
      window.location.href = '/simulator';
    }
    onNavigate?.();
  };

  const buttonClass = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <button
      onClick={handleClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${buttonClass}`}
    >
      <span>{nextStep.buttonText}</span>
      <ArrowRight className="w-4 h-4" />
    </button>
  );
} 