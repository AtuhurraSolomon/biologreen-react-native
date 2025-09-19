// The JSON response from your API, matching our Go SDK.
export interface FaceAuthResponse {
  user_id: number;
  is_new_user: boolean;
  custom_fields?: Record<string, any>;
}

// Options for the signup function.
export interface SignupOptions {
  custom_fields?: Record<string, any>;
}

// Options required to initialize our main hook.
export interface UseBioLogreenOptions {
  apiKey: string;
  // Optional base URL for local testing.
  baseURL?: string;
}

// The values and functions our hook will return to the developer.
export interface UseBioLogreenReturn {
  /** True when the SDK is communicating with the API. */
  isLoading: boolean;
  /** Contains an error object if an API call fails. */
  error: Error | null;
  /** True if a face is currently detected in the camera view. */
  faceDetected: boolean;
  /** Helper props to be spread onto the <Camera> component. */
  cameraProps: Record<string, any>;
  /** Function to trigger a login attempt. */
  loginWithFace: () => Promise<FaceAuthResponse>;
  /** Function to trigger a signup attempt. */
  signupWithFace: (options?: SignupOptions) => Promise<FaceAuthResponse>;
}
