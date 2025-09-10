import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { loadingOverlayStyles } from '../styles/tabs/loadingOverlayStyles';

interface LoadingOverlayProps {
    visible: boolean;
    title: string;
    subtitle?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
    visible,
    title,
    subtitle
}) => {
    const spinValue = useRef(new Animated.Value(0)).current;
    const animationRef = useRef<number | null>(null);
    const rotationRef = useRef(0);

    useEffect(() => {
        if (visible) {
            startSpinning();
        } else {
            stopSpinning();
        }

        return () => {
            stopSpinning();
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

            rotationRef.current += 3; // Increment rotation by 3 degrees per frame
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

    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    if (!visible) return null;

    return (
        <View style={loadingOverlayStyles.overlay}>
            <View style={loadingOverlayStyles.container}>
                <Animated.View
                    style={[
                        loadingOverlayStyles.spinner,
                        { transform: [{ rotate: spin }] }
                    ]}
                />
                <Text style={loadingOverlayStyles.title}>{title}</Text>
                {subtitle && <Text style={loadingOverlayStyles.subtitle}>{subtitle}</Text>}
            </View>
        </View>
    );
};

export default LoadingOverlay;