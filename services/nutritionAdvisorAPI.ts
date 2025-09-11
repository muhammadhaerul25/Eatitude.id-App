/**
 * Nutrition Advisor API Service
 * 
 * This service provides a high-level interface for interacting with the nutrition advisor
 * endpoint. It handles all the complexity of preparing data, making API calls, and
 * processing responses for nutrition advice generation.
 */

import {
    apiService,
    MealPlan,
    NutritionAdvisorResponse,
    PersonalPlan,
    UserData,
    UserProgress
} from './api';

export interface NutritionAdvisorServiceError {
    code: 'NETWORK_ERROR' | 'VALIDATION_ERROR' | 'SERVER_ERROR' | 'TIMEOUT_ERROR' | 'UNKNOWN_ERROR';
    message: string;
    originalError?: Error;
}

export interface NutritionAdvisorServiceResult {
    success: boolean;
    data?: NutritionAdvisorResponse;
    error?: NutritionAdvisorServiceError;
}

/**
 * Service class for nutrition advisor functionality
 */
class NutritionAdvisorService {
    /**
     * Generate personalized nutrition advice based on user data, plans, and progress
     * 
     * @param userData - User's personal information and preferences
     * @param personalPlan - User's personalized nutrition plan
     * @param mealPlan - User's daily meal plan
     * @param userProgress - Optional user progress data for more personalized advice
     * @returns Promise with nutrition advice or error information
     */
    async generateAdvice(
        userData: UserData,
        personalPlan: PersonalPlan,
        mealPlan: MealPlan,
        userProgress?: UserProgress
    ): Promise<NutritionAdvisorServiceResult> {
        try {
            // Validate required inputs
            this.validateInputs(userData, personalPlan, mealPlan);

            console.log('🤖 NutritionAdvisorService: Starting advice generation');
            console.log(`👤 User: ${userData.nama}, Age: ${userData.usia}, Goal: ${userData.tujuan}`);

            // Make API call
            const response = await apiService.generateNutritionAdvice(
                userData,
                personalPlan,
                mealPlan,
                userProgress
            );

            console.log('✅ NutritionAdvisorService: Advice generated successfully');

            return {
                success: true,
                data: response
            };

        } catch (error) {
            console.error('❌ NutritionAdvisorService: Failed to generate advice:', error);

            const serviceError = this.handleError(error);

            return {
                success: false,
                error: serviceError
            };
        }
    }

    /**
     * Validate input data before sending to API
     */
    private validateInputs(userData: UserData, personalPlan: PersonalPlan, mealPlan: MealPlan): void {
        // Validate user data
        if (!userData.nama || userData.nama.trim() === '') {
            throw new Error('User name is required');
        }

        if (!userData.usia || userData.usia <= 0 || userData.usia > 150) {
            throw new Error('Valid user age is required (1-150)');
        }

        if (!userData.jenis_kelamin || !['Laki-laki', 'Perempuan'].includes(userData.jenis_kelamin)) {
            throw new Error('Valid gender is required (Laki-laki or Perempuan)');
        }

        if (!userData.berat_badan || userData.berat_badan <= 0 || userData.berat_badan > 500) {
            throw new Error('Valid weight is required (1-500 kg)');
        }

        if (!userData.tinggi_badan || userData.tinggi_badan <= 0 || userData.tinggi_badan > 300) {
            throw new Error('Valid height is required (1-300 cm)');
        }

        if (!userData.tujuan || userData.tujuan.trim() === '') {
            throw new Error('User goal is required');
        }

        // Validate personal plan
        if (!personalPlan || typeof personalPlan !== 'object') {
            throw new Error('Personal plan is required');
        }

        // Validate meal plan
        if (!mealPlan || typeof mealPlan !== 'object') {
            throw new Error('Meal plan is required');
        }

        if (!mealPlan.sarapan || !mealPlan.makan_siang || !mealPlan.makan_malam) {
            throw new Error('Meal plan must include breakfast, lunch, and dinner');
        }
    }

    /**
     * Handle and categorize errors
     */
    private handleError(error: any): NutritionAdvisorServiceError {
        if (error instanceof Error) {
            // Network/connection errors
            if (error.message.includes('Network error') || error.message.includes('Failed to fetch')) {
                return {
                    code: 'NETWORK_ERROR',
                    message: 'Unable to connect to the nutrition advisor service. Please check your internet connection.',
                    originalError: error
                };
            }

            // Timeout errors
            if (error.message.includes('timeout') || error.message.includes('Request timeout')) {
                return {
                    code: 'TIMEOUT_ERROR',
                    message: 'The nutrition advisor is taking longer than expected. Please try again.',
                    originalError: error
                };
            }

            // Validation errors
            if (error.message.includes('Validation errors') ||
                error.message.includes('is required') ||
                error.message.includes('Valid')) {
                return {
                    code: 'VALIDATION_ERROR',
                    message: error.message,
                    originalError: error
                };
            }

            // Server errors
            if (error.message.includes('HTTP error') || error.message.includes('status:')) {
                return {
                    code: 'SERVER_ERROR',
                    message: 'The nutrition advisor service is temporarily unavailable. Please try again later.',
                    originalError: error
                };
            }
        }

        // Unknown errors
        return {
            code: 'UNKNOWN_ERROR',
            message: 'An unexpected error occurred while generating nutrition advice.',
            originalError: error instanceof Error ? error : new Error(String(error))
        };
    }

    /**
     * Create a formatted prompt for the nutrition advisor
     * This is useful for debugging or if you want to see what prompt is being sent
     */
    createPrompt(userData: UserData, personalPlan: PersonalPlan, mealPlan: MealPlan, userProgress?: UserProgress): string {
        return `You are NutriBot, a professional AI nutrition advisor for this user.
You have access to their profile, nutrition plan, daily meal plan, and progress data.
Use this information to provide supportive, personalized, and easy-to-understand nutrition guidance in a conversational way.

### User Data:
${JSON.stringify(userData, null, 2)}

### Personal Nutrition Plan:
${JSON.stringify(personalPlan, null, 2)}

### Daily Meal Plan:
${JSON.stringify(mealPlan, null, 2)}

${userProgress ? `### User Progress:\n${JSON.stringify(userProgress, null, 2)}` : ''}

Please provide personalized nutrition advice based on this information.`;
    }
}

// Export singleton instance
export const nutritionAdvisorService = new NutritionAdvisorService();

// Export types for consumers
export type {
    MealPlan, NutritionAdvisorRequest,
    NutritionAdvisorResponse, PersonalPlan, UserData, UserProgress
} from './api';

