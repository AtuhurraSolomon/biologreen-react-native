Bio-Logreen React Native SDK
The official React Native SDK for Bio-Logreen, the simplest way to add passwordless, facial authentication to your mobile applications.

This SDK provides a headless React Hook (useBioLogreen) that manages camera access, real-time face detection, and automatic photo capture, giving you the flexibility to build a completely custom UI for your login and signup flows.

Features
Headless by Design: Provides all the logic, you provide the UI.

Automatic Capture: Intelligently detects a stable face and captures a photo without requiring a button press.

Simple Hook-based API: Integrates seamlessly into your React Native components with the useBioLogreen hook.

TypeScript Support: Fully typed for a better developer experience.

Cross-Platform: Works on both iOS and Android.

Installation
npm install biologreen-react-native react-native-vision-camera vision-camera-face-detector react-native-reanimated react-native-fs

Setup & Configuration
This SDK relies on native libraries that require a bit of extra setup.

1. Configure Vision Camera
You must follow the full installation instructions for react-native-vision-camera. This includes:

Adding permissions for Camera usage in Info.plist (iOS) and AndroidManifest.xml (Android).

Adding the Frame Processor plugins to your babel.config.js.

2. Configure React Native FS
For iOS, you need to install the native pods.

cd ios && pod install

For Android, no extra steps are usually required.

Quick Start: Usage Example
Here is a complete example of a login screen that uses the useBioLogreen hook to build a custom UI.

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Camera } from 'react-native-vision-camera';
import { useBioLogreen } from 'biologreen-react-native';

const MyLoginScreen = () => {
  // 1. Initialize the hook with your API key
  const {
    isLoading,
    error,
    faceDetected,
    cameraProps,
    loginWithFace,
    signupWithFace,
  } = useBioLogreen({ apiKey: 'YOUR_PROJECT_API_KEY' });

  useEffect(() => {
    // Example: Automatically try to log the user in when the component mounts.
    // The hook will wait for a stable face, capture it, and send it to your API.
    loginWithFace()
      .then(response => {
        Alert.alert('Success!', `Logged in user with ID: ${response.user_id}`);
        // Navigate to the app's home screen
      })
      .catch(apiError => {
        // You can use the error to decide whether to try signing the user up instead
        console.error('Login failed:', apiError.message);
        Alert.alert('Login Failed', apiError.message);
      });
  }, []); // The empty dependency array ensures this runs only once

  // 2. Build your custom UI using the state provided by the hook
  return (
    <View style={styles.container}>
      {cameraProps.device ? (
        <Camera style={StyleSheet.absoluteFill} {...cameraProps} />
      ) : (
        <Text>Camera not available</Text>
      )}

      {/* Face outline box */}
      <View style={[styles.faceBox, { borderColor: faceDetected ? 'lime' : 'white' }]} />

      {/* Loading indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.statusText}>Processing...</Text>
        </View>
      )}

      {/* Status message */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {error ? error.message : 'Position your face in the frame'}
        </Text>
      </View>
    </View>
  );
};

// --- Add your own custom styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  faceBox: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 200, // Make it a circle/oval
    width: 250,
    height: 350,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusContainer: {
    position: 'absolute',
    bottom: 50,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
  },
  statusText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});

export default MyLoginScreen;

API Reference
useBioLogreen(options)
Options
apiKey (string, required): Your project's secret API key.

baseURL (string, optional): A custom base URL for the Bio-Logreen API. Defaults to the production URL.

Return Values
isLoading (boolean): true when an API call is in progress.

error (Error | null): An error object if the last operation failed.

faceDetected (boolean): true when a face is currently visible in the camera frame.

loginWithFace(): A function that returns a Promise which resolves with the authenticated user's data.

signupWithFace(options): A function that returns a Promise which resolves with the new user's data.

options.customFields (object): A dictionary of custom key-value data to store for the user.

cameraProps (object): A set of props to be spread onto a <Camera /> component from react-native-vision-camera.