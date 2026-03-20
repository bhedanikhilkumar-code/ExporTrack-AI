// Serverless function for email validation (format + existence check)
// Deploy to Vercel: https://vercel.com/docs/serverless-functions/introduction

interface EmailValidationResponse {
    isValid: boolean;
    isDisposable: boolean;
    error?: string;
    details?: {
        isValidFormat: boolean;
        domainExists: boolean;
        isCatchAll: boolean;
        emailExists?: boolean;
    };
}

// RFC 5322 compliant email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Disposable email domains to block
const DISPOSABLE_DOMAINS = [
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'fakeinbox.com',
    'yopmail.com',
    'trashmail.com',
    'dispostable.com',
    'sharklasers.com'
];

function validateEmailFormat(email: string): { isValid: boolean; error?: string } {
    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return { isValid: false, error: 'Enter a valid email' };
    }

    // Check for common typos and invalid patterns
    if (trimmedEmail.includes('..')) {
        return { isValid: false, error: 'Invalid email: consecutive dots not allowed' };
    }

    if (trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
        return { isValid: false, error: 'Invalid email: cannot start or end with a dot' };
    }

    return { isValid: true };
}

function isDisposableEmail(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    return domain ? DISPOSABLE_DOMAINS.includes(domain) : false;
}

async function checkEmailExistsWithAbstractAPI(email: string, apiKey: string): Promise<{ exists: boolean; isCatchAll: boolean }> {
    try {
        const response = await fetch(
            `https://emailvalidation.abstractapi.com/v1/?api_key=${apiKey}&email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
            throw new Error('Abstract API error');
        }

        const data = await response.json();

        return {
            exists: data.is_valid_format?.value === true && data.deliverability !== 'UNDELIVERABLE',
            isCatchAll: data.is_catch_all === true
        };
    } catch (error) {
        console.error('Abstract API error:', error);
        // Fallback: assume email exists if API fails
        return { exists: true, isCatchAll: false };
    }
}

async function checkEmailExistsWithZeroBounce(email: string, apiKey: string): Promise<{ exists: boolean; isCatchAll: boolean }> {
    try {
        const response = await fetch(
            `https://api.zerobounce.net/v2/validate?api_key=${apiKey}&email=${encodeURIComponent(email)}`
        );

        if (!response.ok) {
            throw new Error('ZeroBounce API error');
        }

        const data = await response.json();

        return {
            exists: data.status === 'valid',
            isCatchAll: data.catch_all === true
        };
    } catch (error) {
        console.error('ZeroBounce API error:', error);
        // Fallback: assume email exists if API fails
        return { exists: true, isCatchAll: false };
    }
}

async function checkEmailMXRecord(domain: string): Promise<boolean> {
    try {
        // Using DNS-over-HTTPS to check MX records
        const response = await fetch(
            `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        // Check if MX records exist
        return data.Answer && data.Answer.some((record: any) => record.type === 15);
    } catch (error) {
        console.error('MX record check error:', error);
        return false;
    }
}

export default async function handler(req: any, res: any) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    const { email } = req.body;

    // Validate email exists
    if (!email) {
        return res.status(400).json({
            success: false,
            isValid: false,
            error: 'Email is required'
        });
    }

    // Step 1: Validate email format
    const formatValidation = validateEmailFormat(email);
    if (!formatValidation.isValid) {
        return res.status(400).json({
            success: false,
            isValid: false,
            error: formatValidation.error || 'Enter a valid email',
            details: {
                isValidFormat: false,
                domainExists: false,
                isCatchAll: false
            }
        });
    }

    const emailLower = email.toLowerCase();

    // Step 2: Check if email is from disposable domain
    if (isDisposableEmail(emailLower)) {
        return res.status(400).json({
            success: false,
            isValid: false,
            isDisposable: true,
            error: 'This email does not exist. Please enter a valid email.',
            details: {
                isValidFormat: true,
                domainExists: false,
                isCatchAll: false
            }
        });
    }

    // Step 3: Check if email exists using external API or MX records
    const domain = emailLower.split('@')[1];
    let emailExists = true;
    let isCatchAll = false;

    // Get API configuration from environment
    const emailVerificationApiKey = process.env.EMAIL_VERIFICATION_API_KEY;
    const emailVerificationProvider = process.env.EMAIL_VERIFICATION_PROVIDER || 'abstract';

    if (emailVerificationApiKey) {
        // Use external API for email verification
        if (emailVerificationProvider === 'zerobounce') {
            const result = await checkEmailExistsWithZeroBounce(emailLower, emailVerificationApiKey);
            emailExists = result.exists;
            isCatchAll = result.isCatchAll;
        } else {
            // Default to Abstract API
            const result = await checkEmailExistsWithAbstractAPI(emailLower, emailVerificationApiKey);
            emailExists = result.exists;
            isCatchAll = result.isCatchAll;
        }
    } else {
        // Fallback: Check MX records only
        const mxExists = await checkEmailMXRecord(domain);
        if (!mxExists) {
            return res.status(400).json({
                success: false,
                isValid: false,
                error: 'This email does not exist. Please enter a valid email.',
                details: {
                    isValidFormat: true,
                    domainExists: false,
                    isCatchAll: false
                }
            });
        }
    }

    // If email doesn't exist
    if (!emailExists) {
        return res.status(400).json({
            success: false,
            isValid: false,
            error: 'This email does not exist. Please enter a valid email.',
            details: {
                isValidFormat: true,
                domainExists: false,
                isCatchAll: isCatchAll
            }
        });
    }

    // Email is valid
    return res.status(200).json({
        success: true,
        isValid: true,
        isDisposable: false,
        error: undefined,
        details: {
            isValidFormat: true,
            domainExists: true,
            isCatchAll: isCatchAll,
            emailExists: true
        }
    });
}
