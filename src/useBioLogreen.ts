import { useState, useRef, useCallback, useEffect } from 'react';
import {
  useCameraDevice,
  useCameraPermission,
  useFrameProcessor,
  Camera,
  PhotoFile,
} from 'react-native-vision-camera';
import { scanFaces } from 'vision-camera-face-detector';
import { runOnJS } from 'react-native-reanimated';
import RNFS from 'react-native-fs';
import { loginWithFaceApi, signupWithFaceApi } from './api';
import {
  UseBioLogreenOptions,
  UseBioLogreenReturn,
  FaceAuthResponse,
  SignupOptions,
} from './types';

// Constants for capture logic
const CAPTURE_DELAY_MS = 500; 

type ApiCall = (base64: string) => Promise<FaceAuthResponse>;
type Resolver = (response: FaceAuthResponse) => void;
type Rejecter = (reason?: any) => void;

export const useBioLogreen = ({
  apiKey,
  baseURL,
}: UseBioLogreenOptions): UseBioLogreenReturn => {
  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

  // Camera and permissions
  const device = useCameraDevice('front');
  const { hasPermission, requestPermission } = useCameraPermission();
  const cameraRef = useRef<Camera>(null);

  // Refs for managing the async capture process
  const captureResolver = useRef<Resolver | undefined>(undefined);
  const captureRejecter = useRef<Rejecter | undefined>(undefined);
  const isCapturing = useRef(false);
  const faceStableSince = useRef<number | null>(null);
  const activeApiCall = useRef<ApiCall | undefined>(undefined);

  // Request camera permission on mount
  useEffect(() => {
    if (!hasPermission) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  const resetState = () => {
    setIsLoading(false);
    setError(null);
    isCapturing.current = false;
    faceStableSince.current = null;
    captureResolver.current = undefined;
    captureRejecter.current = undefined;
    activeApiCall.current = undefined;
  };

  const takePhotoAndResolve = useCallback(async () => {
    const reject = captureRejecter.current;
    if (!cameraRef.current) {
      reject?.(new Error('Camera is not available.'));
      resetState();
      return;
    }
    if (!activeApiCall.current) {
      reject?.(new Error('API call handler not set.'));
      resetState();
      return;
    }

    try {
      const photo: PhotoFile = await cameraRef.current.takePhoto();

      // Read the temporary file and convert it to Base64
      const base64Data = await RNFS.readFile(photo.path, 'base64');
      
      const response = await activeApiCall.current(base64Data);
      captureResolver.current?.(response);
    } catch (e) {
      reject?.(e instanceof Error ? e : new Error('Capture failed'));
    } finally {
      resetState();
    }
  }, []);

  const frameProcessor = useFrameProcessor(
    (frame) => {
      'worklet';
      const faces = scanFaces(frame);
      const isFaceInView = faces.length > 0;

      runOnJS(setFaceDetected)(isFaceInView);

      if (!isCapturing.current) {
        faceStableSince.current = null;
        return;
      }

      if (isFaceInView) {
        const now = Date.now();
        if (faceStableSince.current === null) {
          faceStableSince.current = now;
        }

        if (now - (faceStableSince.current ?? 0) >= CAPTURE_DELAY_MS) {
          isCapturing.current = false;
          runOnJS(takePhotoAndResolve)();
        }
      } else {
        faceStableSince.current = null;
      }
    },
    [takePhotoAndResolve]
  );

  const startCapture = (apiCall: ApiCall) => {
    return new Promise<FaceAuthResponse>((resolve, reject) => {
      if (isLoading) {
        return reject(new Error('An operation is already in progress.'));
      }
      setIsLoading(true);
      setError(null);

      activeApiCall.current = apiCall;
      captureResolver.current = resolve;
      captureRejecter.current = reject;
      isCapturing.current = true;
    });
  };

  const loginWithFace = () =>
    startCapture((base64: string) => loginWithFaceApi(base64, { apiKey, baseURL }));

  const signupWithFace = (options?: SignupOptions) =>
    startCapture((base64: string) =>
      signupWithFaceApi(base64, { apiKey, baseURL }, options)
    );

  return {
    isLoading,
    error,
    faceDetected,
    loginWithFace,
    signupWithFace,
    cameraProps: {
      ref: cameraRef,
      device,
      isActive: hasPermission,
      frameProcessor,
      photo: true,
    },
  };
};

