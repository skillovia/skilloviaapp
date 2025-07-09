import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';

const { width } = Dimensions.get('window');

const DynamicGoogleMap = ({ location, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Replace with your actual Google Maps API key
  const API_KEY = "AIzaSyChFAjrSODzkkKl_TaCCslNXdHwIWR-_uw";

  useEffect(() => {
    if (location) {
      setLoading(false);
    } else {
      setError('No location provided');
      setLoading(false);
    }
  }, [location]);

  const handleWebViewLoad = () => {
    setLoading(false);
  };

  const handleWebViewError = () => {
    setError('Failed to load map');
    setLoading(false);
  };

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]}>
        <Text style={styles.errorText}>Error loading map: {error}</Text>
      </View>
    );
  }

  // Create HTML with iframe for Google Maps Embed
  const mapHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: 0;
            border-radius: 12px;
          }
        </style>
      </head>
      <body>
        <iframe
          src="https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${encodeURIComponent(location)}&zoom=15"
          allowfullscreen>
        </iframe>
      </body>
    </html>
  `;

  return (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading map...</Text>
        </View>
      )}
      <WebView
        source={{ html: mapHtml }}
        style={styles.webView}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        startInLoadingState={true}
        scalesPageToFit={false}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 288, // 18rem equivalent (18 * 16 = 288)
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  webView: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'AlbertSans-Regular',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorText: {
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
    fontFamily: 'AlbertSans-Regular',
  },
});

export default DynamicGoogleMap;