/**
 * Enhanced Loading Overlay with Progress Updates
 * 
 * This component provides a more robust loading experience with:
 * - Continuous animation that doesn't freeze using manual rotation
 * - Progress messages that update periodically
 * - Better timeout handling
 */

import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { loadingOverlayStyles } from '../styles/tabs/loadingOverlayStyles';

interface EnhancedLoadingOverlayProps {
    visible: boolean;
    title: string;
    subtitle?: string;
    estimatedDuration?: number; // in seconds
    progressMessages?: string[];
}

export const EnhancedLoadingOverlay: React.FC<EnhancedLoadingOverlayProps> = ({
    visible,
    title,
    subtitle,
    estimatedDuration = 120,
    progressMessages = [
        "Analyzing your profile...",
        "Generating personalized recommendations...",
        "Calculating nutritional requirements...",
        "Creating your meal plan structure...",
        "Finalizing your personal plan..."
    ]
}) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const animationRef = useRef<number | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const rotationRef = useRef(0);

    useEffect(() => {
        if (visible) {
            startSpinning();
            startProgressTracking();
        } else {
            stopSpinning();
            stopProgressTracking();
            resetState();
        }

        return () => {
            stopSpinning();
            stopProgressTracking();
        };
    }, [visible]);

    const startSpinning = () => {
        // Stop any existing animation
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
        }

        // Reset rotation
        rotationRef.current = 0;
        spinValue.setValue(0);

        // Use requestAnimationFrame for smooth, uninterrupted animation
        const animate = () => {
            if (!visible) return;

            rotationRef.current += 2; // Increment rotation by 2 degrees
            if (rotationRef.current >= 360) {
                rotationRef.current = 0;
            }

            // Update the animated value
            spinValue.setValue(rotationRef.current / 360);

            // Continue animation
            animationRef.current = requestAnimationFrame(animate);
        };

        // Start the animation loop
        animationRef.current = requestAnimationFrame(animate);
    };

    const stopSpinning = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    const startProgressTracking = () => {
        setElapsed(0);
        setCurrentMessageIndex(0);

        intervalRef.current = setInterval(() => {
            setElapsed(prev => {
                const newElapsed = prev + 1;

                // Update message every 15 seconds or based on progress
                const messageInterval = Math.max(15, Math.floor(estimatedDuration / progressMessages.length));
                const newMessageIndex = Math.min(
                    Math.floor(newElapsed / messageInterval),
                    progressMessages.length - 1
                );

                if (newMessageIndex !== currentMessageIndex) {
                    setCurrentMessageIndex(newMessageIndex);
                }

                return newElapsed;
            });
        }, 1000);
    };

    const stopProgressTracking = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const resetState = () => {
        setElapsed(0);
        setCurrentMessageIndex(0);
        rotationRef.current = 0;
    };

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const getProgressMessage = () => {
        if (elapsed > estimatedDuration + 10) {
            return "Almost done, just a few more seconds...";
        }
        return progressMessages[currentMessageIndex] || progressMessages[0];
    };

    const getTimeMessage = () => {
        if (elapsed < 45) {
            return "";
        } else if (elapsed < 75) {
            return "This is taking a bit longer than usual...";
        } else if (elapsed < 105) {
            return "Almost there, please wait a moment longer...";
        } else {
            return "Taking longer than expected, but still processing...";
        }
    };

    if (!visible) return null;

    return (
        <View style={loadingOverlayStyles.overlay}>
            <View style={loadingOverlayStyles.container}>
                {/* Spinning loader */}
                <Animated.View
                    style={[
                        loadingOverlayStyles.spinner,
                        { transform: [{ rotate: spin }] }
                    ]}
                />

                {/* Title */}
                <Text style={loadingOverlayStyles.title}>{title}</Text>

                {/* Subtitle */}
                {subtitle && (
                    <Text style={loadingOverlayStyles.subtitle}>{subtitle}</Text>
                )}

                {/* Progress message */}
                <Text style={enhancedStyles.progressMessage}>
                    {getProgressMessage()}
                </Text>

                {/* Time-based message */}
                {getTimeMessage() && (
                    <Text style={enhancedStyles.timeMessage}>
                        {getTimeMessage()}
                    </Text>
                )}

                {/* Elapsed time indicator */}
                <Text style={enhancedStyles.elapsedTime}>
                    {`${elapsed || 0}s elapsed`}
                </Text>
            </View>
        </View>
    );
};

const enhancedStyles = StyleSheet.create({
    progressMessage: {
        fontSize: 13,
        color: '#10B981',
        textAlign: 'center',
        marginTop: 12,
        fontWeight: '500',
    },
    timeMessage: {
        fontSize: 12,
        color: '#F59E0B',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    elapsedTime: {
        fontSize: 11,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 8,
    },
});

export default EnhancedLoadingOverlay;
