/**
 * Environment configuration checker
 * Use this to debug authentication setup issues
 */

export interface EnvCheckResult {
  isProduction: boolean;
  googleClientId: {
    exists: boolean;
    length: number;
    preview: string;
  };
  apiBaseUrl: {
    exists: boolean;
    value: string;
  };
  issues: string[];
  suggestions: string[];
}

/**
 * Check if required environment variables are configured
 */
export function checkEnvironment(): EnvCheckResult {
  const issues: string[] = [];
  const suggestions: string[] = [];

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  const isProduction = import.meta.env.PROD;

  // Check Google Client ID
  if (!googleClientId) {
    issues.push('VITE_GOOGLE_CLIENT_ID is not set');
    suggestions.push('Add VITE_GOOGLE_CLIENT_ID to your environment variables (Vercel Settings → Environment Variables)');
  } else if (googleClientId.length < 20) {
    issues.push('VITE_GOOGLE_CLIENT_ID seems too short');
    suggestions.push('Verify the Client ID is correct. It should be in format: xxxxx-xxxx.apps.googleusercontent.com');
  }

  // Check API Base URL if in production
  if (isProduction && !apiBaseUrl) {
    suggestions.push('VITE_API_BASE_URL is not set. Set this if you have a backend API.');
  }

  const result: EnvCheckResult = {
    isProduction,
    googleClientId: {
      exists: !!googleClientId,
      length: googleClientId?.length || 0,
      preview: googleClientId ? `${googleClientId.substring(0, 20)}...${googleClientId.substring(googleClientId.length - 10)}` : 'NOT_SET'
    },
    apiBaseUrl: {
      exists: !!apiBaseUrl,
      value: apiBaseUrl || 'NOT_SET'
    },
    issues,
    suggestions
  };

  return result;
}

/**
 * Log environment check to console
 */
export function logEnvironmentCheck(): void {
  const result = checkEnvironment();

  console.group('🔍 ExporTrack-AI Environment Check');
  console.log('Mode:', result.isProduction ? 'Production' : 'Development');
  console.log('Google Client ID:', result.googleClientId.preview);
  console.log('API Base URL:', result.apiBaseUrl.value);

  if (result.issues.length > 0) {
    console.group('⚠️ Issues Found:');
    result.issues.forEach(issue => console.warn(`- ${issue}`));
    console.groupEnd();
  }

  if (result.suggestions.length > 0) {
    console.group('💡 Suggestions:');
    result.suggestions.forEach(suggestion => console.info(`- ${suggestion}`));
    console.groupEnd();
  }

  if (result.issues.length === 0) {
    console.log('✅ Environment looks good!');
  }

  console.groupEnd();
}

/**
 * Check if Google OAuth should work
 */
export function canUseGoogleOAuth(): { canUse: boolean; reason: string } {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!googleClientId) {
    return {
      canUse: false,
      reason: 'VITE_GOOGLE_CLIENT_ID environment variable is not set'
    };
  }

  if (googleClientId.length < 20) {
    return {
      canUse: false,
      reason: 'VITE_GOOGLE_CLIENT_ID is too short. Verify it is the correct length.'
    };
  }

  if (!googleClientId.includes('apps.googleusercontent.com')) {
    return {
      canUse: false,
      reason: 'VITE_GOOGLE_CLIENT_ID does not appear to be valid. Expected format: xxxxx-xxxx.apps.googleusercontent.com'
    };
  }

  return {
    canUse: true,
    reason: 'Google OAuth environment variables are properly configured'
  };
}
