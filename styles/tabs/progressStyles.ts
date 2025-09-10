import { StyleSheet } from 'react-native';

export const progressTabStyles = StyleSheet.create({
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
        marginBottom: 12,
    },
    periodSelector: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
        padding: 4,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 6,
    },
    periodButtonActive: {
        backgroundColor: '#FFFFFF',
        boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
        elevation: 2,
    },
    periodButtonText: {
        fontSize: 14,
        color: '#6B7280',
        fontWeight: '500',
    },
    periodButtonTextActive: {
        color: '#111827',
        fontWeight: '600',
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
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
        elevation: 3,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 12,
    },
    cardHeaderText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
    },
    cardSubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    progressBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        minWidth: 35,
    },
    statusIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    macroRow: {
        marginBottom: 16,
    },
    macroItem: {
        gap: 8,
    },
    macroLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    macroValue: {
        fontSize: 14,
        color: '#6B7280',
    },
    subSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 12,
    },
    microRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    microInfo: {
        flex: 1,
    },
    microLabel: {
        fontSize: 14,
        color: '#374151',
    },
    microValue: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    microStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    microStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    limitRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    limitInfo: {
        flex: 1,
    },
    limitLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
    },
    limitValue: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    limitAlert: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        gap: 4,
    },
    limitStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    hydrationVisual: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    waterGlass: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    waterGlassFilled: {
        backgroundColor: '#DBEAFE',
    },
    bottomSpacing: {
        height: 24,
    },
    indicatorLegend: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    alertLegend: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
    },
    indicatorTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    indicatorText: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    indicatorLabel: {
        fontWeight: '600',
    },
});

export default progressTabStyles;
