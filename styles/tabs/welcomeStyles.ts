import { StyleSheet } from 'react-native';

export const welcomeStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    welcomeSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeTitle: {
        fontSize: 32,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 40,
    },
    logo: {
        width: 250,
        height: 150,
        marginBottom: 40,
    },
    welcomeMessage: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    getStartedButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 18,
        borderRadius: 12,
        gap: 8,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    getStartedText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});
