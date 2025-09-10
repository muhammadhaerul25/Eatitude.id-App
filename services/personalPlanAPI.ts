/**
 * Personal Plan API Integration
 * 
 * This module provides TypeScript integration for the FastAPI /generate_personal_plan endpoint.
 * It includes proper type definitions, error handling, and usage examples.
 */

import type { PersonalPlan, UserData } from './api';
import { apiService } from './api';

// Enhanced error types for better error handling
export interface APIError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
}

export class PersonalPlanAPIError extends Error implements APIError {
    status?: number;
    code?: string;
    details?: any;

    constructor(message: string, status?: number, code?: string, details?: any) {
        super(message);
        this.name = 'PersonalPlanAPIError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

// Validation helpers
export const validateUserData = (userData: UserData): string[] => {
    const errors: string[] = [];

    console.log('🔍 Validating user data:', userData);

    if (!userData.nama || userData.nama.trim().length === 0) {
        errors.push('Nama is required');
    }

    if (!userData.usia || userData.usia < 1 || userData.usia > 120) {
        errors.push('Usia must be between 1 and 120 years');
    }

    if (!userData.jenis_kelamin || !['Laki-laki', 'Perempuan'].includes(userData.jenis_kelamin)) {
        console.log(`❌ Gender validation failed. Received: "${userData.jenis_kelamin}", Expected: "Laki-laki" or "Perempuan"`);
        errors.push('Jenis kelamin must be "Laki-laki" or "Perempuan"');
    } else {
        console.log(`✅ Gender validation passed: "${userData.jenis_kelamin}"`);
    }

    if (!userData.berat_badan || userData.berat_badan < 20 || userData.berat_badan > 500) {
        errors.push('Berat badan must be between 20 and 500 kg');
    }

    if (!userData.tinggi_badan || userData.tinggi_badan < 50 || userData.tinggi_badan > 250) {
        errors.push('Tinggi badan must be between 50 and 250 cm');
    }

    if (!userData.tingkat_aktivitas) {
        errors.push('Tingkat aktivitas is required');
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!userData.waktu_bangun || !timeRegex.test(userData.waktu_bangun)) {
        console.log(`❌ Wake time validation failed. Received: "${userData.waktu_bangun}"`);
        errors.push('Waktu bangun must be in HH:MM format');
    }

    if (!userData.waktu_tidur || !timeRegex.test(userData.waktu_tidur)) {
        console.log(`❌ Sleep time validation failed. Received: "${userData.waktu_tidur}"`);
        errors.push('Waktu tidur must be in HH:MM format');
    }

    if (!userData.tujuan || userData.tujuan.trim().length === 0) {
        errors.push('Tujuan is required');
    }

    console.log(`🔍 Validation result: ${errors.length === 0 ? 'PASSED' : 'FAILED'}`, errors);

    return errors;
};

/**
 * Generate Personal Plan API Call
 * 
 * This function calls the /generate_personal_plan endpoint with proper error handling.
 * 
 * @param userData - User data conforming to the UserData interface
 * @returns Promise<PersonalPlan> - The generated personal plan
 * @throws PersonalPlanAPIError - When validation fails or API call fails
 */
export const generatePersonalPlan = async (userData: UserData): Promise<PersonalPlan> => {
    try {
        // Validate input data
        const validationErrors = validateUserData(userData);
        if (validationErrors.length > 0) {
            throw new PersonalPlanAPIError(
                `Validation failed: ${validationErrors.join(', ')}`,
                400,
                'VALIDATION_ERROR',
                { validationErrors }
            );
        }

        console.log('🚀 Generating personal plan for user:', userData.nama);

        // Call the API service
        const personalPlan = await apiService.generatePersonalPlan(userData);

        console.log('✅ Personal plan generated successfully');
        return personalPlan;

    } catch (error) {
        console.error('❌ Failed to generate personal plan:', error);

        if (error instanceof PersonalPlanAPIError) {
            throw error;
        }

        // Transform generic errors into PersonalPlanAPIError
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        // Provide more specific error messages based on common scenarios
        let enhancedMessage = errorMessage;
        let code = 'UNKNOWN_ERROR';

        if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
            enhancedMessage = 'Unable to connect to the server. Please check your internet connection.';
            code = 'NETWORK_ERROR';
        } else if (errorMessage.includes('timeout')) {
            enhancedMessage = 'The request timed out. The server may be busy, please try again.';
            code = 'TIMEOUT_ERROR';
        } else if (errorMessage.includes('500')) {
            enhancedMessage = 'Server error occurred. Please try again later.';
            code = 'SERVER_ERROR';
        }

        throw new PersonalPlanAPIError(enhancedMessage, undefined, code, error);
    }
};

/**
 * Generate Personal Plan with Retry Logic and Extended Timeout
 * 
 * This function provides automatic retry functionality with longer timeouts for better reliability.
 * 
 * @param userData - User data conforming to the UserData interface
 * @param maxRetries - Maximum number of retry attempts (default: 2)
 * @param retryDelay - Delay between retries in milliseconds (default: 60000)
 * @returns Promise<PersonalPlan> - The generated personal plan
 */
export const generatePersonalPlanWithRetry = async (
    userData: UserData,
    maxRetries: number = 2,
    retryDelay: number = 60000
): Promise<PersonalPlan> => {
    let lastError: PersonalPlanAPIError | undefined;

    console.log(`🔄 Starting personal plan generation with ${maxRetries + 1} attempts max`);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🚀 Attempt ${attempt + 1}/${maxRetries + 1} - Generating personal plan...`);

            // Add a small delay between retries to prevent overwhelming the server
            if (attempt > 0) {
                console.log(`⏱️ Waiting ${retryDelay}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
            }

