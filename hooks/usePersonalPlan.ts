/**
 * usePersonalPlan Hook
 * 
 * A custom React hook for managing personal plan generation state and operations.
 * This hook provides a clean interface for components to interact with the Personal Plan API.
 */

import { useCallback, useState } from 'react';
import {
    generatePersonalPlan,
    generatePersonalPlanWithRetry,
    PersonalPlanAPIError,
    validateUserData,
    type PersonalPlan,
    type UserData,
} from '../services/personalPlanAPI';

export interface UsePersonalPlanState {
    // Data state
    plan: PersonalPlan | null;
    userData: UserData | null;

    // Loading states
    isLoading: boolean;
    isValidating: boolean;

    // Error state
    error: PersonalPlanAPIError | null;
    validationErrors: string[];

    // Success state
    isSuccess: boolean;
}

export interface UsePersonalPlanActions {
    // Core actions
    generatePlan: (userData: UserData) => Promise<PersonalPlan | null>;
    generatePlanWithRetry: (userData: UserData, maxRetries?: number, retryDelay?: number) => Promise<PersonalPlan | null>;

    // Validation
    validateUserData: (userData: UserData) => boolean;

    // State management
    clearError: () => void;
    clearPlan: () => void;
    reset: () => void;
    setUserData: (userData: UserData | null) => void;
}

export interface UsePersonalPlanOptions {
    // Auto-clear error after this many milliseconds
    autoClearError?: number;

    // Callback functions
    onSuccess?: (plan: PersonalPlan) => void;
    onError?: (error: PersonalPlanAPIError) => void;
    onValidationError?: (errors: string[]) => void;
}

export type UsePersonalPlanReturn = UsePersonalPlanState & UsePersonalPlanActions;

/**
 * Custom hook for managing personal plan generation
 * 
 * @param options - Configuration options for the hook
 * @returns Object containing state and actions for personal plan management
 */
export const usePersonalPlan = (options: UsePersonalPlanOptions = {}): UsePersonalPlanReturn => {
    const { autoClearError, onSuccess, onError, onValidationError } = options;

    // State management
    const [state, setState] = useState<UsePersonalPlanState>({
        plan: null,
        userData: null,
        isLoading: false,
        isValidating: false,
        error: null,
        validationErrors: [],
        isSuccess: false,
    });

    // Auto-clear error functionality
    const clearErrorWithDelay = useCallback(() => {
        if (autoClearError && autoClearError > 0) {
            setTimeout(() => {
                setState(prev => ({ ...prev, error: null }));
            }, autoClearError);
        }
    }, [autoClearError]);

    /**
     * Validate user data and update validation errors
     */
    const validateUserDataAction = useCallback((userData: UserData): boolean => {
        setState(prev => ({ ...prev, isValidating: true }));

        const errors = validateUserData(userData);
        const isValid = errors.length === 0;

        setState(prev => ({
            ...prev,
            validationErrors: errors,
            isValidating: false,
        }));

        if (!isValid && onValidationError) {
            onValidationError(errors);
        }

        return isValid;
    }, [onValidationError]);

    /**
     * Generate personal plan (basic version)
     */
    const generatePlanAction = useCallback(async (userData: UserData): Promise<PersonalPlan | null> => {
        // Reset error state
        setState(prev => ({
            ...prev,
            error: null,
            isLoading: true,
            isSuccess: false,
            userData,
        }));

        try {
            // Validate data first
            if (!validateUserDataAction(userData)) {
                throw new PersonalPlanAPIError(
                    'Validation failed. Please check your input data.',
                    400,
                    'VALIDATION_ERROR'
                );
            }

            // Generate plan
            const plan = await generatePersonalPlan(userData);

            // Update state with success
            setState(prev => ({
                ...prev,
                plan,
                isLoading: false,
                isSuccess: true,
            }));

            // Call success callback
            if (onSuccess) {
                onSuccess(plan);
            }

            return plan;

        } catch (err) {
            const error = err instanceof PersonalPlanAPIError ? err :
                new PersonalPlanAPIError(err instanceof Error ? err.message : 'Unknown error');

            // Update state with error
            setState(prev => ({
                ...prev,
                error,
                isLoading: false,
                isSuccess: false,
            }));

            // Call error callback
            if (onError) {
                onError(error);
            }

            // Auto-clear error if configured
            clearErrorWithDelay();

            return null;
        }
    }, [validateUserDataAction, onSuccess, onError, clearErrorWithDelay]);

    /**
     * Generate personal plan with retry logic
     */
    const generatePlanWithRetryAction = useCallback(async (
        userData: UserData,
        maxRetries: number = 3,
        retryDelay: number = 2000
    ): Promise<PersonalPlan | null> => {
        // Reset error state
        setState(prev => ({
            ...prev,
            error: null,
            isLoading: true,
            isSuccess: false,
            userData,
        }));

        try {
            // Validate data first
            if (!validateUserDataAction(userData)) {
                throw new PersonalPlanAPIError(
                    'Validation failed. Please check your input data.',
                    400,
                    'VALIDATION_ERROR'
                );
            }

            // Generate plan with retry
            const plan = await generatePersonalPlanWithRetry(userData, maxRetries, retryDelay);

            // Update state with success
            setState(prev => ({
                ...prev,
                plan,
                isLoading: false,
                isSuccess: true,
            }));

            // Call success callback
            if (onSuccess) {
                onSuccess(plan);
            }

            return plan;

        } catch (err) {
            const error = err instanceof PersonalPlanAPIError ? err :
                new PersonalPlanAPIError(err instanceof Error ? err.message : 'Unknown error');

            // Update state with error
            setState(prev => ({
                ...prev,
                error,
                isLoading: false,
                isSuccess: false,
            }));

            // Call error callback
            if (onError) {
                onError(error);
            }

            // Auto-clear error if configured
            clearErrorWithDelay();

            return null;
        }
    }, [validateUserDataAction, onSuccess, onError, clearErrorWithDelay]);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    /**
     * Clear plan data
     */
    const clearPlan = useCallback(() => {
        setState(prev => ({ ...prev, plan: null, isSuccess: false }));
    }, []);

    /**
     * Reset all state to initial values
     */
    const reset = useCallback(() => {
        setState({
            plan: null,
            userData: null,
            isLoading: false,
            isValidating: false,
            error: null,
            validationErrors: [],
            isSuccess: false,
        });
    }, []);

    /**
     * Set user data
     */
    const setUserData = useCallback((userData: UserData | null) => {
        setState(prev => ({ ...prev, userData }));
    }, []);

    return {
        // State
        plan: state.plan,
        userData: state.userData,
        isLoading: state.isLoading,
        isValidating: state.isValidating,
        error: state.error,
        validationErrors: state.validationErrors,
        isSuccess: state.isSuccess,

        // Actions
        generatePlan: generatePlanAction,
        generatePlanWithRetry: generatePlanWithRetryAction,
        validateUserData: validateUserDataAction,
        clearError,
        clearPlan,
        reset,
        setUserData,
    };
};

/**
 * Example usage of the usePersonalPlan hook
 */
export const usePersonalPlanExample = () => {
    const personalPlan = usePersonalPlan({
        autoClearError: 5000, // Clear errors after 5 seconds
        onSuccess: (plan) => {
            console.log('✅ Plan generated successfully:', plan);
            // Save to AsyncStorage, navigate, etc.
        },
        onError: (error) => {
            console.error('❌ Plan generation failed:', error);
            // Log analytics, show toast, etc.
        },
        onValidationError: (errors) => {
            console.warn('⚠️ Validation errors:', errors);
            // Show validation errors to user
        },
    });

    return personalPlan;
};
