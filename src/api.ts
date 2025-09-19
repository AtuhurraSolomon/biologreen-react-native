import { FaceAuthResponse, SignupOptions } from './types';

const defaultBaseURL = "https://api.biologreen.com/v1";

interface ApiClientOptions {
  apiKey: string;
  baseURL?: string;
}

interface ApiError {
  detail: string;
}

/**
 * A helper function to handle fetch requests and response parsing.
 * @param endpoint The API endpoint to call.
 * @param options The configuration for the API client.
 * @param payload The JSON body for the request.
 * @returns A promise that resolves with the API response.
 */
async function post<T>(
  endpoint: string,
  options: ApiClientOptions,
  payload: Record<string, any>
): Promise<T> {
  const url = (options.baseURL || defaultBaseURL) + endpoint;

  const headers = {
    'Content-Type': 'application/json',
    'X-API-KEY': options.apiKey,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    try {
      const errorData: ApiError = await response.json();
      throw new Error(errorData.detail || `API Error: ${response.status}`);
    } catch (e) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }
  }

  return response.json() as Promise<T>;
}

/**
 * Registers a new user by their face.
 * @param imageBase64 The base64 encoded image string.
 * @param options The configuration for the API client.
 * @param signupOptions Optional custom fields for the new user.
 * @returns A promise resolving to the new user's details.
 */
export const signupWithFaceApi = (
  imageBase64: string,
  options: ApiClientOptions,
  signupOptions?: SignupOptions
): Promise<FaceAuthResponse> => {
  const payload: Record<string, any> = { image_base64: imageBase64 };
  if (signupOptions?.custom_fields) {
    payload.custom_fields = signupOptions.custom_fields;
  }
  return post<FaceAuthResponse>('/auth/signup-face', options, payload);
};

/**
 * Authenticates an existing user by their face.
 * @param imageBase64 The base64 encoded image string.
 * @param options The configuration for the API client.
 * @returns A promise resolving to the matched user's details.
 */
export const loginWithFaceApi = (
  imageBase64: string,
  options: ApiClientOptions
): Promise<FaceAuthResponse> => {
  const payload = { image_base64: imageBase64 };
  return post<FaceAuthResponse>('/auth/login-face', options, payload);
};
