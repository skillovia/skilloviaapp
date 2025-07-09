import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

import Icon from 'react-native-vector-icons/MaterialIcons';
import apiClient from '../../Hooks/Api';
import { Color } from '../../Utils/Theme';

const OpenDisputePage = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Get data passed via navigation
    const { bookingId, bookedUserId, bookingTitle, description } = route.params || {};

    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const [message, setMessage] = useState('The service was not rendered');
    const [file, setFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    const pickFile = async () => {
        launchImageLibrary(
            {
                mediaType: 'photo',
                quality: 0.7,
            },
            (response) => {
                if (response.didCancel) return;
                if (response.errorCode) {
                    Alert.alert('Error', response.errorMessage || 'Could not open file picker.');
                    return;
                }
                if (response.assets && response.assets.length > 0) {
                    const asset = response.assets[0];
                    setFile(asset);
                    setPreviewUrl(asset.uri);
                }
            }
        );
    };

    const handleSubmitDispute = async () => {
        if (!bookingId) {
            Alert.alert('Error', 'Missing booking information');
            return;
        }
        setIsProcessing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('bookingId', bookingId);
            formData.append('message', message);

            if (file && file.uri) {
                formData.append('file', {
                    uri: Platform.OS === 'android' ? file.uri : file.uri.replace('file://', ''),
                    type: file.type || 'image/jpeg',
                    name: file.fileName || `upload.jpg`,
                });
            }

            const response = await apiClient.post('/dispute/open', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data) {
                setShowModal(true);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || 'Failed to open dispute';
            setError(msg);
            Alert.alert('Failed', msg);
        } finally {
            setIsProcessing(false);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        navigation.navigate('Bookings');
    };

    if (!bookingId) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.errorText}>Missing booking information. Please try again.</Text>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Bookings')}
                >
                    <Text style={styles.buttonText}>Return to Bookings</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Icon name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Open Dispute</Text>
            </View>

            <Text style={styles.title}>
                Open a Dispute for Booking #{bookingId}
            </Text>
            {bookingTitle ? (
                <Text style={styles.subtitle}>{bookingTitle}</Text>
            ) : null}

            {error ? (
                <View style={styles.errorBox}>
                    <Text style={styles.errorBoxText}>{error}</Text>
                </View>
            ) : null}

            <View style={styles.formGroup}>
                <Text style={styles.label}>Message</Text>
                <TextInput
                    value={message}
                    onChangeText={setMessage}
                    placeholder="Describe the issue with your booking"
                    style={styles.input}
                    multiline
                    numberOfLines={5}
                />
            </View>

            <View style={styles.formGroup}>
                <Text style={styles.label}>Upload File</Text>
                <TouchableOpacity
                    style={styles.uploadBox}
                    onPress={pickFile}
                    activeOpacity={0.8}
                >
                    <Icon name="cloud-upload" size={28} color="#666" style={{ marginBottom: 8 }} />
                    <Text style={styles.uploadLabel}>
                        Tap to upload supporting document
                    </Text>
                    {previewUrl ? (
                        <View style={styles.previewWrap}>
                            <Image
                                source={{ uri: previewUrl }}
                                style={styles.previewImg}
                                resizeMode="contain"
                            />
                        </View>
                    ) : null}
                </TouchableOpacity>
            </View>

            <View style={styles.buttonRow}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={[styles.button, styles.cancelButton]}
                >
                    <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleSubmitDispute}
                    style={[styles.button, styles.submitButton]}
                    disabled={isProcessing}
                >
                    {isProcessing ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <ActivityIndicator color="#fff" size="small" style={{ marginRight: 8 }} />
                            <Text style={styles.buttonText}>Submitting...</Text>
                        </View>
                    ) : (
                        <Text style={styles.buttonText}>Submit Dispute</Text>
                    )}
                </TouchableOpacity>
            </View>

            {showModal ? (
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Success</Text>
                        <Text style={styles.modalText}>
                            Your dispute has been submitted successfully.
                        </Text>
                        <TouchableOpacity
                            style={[styles.button, styles.submitButton]}
                            onPress={closeModal}
                        >
                            <Text style={styles.buttonText}>Go to Bookings</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : null}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container:
     { flex: 1,
         backgroundColor: Color.background,
         paddingHorizontal: 16
         },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        marginBottom: 20,
    },
    backButton: { marginRight: 16 },
    headerTitle:
     { 
        fontSize: 20, 
        fontFamily: 'AlbertSans-Bold',
         color: '#222' },
    title: { fontSize: 18, 
        fontFamily: 'AlbertSans-Medium',
         marginVertical: 12 },
    subtitle: { fontSize: 15, color: '#666',
        fontFamily: 'AlbertSans-Regular',
         marginBottom: 16

     },
    errorBox: {
        backgroundColor: '#fee2e2',
        padding: 12,
        borderRadius: 8,
        marginBottom: 14,
    },
    errorBoxText: { color: '#dc2626', fontSize: 14 },
    formGroup: { marginBottom: 22 },
    label: { fontSize: 15, marginBottom: 6,
        fontFamily: 'AlbertSans-Medium',
        color: '#222' },
    input: {
        borderWidth: 1,
        borderColor: '#ececec',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        fontSize: 15,
        minHeight: 90,
        textAlignVertical: 'top',
    },
    uploadBox: {
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#bdbdbd',
        backgroundColor: '#f5f7fa',
        borderRadius: 8,
        alignItems: 'center',
        padding: 18,
        minHeight: 80,
    },
    uploadLabel: { fontSize: 14, color: '#666' },
    previewWrap: { marginTop: 10 },
    previewImg: {
        width: 180,
        height: 140,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#eee',
    },
    buttonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, gap: 10 },
    button: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButton: { backgroundColor: '#f3f3f3', marginRight: 5 },
    cancelButtonText: { color: '#222' },
    submitButton: { backgroundColor: '#dc2626', marginLeft: 5 },
    buttonText: { color: '#fff', 
        fontFamily: 'AlbertSans-Bold',
        
        fontSize: 15 },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
    errorText: { color: '#dc2626', fontSize: 16, marginBottom: 16, textAlign: 'center' },
    modalOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 30,
        alignItems: 'center',
        width: '80%',
        elevation: 6,
    },
    modalTitle: { fontSize: 19, fontWeight: 'bold', marginBottom: 12 },
    modalText: { fontSize: 16, color: '#444', marginBottom: 25, textAlign: 'center' },
});

export default OpenDisputePage;