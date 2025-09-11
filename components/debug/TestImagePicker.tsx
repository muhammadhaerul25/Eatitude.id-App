import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function TestImagePicker() {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const testWebImagePicker = () => {
        try {
            console.log('Testing web image picker');

            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.style.display = 'none';

            input.onchange = (event) => {
                const file = (event.target as HTMLInputElement).files?.[0];
                if (file) {
                    console.log('File selected:', file);

                    // Create preview URL
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const result = e.target?.result as string;
                        console.log('Preview created');
                        setSelectedImage(result);
                    };
                    reader.readAsDataURL(file);
                }
            };

            document.body.appendChild(input);
            input.click();
            document.body.removeChild(input);
        } catch (error) {
            console.error('Error in web image picker:', error);
            Alert.alert('Error', 'Failed to open file picker. Please try again.');
        }
    };

    const testImagePicker = async () => {
        try {
            console.log('Testing expo image picker');

            // Check if we're in a web environment
            const isWeb = typeof window !== 'undefined' && window.document;

            if (isWeb) {
                testWebImagePicker();
                return;
            }

            // Request permission
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Please allow access to your photo library.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                setSelectedImage(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error in image picker:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Error', 'Failed to pick image: ' + errorMessage);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Image Picker Test</Text>

            <TouchableOpacity style={styles.button} onPress={testImagePicker}>
                <Text style={styles.buttonText}>Test Image Picker</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={testWebImagePicker}>
                <Text style={styles.buttonText}>Test Web Picker</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: '#ff6b6b' }]}
                onPress={() => Alert.alert('Test', 'Basic button works!')}
            >
                <Text style={styles.buttonText}>Test Basic Button</Text>
            </TouchableOpacity>

            {selectedImage && (
                <View style={styles.imageContainer}>
                    <Text style={styles.imageLabel}>Selected Image:</Text>
                    <Image source={{ uri: selectedImage }} style={styles.image} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#f5f5f5',
        borderRadius: 10,
        margin: 20,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    imageContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    imageLabel: {
        fontSize: 16,
        marginBottom: 10,
    },
    image: {
        width: 200,
        height: 200,
        borderRadius: 10,
    },
});
