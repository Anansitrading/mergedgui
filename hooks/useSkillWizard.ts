import { useReducer, useCallback } from 'react';
import type {
  SkillCategory,
  SkillOutputFormat,
  InputSchemaField,
  ExecuteSkillResponse,
} from '../types/skills';

export interface WizardFormData {
  // Step 1: Basic Info
  name: string;
  description: string;
  category: SkillCategory;
  icon: string;

  // Step 2: Prompt Configuration
  systemPrompt: string;
  userPromptTemplate: string;

  // Step 3: Input Fields
  inputSchema: InputSchemaField[];

  // Step 4: Model Settings
  model: string;
  temperature: number;
  maxTokens: number;
  outputFormat: SkillOutputFormat;
}

export interface WizardState {
  currentStep: 1 | 2 | 3 | 4 | 5;
  formData: WizardFormData;
  stepValidation: Record<1 | 2 | 3 | 4 | 5, boolean>;
  isLoading: boolean;
  isTesting: boolean;
  testResult: ExecuteSkillResponse | null;
  errors: Record<string, string>;
}

type WizardAction =
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'GO_TO_STEP'; step: 1 | 2 | 3 | 4 | 5 }
  | { type: 'UPDATE_FIELD'; field: keyof WizardFormData; value: unknown }
  | { type: 'UPDATE_INPUT_SCHEMA'; schema: InputSchemaField[] }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_TESTING'; testing: boolean }
  | { type: 'SET_TEST_RESULT'; result: ExecuteSkillResponse | null }
  | { type: 'VALIDATE_STEP'; step: 1 | 2 | 3 | 4 | 5; valid: boolean }
  | { type: 'SET_ERRORS'; errors: Record<string, string> }
  | { type: 'CLEAR_ERROR'; field: string }
  | { type: 'RESET' };

const initialFormData: WizardFormData = {
  name: '',
  description: '',
  category: 'custom',
  icon: '⚡',
  systemPrompt: '',
  userPromptTemplate: '',
  inputSchema: [],
  model: 'claude-3.5-sonnet',
  temperature: 0.7,
  maxTokens: 4096,
  outputFormat: 'markdown',
};

const initialState: WizardState = {
  currentStep: 1,
  formData: initialFormData,
  stepValidation: {
    1: false,
    2: false,
    3: true, // Input schema is optional
    4: true, // Has defaults
    5: false,
  },
  isLoading: false,
  isTesting: false,
  testResult: null,
  errors: {},
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'NEXT_STEP':
      if (state.currentStep < 5) {
        return {
          ...state,
          currentStep: (state.currentStep + 1) as 1 | 2 | 3 | 4 | 5,
        };
      }
      return state;

    case 'PREV_STEP':
      if (state.currentStep > 1) {
        return {
          ...state,
          currentStep: (state.currentStep - 1) as 1 | 2 | 3 | 4 | 5,
        };
      }
      return state;

    case 'GO_TO_STEP':
      // Only allow going to steps that are validated or previous steps
      if (action.step <= state.currentStep || state.stepValidation[action.step - 1 as 1 | 2 | 3 | 4 | 5]) {
        return {
          ...state,
          currentStep: action.step,
        };
      }
      return state;

    case 'UPDATE_FIELD':
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.field]: action.value,
        },
        errors: {
          ...state.errors,
          [action.field]: '', // Clear error when field is updated
        },
      };

    case 'UPDATE_INPUT_SCHEMA':
      return {
        ...state,
        formData: {
          ...state.formData,
          inputSchema: action.schema,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.loading,
      };

    case 'SET_TESTING':
      return {
        ...state,
        isTesting: action.testing,
      };

    case 'SET_TEST_RESULT':
      return {
        ...state,
        testResult: action.result,
      };

    case 'VALIDATE_STEP':
      return {
        ...state,
        stepValidation: {
          ...state.stepValidation,
          [action.step]: action.valid,
        },
      };

    case 'SET_ERRORS':
      return {
        ...state,
        errors: action.errors,
      };

    case 'CLEAR_ERROR':
      const { [action.field]: _, ...remainingErrors } = state.errors;
      return {
        ...state,
        errors: remainingErrors,
      };

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useSkillWizard() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const goToStep = useCallback((step: 1 | 2 | 3 | 4 | 5) => {
    dispatch({ type: 'GO_TO_STEP', step });
  }, []);

  const updateField = useCallback(
    <K extends keyof WizardFormData>(field: K, value: WizardFormData[K]) => {
      dispatch({ type: 'UPDATE_FIELD', field, value });
    },
    []
  );

  const updateInputSchema = useCallback((schema: InputSchemaField[]) => {
    dispatch({ type: 'UPDATE_INPUT_SCHEMA', schema });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: 'SET_LOADING', loading });
  }, []);

  const setTesting = useCallback((testing: boolean) => {
    dispatch({ type: 'SET_TESTING', testing });
  }, []);

  const setTestResult = useCallback((result: ExecuteSkillResponse | null) => {
    dispatch({ type: 'SET_TEST_RESULT', result });
  }, []);

  const validateStep = useCallback((step: 1 | 2 | 3 | 4 | 5, valid: boolean) => {
    dispatch({ type: 'VALIDATE_STEP', step, valid });
  }, []);

  const setErrors = useCallback((errors: Record<string, string>) => {
    dispatch({ type: 'SET_ERRORS', errors });
  }, []);

  const clearError = useCallback((field: string) => {
    dispatch({ type: 'CLEAR_ERROR', field });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  return {
    state,
    nextStep,
    prevStep,
    goToStep,
    updateField,
    updateInputSchema,
    setLoading,
    setTesting,
    setTestResult,
    validateStep,
    setErrors,
    clearError,
    reset,
  };
}
