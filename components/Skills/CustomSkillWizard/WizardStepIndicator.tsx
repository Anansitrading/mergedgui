import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';

interface WizardStepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  stepValidation: Record<1 | 2 | 3 | 4 | 5, boolean>;
  onStepClick?: (step: 1 | 2 | 3 | 4 | 5) => void;
}

const STEPS = [
  { number: 1, label: 'Basic Info' },
  { number: 2, label: 'Prompts' },
  { number: 3, label: 'Inputs' },
  { number: 4, label: 'Model' },
  { number: 5, label: 'Review' },
] as const;

export function WizardStepIndicator({
  currentStep,
  stepValidation,
  onStepClick,
}: WizardStepIndicatorProps) {
  const isStepAccessible = (stepNumber: 1 | 2 | 3 | 4 | 5) => {
    // Can always go back to previous steps
    if (stepNumber < currentStep) return true;
    // Can go to current step
    if (stepNumber === currentStep) return true;
    // Can go to next step if previous step is valid
    if (stepNumber === currentStep + 1 && stepValidation[currentStep]) return true;
    return false;
  };

  const isStepCompleted = (stepNumber: 1 | 2 | 3 | 4 | 5) => {
    return stepNumber < currentStep && stepValidation[stepNumber];
  };

  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, index) => {
        const isActive = step.number === currentStep;
        const isCompleted = isStepCompleted(step.number);
        const isAccessible = isStepAccessible(step.number);

        return (
          <div key={step.number} className="flex items-center flex-1 last:flex-none">
            {/* Step Circle & Label */}
            <button
              onClick={() => isAccessible && onStepClick?.(step.number)}
              disabled={!isAccessible}
              className={cn(
                'flex flex-col items-center gap-2 transition-all',
                isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
              )}
            >
              {/* Circle */}
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all',
                  isActive && 'bg-primary border-primary text-primary-foreground',
                  isCompleted && 'bg-green-500 border-green-500 text-white',
                  !isActive && !isCompleted && isAccessible && 'bg-muted border-border text-foreground hover:border-primary/50',
                  !isActive && !isCompleted && !isAccessible && 'bg-muted/50 border-border/50 text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check size={18} />
                ) : (
                  step.number
                )}
              </div>

              {/* Label */}
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap transition-colors',
                  isActive && 'text-primary',
                  isCompleted && 'text-green-500',
                  !isActive && !isCompleted && 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </button>

            {/* Connector Line */}
            {index < STEPS.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 mt-[-1.5rem]">
                <div
                  className={cn(
                    'h-full rounded-full transition-colors',
                    isCompleted ? 'bg-green-500' : 'bg-border'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