            const plan = await generatePersonalPlan(userData);
            console.log(`✅ Personal plan generated successfully on attempt ${attempt + 1}`);
            return plan;

        } catch (error) {
            console.log(`❌ Attempt ${attempt + 1} failed:`, error);

            lastError = error instanceof PersonalPlanAPIError ? error :
                new PersonalPlanAPIError(error instanceof Error ? error.message : 'Unknown error');

            // Don't retry on validation errors - they won't succeed on retry
            if (lastError.code === 'VALIDATION_ERROR') {
                console.log('🚫 Validation error detected - not retrying');
                throw lastError;
            }

            // If this is the last attempt, throw the error
            if (attempt === maxRetries) {
                console.log(`🔚 All ${maxRetries + 1} attempts failed`);
                throw lastError;
            }

            console.log(`⚠️ Attempt ${attempt + 1} failed, will retry in ${retryDelay}ms...`);
        }
    }

    throw lastError || new PersonalPlanAPIError('All retry attempts failed');
};

/**
 * Create UserData from form inputs
 * 
 * Helper function to create UserData object from individual form fields.
 * This is useful when collecting data from multiple form steps.
 */
export const createUserData = (params: {
    nama: string;
    usia: number;
    jenis_kelamin: string;
    berat_badan: number;
    tinggi_badan: number;
    tingkat_aktivitas: string;
    waktu_bangun: string;
    waktu_tidur: string;
    tujuan: string;
    catatan_aktivitas?: string | null;
    preferensi_makanan?: string | null;
    alergi_makanan?: string | null;
    kondisi_kesehatan?: string | null;
}): UserData => {
    return {
        nama: params.nama.trim(),
        usia: params.usia,
        jenis_kelamin: params.jenis_kelamin,
        berat_badan: params.berat_badan,
        tinggi_badan: params.tinggi_badan,
        tingkat_aktivitas: params.tingkat_aktivitas,
        catatan_aktivitas: params.catatan_aktivitas || null,
        waktu_bangun: params.waktu_bangun,
        waktu_tidur: params.waktu_tidur,
        preferensi_makanan: params.preferensi_makanan || null,
        alergi_makanan: params.alergi_makanan || null,
        kondisi_kesehatan: params.kondisi_kesehatan || null,
        tujuan: params.tujuan.trim(),
    };
};

// Export types for external use
export type { PersonalPlan, UserData };

