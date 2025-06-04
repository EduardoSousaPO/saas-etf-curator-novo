"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import ProfileResult from '@/components/onboarding/ProfileResult';
import { ProfileAssessment } from '@/lib/onboarding/profiles';

export default function OnboardingPage() {
  const [step, setStep] = useState<'wizard' | 'result'>('wizard');
  const [assessment, setAssessment] = useState<ProfileAssessment | null>(null);
  const router = useRouter();

  const handleWizardComplete = (profileAssessment: ProfileAssessment) => {
    setAssessment(profileAssessment);
    setStep('result');
  };

  const handleResultContinue = () => {
    // Redirecionar para dashboard ou página principal
    router.push('/dashboard');
  };

  if (step === 'result' && assessment) {
    return (
      <ProfileResult 
        assessment={assessment} 
        onContinue={handleResultContinue}
      />
    );
  }

  return (
    <OnboardingWizard onComplete={handleWizardComplete} />
  );
} 