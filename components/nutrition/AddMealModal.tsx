import { ChevronDown, Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface AddMealModalProps {
    visible: boolean;
    onClose: () => void;
    onAddMeal: (mealData: any) => Promise<void>;
}

export default function AddMealModal({ visible, onClose, onAddMeal }: AddMealModalProps) {
    const [selectedMealType, setSelectedMealType] = useState<string>('');
    const [preference, setPreference] = useState<string>('');
    const [budget, setBudget] = useState<string>('');
    const [showMealTypeDropdown, setShowMealTypeDropdown] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const mealTypes = [
        { value: 'sarapan', label: 'Sarapan' },
        { value: 'snack_pagi', label: 'Snack Pagi' },
        { value: 'makan_siang', label: 'Makan Siang' },
        { value: 'snack_sore', label: 'Snack Sore' },
        { value: 'makan_malam', label: 'Makan Malam' }
    ];

    const budgetOptions = [
        { value: 'rendah', label: 'Rendah (< Rp 20,000)' },
        { value: 'sedang', label: 'Sedang (Rp 20,000 - 50,000)' },
        { value: 'tinggi', label: 'Tinggi (> Rp 50,000)' }
    ];

    const resetForm = () => {
        setSelectedMealType('');
        setPreference('');
        setBudget('');
        setShowMealTypeDropdown(false);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!selectedMealType) {
            Alert.alert('Error', 'Silakan pilih jenis makanan');
            return;
        }

        if (!preference.trim()) {
            Alert.alert('Error', 'Silakan masukkan preferensi makanan');
            return;
        }

        if (!budget) {
            Alert.alert('Error', 'Silakan pilih budget');
            return;
        }

        setIsSubmitting(true);
        try {
            const mealData = {
                meal_type: selectedMealType,
                preference: preference.trim(),
                budget: budget
            };

            await onAddMeal(mealData);
            resetForm();
            onClose();
        } catch (error) {
            console.error('Failed to add meal:', error);
            Alert.alert('Error', 'Gagal menambahkan menu makanan. Silakan coba lagi.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedMealTypeLabel = mealTypes.find(type => type.value === selectedMealType)?.label || 'Pilih Jenis Makanan';
    const selectedBudgetLabel = budgetOptions.find(option => option.value === budget)?.label || 'Pilih Budget';

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB'
                }}>
                    <Text style={{
                        fontSize: 18,
                        fontWeight: '600',
                        color: '#1F2937'
                    }}>
                        Tambah Menu Makanan
                    </Text>
                    <TouchableOpacity onPress={handleClose}>
                        <X size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
                    {/* Meal Type Selection */}
                    <View style={{ marginTop: 24 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 8
                        }}>
                            Jenis Makanan
                        </Text>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: 12,
                                borderWidth: 1,
                                borderColor: '#D1D5DB',
                                borderRadius: 8,
                                backgroundColor: '#FFFFFF'
                            }}
                            onPress={() => setShowMealTypeDropdown(!showMealTypeDropdown)}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: selectedMealType ? '#1F2937' : '#9CA3AF'
                            }}>
                                {selectedMealTypeLabel}
                            </Text>
                            <ChevronDown size={20} color="#6B7280" />
                        </TouchableOpacity>

                        {showMealTypeDropdown && (
                            <View style={{
                                marginTop: 4,
                                borderWidth: 1,
                                borderColor: '#D1D5DB',
                                borderRadius: 8,
                                backgroundColor: '#FFFFFF',
                                shadowColor: '#000',
                                shadowOffset: { width: 0, height: 2 },
                                shadowOpacity: 0.1,
                                shadowRadius: 4,
                                elevation: 3
                            }}>
                                {mealTypes.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={{
                                            padding: 12,
                                            borderBottomWidth: type.value === mealTypes[mealTypes.length - 1].value ? 0 : 1,
                                            borderBottomColor: '#E5E7EB'
                                        }}
                                        onPress={() => {
                                            setSelectedMealType(type.value);
                                            setShowMealTypeDropdown(false);
                                        }}
                                    >
                                        <Text style={{
                                            fontSize: 16,
                                            color: selectedMealType === type.value ? '#3B82F6' : '#1F2937',
                                            fontWeight: selectedMealType === type.value ? '600' : '400'
                                        }}>
                                            {type.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Preference Input */}
                    <View style={{ marginTop: 24 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 8
                        }}>
                            Preferensi Makanan
                        </Text>
                        <Text style={{
                            fontSize: 14,
                            color: '#6B7280',
                            marginBottom: 8,
                            lineHeight: 20
                        }}>
                            Masukkan preferensi makanan Anda (contoh: makanan vegetarian, tidak pedas, makanan tradisional, dll)
                        </Text>
                        <TextInput
                            style={{
                                padding: 12,
                                borderWidth: 1,
                                borderColor: '#D1D5DB',
                                borderRadius: 8,
                                fontSize: 16,
                                color: '#1F2937',
                                backgroundColor: '#FFFFFF',
                                textAlignVertical: 'top'
                            }}
                            placeholder="Contoh: Makanan sehat, tidak pedas, preferensi ayam atau ikan..."
                            placeholderTextColor="#9CA3AF"
                            value={preference}
                            onChangeText={setPreference}
                            multiline
                            numberOfLines={3}
                        />
                    </View>

                    {/* Budget Selection */}
                    <View style={{ marginTop: 24 }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 8
                        }}>
                            Budget
                        </Text>
                        <View style={{ gap: 8 }}>
                            {budgetOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        padding: 12,
                                        borderWidth: 1,
                                        borderColor: budget === option.value ? '#3B82F6' : '#D1D5DB',
                                        borderRadius: 8,
                                        backgroundColor: budget === option.value ? '#EBF4FF' : '#FFFFFF'
                                    }}
                                    onPress={() => setBudget(option.value)}
                                >
                                    <View style={{
                                        width: 20,
                                        height: 20,
                                        borderRadius: 10,
                                        borderWidth: 2,
                                        borderColor: budget === option.value ? '#3B82F6' : '#D1D5DB',
                                        backgroundColor: budget === option.value ? '#3B82F6' : '#FFFFFF',
                                        marginRight: 12,
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {budget === option.value && (
                                            <View style={{
                                                width: 8,
                                                height: 8,
                                                borderRadius: 4,
                                                backgroundColor: '#FFFFFF'
                                            }} />
                                        )}
                                    </View>
                                    <Text style={{
                                        fontSize: 16,
                                        color: budget === option.value ? '#3B82F6' : '#1F2937',
                                        fontWeight: budget === option.value ? '600' : '400'
                                    }}>
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Info Box */}
                    <View style={{
                        marginTop: 24,
                        padding: 16,
                        backgroundColor: '#F0F9FF',
                        borderRadius: 8,
                        borderLeftWidth: 4,
                        borderLeftColor: '#0284C7'
                    }}>
                        <Text style={{
                            fontSize: 14,
                            color: '#0369A1',
                            lineHeight: 20
                        }}>
                            💡 AI akan memberikan rekomendasi menu makanan berdasarkan preferensi dan budget yang Anda pilih, dengan mempertimbangkan kebutuhan kalori harian Anda.
                        </Text>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        style={{
                            marginTop: 32,
                            marginBottom: 32,
                            backgroundColor: isSubmitting || !selectedMealType || !preference.trim() || !budget ? '#9CA3AF' : '#3B82F6',
                            paddingVertical: 16,
                            paddingHorizontal: 24,
                            borderRadius: 8,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={handleSubmit}
                        disabled={isSubmitting || !selectedMealType || !preference.trim() || !budget}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <>
                                <Plus size={20} color="#FFFFFF" />
                                <Text style={{
                                    color: '#FFFFFF',
                                    fontSize: 16,
                                    fontWeight: '600',
                                    marginLeft: 8
                                }}>
                                    Tambah Menu
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
}