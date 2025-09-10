import { StyleSheet } from 'react-native';

export const onboardingStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    appName: {
        fontSize: 28,
        fontWeight: '700',
        color: '#10B981',
        textAlign: 'center',
        marginBottom: 8,
    },
    welcomeText: {
        fontSize: 16,
        color: '#6B7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    progressContainer: {
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: '#E5E7EB',
        borderRadius: 2,
        marginBottom: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 2,
    },
    progressText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    stepContent: {
        paddingVertical: 32,
        alignItems: 'center',
    },
    stepIcon: {
        marginBottom: 24,
    },
    stepTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 32,
    },
    inputGroup: {
        width: '100%',
        marginBottom: 24,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    inputSubLabel: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
        lineHeight: 20,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#FFFFFF',
    },
    textInputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    required: {
        color: '#EF4444',
        fontSize: 16,
        fontWeight: '600',
    },
    suffix: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '400',
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginTop: 4,
    },
    timeInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
    },
    timeInputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    timeInputIcon: {
        marginRight: 8,
    },
    timeInputField: {
        flex: 1,
        fontSize: 16,
        color: '#111827',
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    genderButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    genderButton: {
        flex: 1,
        paddingVertical: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
    },
    genderButtonActive: {
        borderColor: '#10B981',
        backgroundColor: '#10B981',
    },
    genderButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    genderButtonTextActive: {
        color: '#FFFFFF',
    },
    metricsRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    halfWidth: {
        flex: 1,
    },
    bmiCard: {
        backgroundColor: '#F0FDF4',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginTop: 16,
        borderWidth: 1,
        borderColor: '#10B981',
    },
    bmiTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    bmiValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#10B981',
        marginBottom: 4,
    },
    bmiCategory: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10B981',
    },
    activityButtons: {
        gap: 12,
    },
    activityButton: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
    },
    activityButtonActive: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    activityButtonTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    activityButtonTitleActive: {
        color: '#10B981',
    },
    activityButtonDesc: {
        fontSize: 14,
        color: '#6B7280',
    },
    activityButtonDescActive: {
        color: '#059669',
    },
    timeRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    goalsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    goalButton: {
        flexDirection: 'column',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        gap: 8,
        width: '48%',
        minHeight: 80,
    },
    goalButtonActive: {
        borderColor: '#10B981',
        backgroundColor: '#10B981',
    },
    goalButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
    },
    goalButtonTextActive: {
        color: '#FFFFFF',
    },
    goalButtonDesc: {
        fontSize: 12,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 4,
    },
    goalButtonDescActive: {
        color: '#D1FAE5',
    },
    navigation: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        gap: 12,
    },
    backButton: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6B7280',
    },
    nextButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        backgroundColor: '#10B981',
        gap: 8,
    },
    nextButtonFull: {
        flex: 1,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    nextButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    nextButtonTextDisabled: {
        color: '#9CA3AF',
    },
    // Picker Input Styles
    pickerInput: {
        justifyContent: 'center',
        minHeight: 48,
    },
    pickerText: {
        fontSize: 16,
        color: '#111827',
    },
    pickerPlaceholder: {
        color: '#9CA3AF',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    modalCloseButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalCloseText: {
        fontSize: 18,
        color: '#6B7280',
        fontWeight: '600',
    },
    ageList: {
        maxHeight: 300,
    },
    ageItem: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    ageItemSelected: {
        backgroundColor: '#10B981',
    },
    ageItemText: {
        fontSize: 16,
        color: '#111827',
    },
    ageItemTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
});
