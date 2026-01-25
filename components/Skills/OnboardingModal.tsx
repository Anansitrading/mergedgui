/**
 * OnboardingModal Component
 * Welcome modal for first-time users of the Skills feature
 * Task 3_5: Analytics & Polish
 */

import { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Clock,
  Zap,
  Play,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface OnboardingModalProps {
  onClose: () => void;
  onStartWithTemplate: () => void;
  onStartFromScratch: () => void;
}

const STORAGE_KEY = 'kijko_skills_onboarded';

interface OnboardingSlide {
  title: string;
  description: string;
  icon: typeof Sparkles;
  iconColor: string;
  features?: { icon: typeof Play; label: string; description: string }[];
}

const SLIDES: OnboardingSlide[] = [
  {
    title: 'Welcome to Skills!',
    description:
      'Skills are AI capabilities you can create, customize, and automate. Build powerful workflows that save you time and enhance your productivity.',
    icon: Sparkles,
    iconColor: 'text-primary',
  },
  {
    title: 'Three Types of Skills',
    description:
      'Organize your AI capabilities based on how you want to trigger them.',
    icon: Zap,
    iconColor: 'text-yellow-500',
    features: [
      {
        icon: Play,
        label: 'Skills',
        description: 'On-demand AI capabilities you run manually',
      },
      {
        icon: Clock,
        label: 'Habits',
        description: 'Scheduled executions that run automatically',
      },
      {
        icon: Zap,
        label: 'Reflexes',
        description: 'Triggered by events like webhooks or file changes',
      },
    ],
  },
  {
    title: 'Ready to Get Started?',
    description:
      'Create your first skill from a template or build one from scratch. You can always customize it later.',
    icon: Check,
    iconColor: 'text-green-500',
  },
];

export function OnboardingModal({
  onClose,
  onStartWithTemplate,
  onStartFromScratch,
}: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const isLastSlide = currentSlide === SLIDES.length - 1;
  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, 'true');
    }
    onClose();
  };

  const handleNext = () => {
    if (isLastSlide) {
      handleClose();
      onStartWithTemplate();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    handleClose();
    onStartFromScratch();
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, dontShowAgain]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors z-10"
          aria-label="Close onboarding"
        >
          <X size={18} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon */}
          <div
            className={cn(
              'inline-flex items-center justify-center w-16 h-16 rounded-full mb-6',
              'bg-primary/10'
            )}
          >
            <Icon size={32} className={slide.iconColor} />
          </div>

          {/* Title */}
          <h2
            id="onboarding-title"
            className="text-2xl font-semibold text-foreground mb-3"
          >
            {slide.title}
          </h2>

          {/* Description */}
          <p className="text-muted-foreground mb-6">{slide.description}</p>

          {/* Features list (for slide 2) */}
          {slide.features && (
            <div className="space-y-4 mb-6 text-left">
              {slide.features.map((feature) => {
                const FeatureIcon = feature.icon;
                return (
                  <div
                    key={feature.label}
                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                      <FeatureIcon size={18} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {feature.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Slide indicators */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-all',
                  index === currentSlide
                    ? 'w-6 bg-primary'
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {currentSlide > 0 && (
                <button
                  onClick={handlePrev}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!isLastSlide && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip
                </button>
              )}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
              >
                {isLastSlide ? 'Start with Template' : 'Next'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Don't show again */}
          {isLastSlide && (
            <label className="flex items-center justify-center gap-2 mt-4 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm text-muted-foreground">
                Don't show this again
              </span>
            </label>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Hook to check if user has completed onboarding
 */
export function useSkillsOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasOnboarded = localStorage.getItem(STORAGE_KEY);
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowOnboarding(false);
  };

  const dismissOnboarding = () => {
    setShowOnboarding(false);
  };

  const resetOnboarding = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowOnboarding(true);
  };

  return {
    showOnboarding,
    completeOnboarding,
    dismissOnboarding,
    resetOnboarding,
  };
}
