// JWT decode utility for Google OAuth tokens
export interface GoogleTokenPayload {
  iss: string;
  azp: string;
  aud: string;
  sub: string;
  email: string;
  email_verified: boolean;
  at_hash: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat: number;
  exp: number;
}

/**
 * Decode JWT token without verification (for client-side use only)
 * In production, always verify the token on your backend server!
 */
export function decodeJWT(token: string): GoogleTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    );
    return decoded as GoogleTokenPayload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * Initialize Google Sign-In
 * Requires Google OAuth Client ID to be set
 */
export function initGoogleSignIn(clientId: string, callback: (token: string) => void, onError: (error: any) => void) {
  if (!window.google) {
    onError('Google SDK not loaded');
    return;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: any) => {
        if (response.credential) {
          callback(response.credential);
        } else {
          onError('No credential received');
        }
      },
      error_callback: () => {
        onError('Google Sign-In initialization failed');
      }
    });
  } catch (error) {
    console.error('Google Sign-In init error:', error);
    onError(error);
  }
}

/**
 * Render Google Sign-In button
 */
export function renderGoogleSignInButton(elementId: string, options?: any) {
  if (!window.google) {
    console.error('Google SDK not loaded');
    return;
  }

  try {
    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large',
        width: '100%',
        ...options
      }
    );
  } catch (error) {
    console.error('Error rendering Google button:', error);
  }
}

/**
 * Handle Google Sign-In button click
 */
export function triggerGoogleSignIn() {
  if (!window.google) {
    console.error('Google SDK not loaded');
    return;
  }

  try {
    window.google.accounts.id.prompt((notification: any) => {
      // Handle prompt notification
      console.log('Google prompt notification:', notification);
    });
  } catch (error) {
    console.error('Error triggering Google Sign-In:', error);
  }
}

// Type definitions for Google API
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: (onPromptClosed: (notification: any) => void) => void;
          cancel: () => void;
        };
      };
    };
  }
}
