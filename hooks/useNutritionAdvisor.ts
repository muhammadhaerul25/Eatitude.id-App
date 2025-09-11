/**
 * React Hook for Nutrition Advisor
 * 
 * This custom hook provides an easy-to-use interface for generating nutrition advice
 * in React components. It handles loading states, errors, and provides retry functionality.
 */

import { useCallback, useState } from 'react';
import {
    MealPlan,
    NutritionAdvisorResponse,
    nutritionAdvisorService,
    NutritionAdvisorServiceError,
    NutritionAdvisorServiceResult,
    PersonalPlan,
    UserData,
    UserProgress
} from '../services/nutritionAdvisorAPI';

interface UseNutritionAdvisorState {
    isLoading: boolean;
    nutritionAdvice: NutritionAdvisorResponse | null;
    error: NutritionAdvisorServiceError | null;
}

interface UseNutritionAdvisorReturn extends UseNutritionAdvisorState {
    generateAdvice: (
        userData: UserData,
        personalPlan: PersonalPlan,
        mealPlan: MealPlan,
        userProgress?: UserProgress
    ) => Promise<void>;
    clearError: () => void;
    clearAdvice: () => void;
    retry: () => Promise<void>;
}

/**
 * Custom hook for nutrition advisor functionality
 * 
 * @returns Object with state and functions for nutrition advice generation
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { 
 *     generateAdvice, 
 *     isLoading, 
 *     nutritionAdvice, 
 *     error,
 *     clearError,
 *     retry
 *   } = useNutritionAdvisor();
 * 
 *   const handleGetAdvice = async () => {
 *     await generateAdvice(userData, personalPlan, mealPlan, userProgress);
 *   };
 * 
 *   if (isLoading) return <LoadingSpinner />;
 *   if (error) return <ErrorMessage error={error} onRetry={retry} />;
 *   if (nutritionAdvice) return <AdviceDisplay advice={nutritionAdvice} />;
 * 
 *   return <GetAdviceButton onPress={handleGetAdvice} />;
 * }
 * ```
 */
export function useNutritionAdvisor(): UseNutritionAdvisorReturn {
    const [state, setState] = useState<UseNutritionAdvisorState>({
        isLoading: false,
        nutritionAdvice: null,
        error: null,
    });

    // Store last request for retry functionality
    const [lastRequest, setLastRequest] = useState<{
        userData: UserData;
        personalPlan: PersonalPlan;
        mealPlan: MealPlan;
        userProgress?: UserProgress;
    } | null>(null);

    /**
     * Generate nutrition advice
     */
    const generateAdvice = useCallback(async (
        userData: UserData,
        personalPlan: PersonalPlan,
        mealPlan: MealPlan,
        userProgress?: UserProgress
    ) => {
        // Store request for retry
        setLastRequest({ userData, personalPlan, mealPlan, userProgress });

        // Set loading state
        setState(prev => ({
            ...prev,
            isLoading: true,
            error: null,
        }));

        try {
            console.log('🎯 useNutritionAdvisor: Starting advice generation');

            const result: NutritionAdvisorServiceResult = await nutritionAdvisorService.generateAdvice(
                userData,
                personalPlan,
                mealPlan,
                userProgress
            );

            if (result.success && result.data) {
                console.log('✅ useNutritionAdvisor: Advice generated successfully');
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    nutritionAdvice: result.data!,
                    error: null,
                }));
            } else {
                console.error('❌ useNutritionAdvisor: Failed to generate advice:', result.error);
                setState(prev => ({
                    ...prev,
                    isLoading: false,
                    error: result.error || {
                        code: 'UNKNOWN_ERROR',
                        message: 'Failed to generate nutrition advice'
                    },
                }));
            }
        } catch (error) {
            console.error('❌ useNutritionAdvisor: Unexpected error:', error);
            setState(prev => ({
                ...prev,
                isLoading: false,
                error: {
                    code: 'UNKNOWN_ERROR',
                    message: 'An unexpected error occurred',
                    originalError: error instanceof Error ? error : new Error(String(error))
                },
            }));
        }
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        setState(prev => ({
            ...prev,
            error: null,
        }));
    }, []);

    /**
     * Clear nutrition advice
     */
    const clearAdvice = useCallback(() => {
        setState(prev => ({
            ...prev,
            nutritionAdvice: null,
            error: null,
        }));
    }, []);

    /**
     * Retry last request
     */
    const retry = useCallback(async () => {
        if (lastRequest) {
            await generateAdvice(
                lastRequest.userData,
                lastRequest.personalPlan,
                lastRequest.mealPlan,
                lastRequest.userProgress
            );
        }
    }, [lastRequest, generateAdvice]);

    return {
        ...state,
        generateAdvice,
        clearError,
        clearAdvice,
        retry,
    };
}

/**
 * Helper hook for getting user-friendly error messages
 */
export function useNutritionAdvisorErrorMessages() {
    const getErrorMessage = useCallback((error: NutritionAdvisorServiceError): string => {
        switch (error.code) {
            case 'NETWORK_ERROR':
                return 'Please check your internet connection and try again.';
            case 'TIMEOUT_ERROR':
                return 'The request is taking longer than expected. Please try again.';
            case 'VALIDATION_ERROR':
                return `Please check your information: ${error.message}`;
            case 'SERVER_ERROR':
                return 'Our nutrition advisor is temporarily unavailable. Please try again later.';
            default:
                return 'Something went wrong. Please try again.';
        }
    }, []);

    const getErrorTitle = useCallback((error: NutritionAdvisorServiceError): string => {
        switch (error.code) {
            case 'NETWORK_ERROR':
                return 'Connection Problem';
            case 'TIMEOUT_ERROR':
                return 'Taking Too Long';
            case 'VALIDATION_ERROR':
                return 'Invalid Information';
            case 'SERVER_ERROR':
                return 'Service Unavailable';
            default:
                return 'Error';
        }
    }, []);

    return {
        getErrorMessage,
        getErrorTitle,
    };
}
