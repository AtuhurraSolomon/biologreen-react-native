Bio-Logreen React Native SDK

The official React Native SDK for Bio-Logreen, the simplest way to add passwordless, facial authentication to your mobile applications.

This SDK provides a headless React Hook (useBioLogreen) that manages camera access, real-time face detection, and API communication, giving you the flexibility to build a completely custom UI for your login and signup flows.

Features

Headless by Design: Provides all the logic; you provide the UI.

Automatic Capture: Intelligently detects a stable face and captures a photo without requiring a button press.

Promise-Based API: Modern async/await friendly functions for clean code.

TypeScript Support: Fully typed for a better developer experience.

Cross-Platform: Works on both iOS and Android.

Installation

npm install biologreen-react-native react-native-vision-camera react-native-vision-camera-face-detector react-native-worklets-core react-native-reanimated react-native-fs


⚠️ Important: Setup & Configuration

This SDK relies on powerful native libraries that require a precise and careful setup. Please follow these steps exactly.

Android - Camera Permissions:

Open android/app/src/main/AndroidManifest.xml.

Add <uses-permission android:name="android.permission.CAMERA" /> before the <application> tag.

iOS - Camera Permissions:

Open ios/[YourProjectName]/Info.plist.

Add the NSCameraUsageDescription key with a string explaining why you need the camera.

Enable Frame Processors (Babel):

Open babel.config.js.

Add the required plugins. The order is critical.

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-worklets-core/plugin', // Must be first
    'react-native-reanimated/plugin',
  ],
};


Install iOS Pods:

From your project root, run cd ios && pod install.

🚨 Troubleshooting & Known Build Issues

The React Native native build process, especially on Windows for Android, is notoriously complex and fragile. The errors are often difficult to understand. If your build fails, particularly with a Task :react-native-vision-camera:compileDebugKotlin FAILED error, it is almost certainly due to a version incompatibility between the native libraries and your build environment.

The configuration below is a known-stable setup. It is highly recommended you configure your test project's build files to match these versions exactly.

1. Environment Prerequisite: Java JDK 17

Modern React Native requires JDK 17. Ensure it is installed and that your JAVA_HOME environment variable is set correctly.

2. Android SDK Location (ANDROID_HOME)

If the build fails with SDK location not found, you must set the ANDROID_HOME environment variable to point to your Android SDK, typically located at C:\Users\YourUser\AppData\Local\Android\Sdk.

3. Recommended android/build.gradle

This file sets the master configuration for your entire Android project. Using these specific versions for the Android Gradle Plugin and Kotlin is critical for compatibility.

// In android/build.gradle
buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 24
        compileSdkVersion = 34
        targetSdkVersion = 34
        kotlinVersion = "1.9.22" 
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:8.1.1")
        classpath("com.facebook.react:react-native-gradle-plugin")
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
    }
}


4. Recommended android/app/build.gradle Dependency

The face detector plugin relies on Google's ML Kit. Ensure this dependency is added to your android/app/build.gradle file.

// In android/app/build.gradle
dependencies {
    // ... other dependencies
    implementation 'com.google.mlkit:face-detection:16.1.6'
}


5. The Golden Rule: Clean Your Build

After making any changes to your native configuration (build.gradle files, npm install, etc.), you must perform a clean build. From your project root:

cd android
./gradlew clean  # Use gradlew.bat on Windows
cd ..
npx react-native run-android


Quick Start: Usage Example

(Your existing, excellent usage example would go here)

import React from 'react';
import { Camera } from 'react-native-vision-camera';
import { useBioLogreen } from 'biologreen-react-native';
// ... etc ...


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