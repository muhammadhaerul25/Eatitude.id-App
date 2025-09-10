import { StyleSheet } from 'react-native';

export const consultationTabStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
    },
    keyboardAvoid: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    section: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 16,
    },
    insightCard: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    insightTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    insightDescription: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    chatContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        elevation: 2,
        marginBottom: 20,
    },
    messageContainer: {
        marginBottom: 16,
        padding: 12,
        borderRadius: 8,
    },
    userMessage: {
        backgroundColor: '#EFF6FF',
        marginLeft: 20,
    },
    aiMessage: {
        backgroundColor: '#F0FDF4',
        marginRight: 20,
    },
    messageHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 6,
    },
    messageTime: {
        fontSize: 12,
        color: '#6B7280',
    },
    messageText: {
        fontSize: 14,
        color: '#111827',
        lineHeight: 20,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    textInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        maxHeight: 100,
        backgroundColor: '#F9FAFB',
    },
    sendButton: {
        backgroundColor: '#10B981',
        borderRadius: 20,
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    attributionContainer: {
        marginTop: 8,
        alignItems: 'flex-end',
    },
    aiAttribution: {
        fontSize: 11,
        color: '#9CA3AF',
        fontStyle: 'italic',
    },
    nutritionistAttribution: {
        fontSize: 11,
        color: '#10B981',
        fontWeight: '500',
        fontStyle: 'italic',
    },
});

export default consultationTabStyles;
