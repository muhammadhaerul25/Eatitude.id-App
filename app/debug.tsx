/**
 * Debug Page for API Testing
 * 
 * To use this, temporarily add it to your app routing or replace a screen
 * to test the API connection and identify issues.
 */

import React from 'react';
import { SafeAreaView } from 'react-native';
import { APIDebugComponent } from '../components/APIDebugComponent';

export default function DebugScreen() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <APIDebugComponent />
        </SafeAreaView>
    );
}
