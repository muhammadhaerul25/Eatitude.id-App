/**
 * Data Debug Test Component
 * 
 * Add this to your debug screen to test the Indonesian standardization
 */

import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { dataDebugger } from '../utils/dataDebugger';

export default function DataDebugScreen() {
    const [output, setOutput] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const logToOutput = (message: string) => {
        setOutput(prev => prev + message + '\n');
    };

    const clearOutput = () => {
        setOutput('');
    };

    const runTest = async (testName: string, testFunction: () => Promise<any>) => {
        setLoading(true);
        logToOutput(`\n🧪 Running ${testName}...\n`);

        try {
            const result = await testFunction();
            logToOutput(`✅ ${testName} completed\n`);
            return result;
        } catch (error) {
            logToOutput(`❌ ${testName} failed: ${error}\n`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={{ flex: 1, padding: 20, backgroundColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
                🔍 Data Debug Center
            </Text>

            <Text style={{ fontSize: 16, marginBottom: 20, textAlign: 'center', color: '#666' }}>
                Test your Indonesian data standardization
            </Text>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
                <TouchableOpacity
                    style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8, flex: 1, minWidth: 150 }}
                    onPress={() => runTest('Data Status Check', async () => {
                        const status = await dataDebugger.checkDataStatus();
                        logToOutput(JSON.stringify(status, null, 2));
                    })}
                    disabled={loading}
                >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                        Check Status
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ backgroundColor: '#FF9500', padding: 12, borderRadius: 8, flex: 1, minWidth: 150 }}
                    onPress={() => runTest('Fix Data Issues', async () => {
                        const result = await dataDebugger.fixDataIssues();
                        logToOutput(JSON.stringify(result, null, 2));
                    })}
                    disabled={loading}
                >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                        Fix Issues
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ backgroundColor: '#34C759', padding: 12, borderRadius: 8, flex: 1, minWidth: 150 }}
                    onPress={() => runTest('Show Cache', async () => {
                        await dataDebugger.showCacheContents();
                    })}
                    disabled={loading}
                >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                        Show Cache
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ backgroundColor: '#AF52DE', padding: 12, borderRadius: 8, flex: 1, minWidth: 150 }}
                    onPress={() => runTest('Complete Check', async () => {
                        await dataDebugger.runCompleteCheck();
                    })}
                    disabled={loading}
                >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                        Complete Check
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ backgroundColor: '#FF3B30', padding: 12, borderRadius: 8, flex: 1, minWidth: 150 }}
                    onPress={clearOutput}
                    disabled={loading}
                >
                    <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>
                        Clear Output
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Status Indicator */}
            {loading && (
                <View style={{ backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 20 }}>
                    <Text style={{ color: '#856404', textAlign: 'center' }}>
                        🔄 Running test... Check console for detailed logs
                    </Text>
                </View>
            )}

            {/* Output Display */}
            <ScrollView
                style={{
                    flex: 1,
                    backgroundColor: '#000',
                    borderRadius: 8,
                    padding: 15
                }}
                showsVerticalScrollIndicator={true}
            >
                <Text style={{ color: '#00FF00', fontFamily: 'monospace', fontSize: 12 }}>
                    {output || '📝 Test output will appear here...\n\nTip: Check the console for detailed logs'}
                </Text>
            </ScrollView>

            <Text style={{ marginTop: 10, fontSize: 12, color: '#666', textAlign: 'center' }}>
                💡 Check React Native Debugger console for detailed logs
            </Text>
        </View>
    );
}
