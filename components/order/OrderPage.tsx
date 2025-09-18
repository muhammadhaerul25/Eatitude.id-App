import { Minus, Plus, ShoppingCart, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface FoodItem {
    name: string;
    calories: number;
    price?: number;
    description?: string;
}

interface OrderPageProps {
    visible: boolean;
    onClose: () => void;
    foodItem: FoodItem | null;
}

export const OrderPage: React.FC<OrderPageProps> = ({ visible, onClose, foodItem }) => {
    const [quantity, setQuantity] = useState(1);
    const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('pickup');
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');

    const deliveryOptions = [
        { id: 'pickup', label: 'Pickup', description: 'Ambil sendiri di lokasi', price: 0 },
        { id: 'delivery', label: 'Delivery', description: 'Antar ke alamat Anda', price: 5000 }
    ];

    const paymentMethods = [
        { id: 'cash', label: 'Cash', description: 'Bayar tunai' },
        { id: 'gopay', label: 'GoPay', description: 'Bayar dengan GoPay' },
        { id: 'ovo', label: 'OVO', description: 'Bayar dengan OVO' },
        { id: 'dana', label: 'DANA', description: 'Bayar dengan DANA' }
    ];

    const handleQuantityChange = (change: number) => {
        const newQuantity = quantity + change;
        if (newQuantity >= 1 && newQuantity <= 10) {
            setQuantity(newQuantity);
        }
    };

    const calculateTotal = () => {
        const itemPrice = foodItem?.price || 15000; // Default price if not available
        const deliveryPrice = deliveryOptions.find(opt => opt.id === selectedDeliveryOption)?.price || 0;
        return (itemPrice * quantity) + deliveryPrice;
    };

    const handlePlaceOrder = () => {
        Alert.alert(
            'Order Placed!',
            `Pesanan Anda telah diterima!\n\nItem: ${foodItem?.name}\nJumlah: ${quantity}\nTotal: Rp ${calculateTotal().toLocaleString()}\nPembayaran: ${paymentMethods.find(p => p.id === selectedPaymentMethod)?.label}\nPengiriman: ${deliveryOptions.find(d => d.id === selectedDeliveryOption)?.label}\n\nTerima kasih telah memesan!`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        onClose();
                        // Reset form
                        setQuantity(1);
                        setSelectedDeliveryOption('pickup');
                        setSelectedPaymentMethod('cash');
                    }
                }
            ]
        );
    };

    if (!foodItem) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
                {/* Header */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: '#E5E7EB'
                }}>
                    <Text style={{
                        fontSize: 20,
                        fontWeight: '600',
                        color: '#1F2937'
                    }}>
                        Order Makanan
                    </Text>
                    <TouchableOpacity onPress={onClose}>
                        <X size={24} color="#6B7280" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {/* Food Item Card */}
                    <View style={{
                        margin: 16,
                        padding: 16,
                        backgroundColor: '#F9FAFB',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#E5E7EB'
                    }}>
                        <Text style={{
                            fontSize: 18,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 4
                        }}>
                            {foodItem.name}
                        </Text>
                        {foodItem.description && (
                            <Text style={{
                                fontSize: 14,
                                color: '#6B7280',
                                marginBottom: 8,
                                lineHeight: 20
                            }}>
                                {foodItem.description}
                            </Text>
                        )}
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <Text style={{
                                fontSize: 14,
                                color: '#6B7280'
                            }}>
                                {foodItem.calories} kcal
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#059669'
                            }}>
                                Rp {(foodItem.price || 15000).toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    {/* Quantity Selector */}
                    <View style={{
                        margin: 16,
                        marginTop: 0
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 12
                        }}>
                            Jumlah
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#F9FAFB',
                            borderRadius: 8,
                            padding: 8
                        }}>
                            <TouchableOpacity
                                onPress={() => handleQuantityChange(-1)}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: quantity === 1 ? '#E5E7EB' : '#3B82F6',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                disabled={quantity === 1}
                            >
                                <Minus size={20} color={quantity === 1 ? '#9CA3AF' : '#FFFFFF'} />
                            </TouchableOpacity>

                            <Text style={{
                                fontSize: 18,
                                fontWeight: '600',
                                marginHorizontal: 32,
                                minWidth: 40,
                                textAlign: 'center'
                            }}>
                                {quantity}
                            </Text>

                            <TouchableOpacity
                                onPress={() => handleQuantityChange(1)}
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    backgroundColor: quantity === 10 ? '#E5E7EB' : '#3B82F6',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}
                                disabled={quantity === 10}
                            >
                                <Plus size={20} color={quantity === 10 ? '#9CA3AF' : '#FFFFFF'} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Delivery Options */}
                    <View style={{
                        margin: 16,
                        marginTop: 0
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 12
                        }}>
                            Pilihan Pengiriman
                        </Text>
                        {deliveryOptions.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    backgroundColor: selectedDeliveryOption === option.id ? '#EBF8FF' : '#F9FAFB',
                                    borderRadius: 8,
                                    borderWidth: selectedDeliveryOption === option.id ? 2 : 1,
                                    borderColor: selectedDeliveryOption === option.id ? '#3B82F6' : '#E5E7EB',
                                    marginBottom: 8
                                }}
                                onPress={() => setSelectedDeliveryOption(option.id)}
                            >
                                <View style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    borderColor: selectedDeliveryOption === option.id ? '#3B82F6' : '#D1D5DB',
                                    backgroundColor: selectedDeliveryOption === option.id ? '#3B82F6' : 'transparent',
                                    marginRight: 12
                                }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: '#1F2937'
                                    }}>
                                        {option.label}
                                    </Text>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#6B7280'
                                    }}>
                                        {option.description}
                                    </Text>
                                </View>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: option.price === 0 ? '#059669' : '#1F2937'
                                }}>
                                    {option.price === 0 ? 'Free' : `Rp ${option.price.toLocaleString()}`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Payment Methods */}
                    <View style={{
                        margin: 16,
                        marginTop: 0
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 12
                        }}>
                            Metode Pembayaran
                        </Text>
                        {paymentMethods.map((method) => (
                            <TouchableOpacity
                                key={method.id}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    backgroundColor: selectedPaymentMethod === method.id ? '#EBF8FF' : '#F9FAFB',
                                    borderRadius: 8,
                                    borderWidth: selectedPaymentMethod === method.id ? 2 : 1,
                                    borderColor: selectedPaymentMethod === method.id ? '#3B82F6' : '#E5E7EB',
                                    marginBottom: 8
                                }}
                                onPress={() => setSelectedPaymentMethod(method.id)}
                            >
                                <View style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    borderWidth: 2,
                                    borderColor: selectedPaymentMethod === method.id ? '#3B82F6' : '#D1D5DB',
                                    backgroundColor: selectedPaymentMethod === method.id ? '#3B82F6' : 'transparent',
                                    marginRight: 12
                                }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={{
                                        fontSize: 14,
                                        fontWeight: '600',
                                        color: '#1F2937'
                                    }}>
                                        {method.label}
                                    </Text>
                                    <Text style={{
                                        fontSize: 12,
                                        color: '#6B7280'
                                    }}>
                                        {method.description}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Order Summary */}
                    <View style={{
                        margin: 16,
                        marginTop: 0,
                        padding: 16,
                        backgroundColor: '#F0FDF4',
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: '#BBF7D0'
                    }}>
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#1F2937',
                            marginBottom: 12
                        }}>
                            Ringkasan Pesanan
                        </Text>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 4
                        }}>
                            <Text style={{ fontSize: 14, color: '#6B7280' }}>
                                {foodItem.name} x {quantity}
                            </Text>
                            <Text style={{ fontSize: 14, color: '#6B7280' }}>
                                Rp {((foodItem.price || 15000) * quantity).toLocaleString()}
                            </Text>
                        </View>

                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 8
                        }}>
                            <Text style={{ fontSize: 14, color: '#6B7280' }}>
                                Biaya Pengiriman
                            </Text>
                            <Text style={{ fontSize: 14, color: '#6B7280' }}>
                                Rp {(deliveryOptions.find(opt => opt.id === selectedDeliveryOption)?.price || 0).toLocaleString()}
                            </Text>
                        </View>

                        <View style={{
                            borderTopWidth: 1,
                            borderTopColor: '#BBF7D0',
                            paddingTop: 8,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#1F2937'
                            }}>
                                Total
                            </Text>
                            <Text style={{
                                fontSize: 16,
                                fontWeight: '600',
                                color: '#059669'
                            }}>
                                Rp {calculateTotal().toLocaleString()}
                            </Text>
                        </View>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Place Order Button */}
                <View style={{
                    padding: 16,
                    borderTopWidth: 1,
                    borderTopColor: '#E5E7EB',
                    backgroundColor: '#FFFFFF'
                }}>
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#059669',
                            paddingVertical: 16,
                            borderRadius: 12
                        }}
                        onPress={handlePlaceOrder}
                    >
                        <ShoppingCart size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
                        <Text style={{
                            fontSize: 16,
                            fontWeight: '600',
                            color: '#FFFFFF'
                        }}>
                            Pesan Sekarang - Rp {calculateTotal().toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </Modal>
    );
};