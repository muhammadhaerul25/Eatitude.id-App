/**
 * Debug Page for API Testing
 * 
 * To use this, temporarily add it to your app routing or replace a screen
 * to test the API connection and identify issues.
 */

import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { APIDebugComponent } from '../components/debug/APIDebugComponent';
import APITestScreen from '../components/debug/APITestScreen';

export default function DebugScreen() {
    const [activeTab, setActiveTab] = useState<'old' | 'new'>('new');

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'new' && styles.activeTab]}
                    onPress={() => setActiveTab('new')}
                >
                    <Text style={[styles.tabText, activeTab === 'new' && styles.activeTabText]}>
                        New API Tests
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'old' && styles.activeTab]}
                    onPress={() => setActiveTab('old')}
                >
                    <Text style={[styles.tabText, activeTab === 'old' && styles.activeTabText]}>
                        Old Debug
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'new' ? <APITestScreen /> : <APIDebugComponent />}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    tab: {
        flex: 1,
        paddingVertical: 15,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    activeTab: {
        backgroundColor: '#2196F3',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTabText: {
        color: 'white',
        fontWeight: 'bold',
    },
});
