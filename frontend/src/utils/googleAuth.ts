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

export interface GoogleSignInCallbackResponse {
    credential: string;
    select_by: string;
    clientId?: string;
    client_id?: string;
}

export class GoogleAuthError extends Error {
    constructor(public code: string, message: string) {
        super(message);
        this.name = 'GoogleAuthError';
    }
}

/**
 * Decode JWT token without verification (for client-side use only)
 * In production, always verify the token on your backend server!
 */
export function decodeJWT(token: string): GoogleTokenPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            console.error('Invalid token format: expected 3 parts, got', parts.length);
            return null;
        }

        const decoded = JSON.parse(
            atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
        );

        // Validate required fields
        if (!decoded.email || !decoded.sub) {
            console.error('Token missing required fields (email or sub)');
            return null;
        }

        return decoded as GoogleTokenPayload;
    } catch (error) {
        console.error('Failed to decode token:', error);
        return null;
    }
}

/**
 * Check if token is expired
 */
export function isTokenExpired(token: GoogleTokenPayload): boolean {
    const currentTime = Math.floor(Date.now() / 1000);
    return currentTime >= token.exp;
}

/**
 * Validate token expiry before using
 */
export function validateTokenExpiry(token: GoogleTokenPayload): boolean {
    if (isTokenExpired(token)) {
        console.warn('Google token has expired');
        return false;
    }
    return true;
}

/**
 * Initialize Google Sign-In
 * Requires Google OAuth Client ID to be set
 */
export function initGoogleSignIn(
    clientId: string,
    callback: (response: GoogleSignInCallbackResponse) => void,
    onError?: (error: GoogleAuthError) => void
) {
    if (!(globalThis as any).google) {
        const error = new GoogleAuthError('SDK_NOT_LOADED', 'Google SDK not loaded. Please reload the page.');
        onError?.(error);
        throw error;
    }

    if (!clientId || clientId.trim() === '') {
        const error = new GoogleAuthError('INVALID_CLIENT_ID', 'Google Client ID is not configured');
        onError?.(error);
        throw error;
    }

    try {
        (globalThis as any).google.accounts.id.initialize({
            client_id: clientId,
            callback: (response: GoogleSignInCallbackResponse) => {
                if (response.credential) {
                    // Decode and validate token immediately
                    const payload = decodeJWT(response.credential);
                    if (!payload) {
                        const error = new GoogleAuthError('INVALID_TOKEN', 'Failed to decode Google token');
                        onError?.(error);
                        return;
                    }

                    if (!validateTokenExpiry(payload)) {
                        const error = new GoogleAuthError('TOKEN_EXPIRED', 'Google token has expired');
                        onError?.(error);
                        return;
                    }

                    callback(response);
                } else {
                    const error = new GoogleAuthError('NO_CREDENTIAL', 'No credential received from Google');
                    onError?.(error);
                }
            }
        });

        console.log('Google Sign-In initialized successfully');
    } catch (error) {
        console.error('Google Sign-In init error:', error);
        const authError = new GoogleAuthError('INIT_FAILED', `Google Sign-In initialization failed: ${error}`);
        onError?.(authError);
        throw authError;
    }
}

/**
 * Render Google Sign-In button
 */
export function renderGoogleSignInButton(elementId: string, options?: any): boolean {
    if (!(globalThis as any).google) {
        console.error('Google SDK not loaded');
        return false;
    }

    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Element with id "${elementId}" not found`);
        return false;
    }

    try {
        (globalThis as any).google.accounts.id.renderButton(
            element,
            {
                theme: 'outline',
                size: 'large',
                width: '100%',
                text: 'signin_with',
                logo_alignment: 'left',
                ...options
            }
        );
        console.log('Google Sign-In button rendered successfully');
        return true;
    } catch (error) {
        console.error('Error rendering Google button:', error);
        return false;
    }
}

/**
 * Show Google One Tap prompt
 */
export function showGoogleOneTapPrompt(onSuccess?: (notification: any) => void, onError?: (notification: any) => void) {
    if (!(globalThis as any).google) {
        console.error('Google SDK not loaded');
        return;
    }

    try {
        (globalThis as any).google.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
                console.log('One Tap prompt not displayed:', notification);
                onError?.(notification);
            } else {
                console.log('One Tap prompt shown');
                onSuccess?.(notification);
            }
        });
    } catch (error) {
        console.error('Error showing One Tap prompt:', error);
        onError?.(error);
    }
}

/**
 * Cancel Google One Tap prompt
 */
export function cancelGooglePrompt() {
    if (!(globalThis as any).google) {
        console.error('Google SDK not loaded');
        return;
    }

    try {
        (globalThis as any).google.accounts.id.cancel();
    } catch (error) {
        console.error('Error cancelling Google prompt:', error);
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
