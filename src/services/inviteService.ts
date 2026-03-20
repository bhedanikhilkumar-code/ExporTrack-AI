// Frontend API service for invitation system

export interface InviteRequest {
    email: string;
    name: string;
    role: string;
    workspaceId?: string;
    workspaceName?: string;
    inviterId?: string;
    inviterName?: string;
    inviterEmail?: string;
}

export interface InviteResponse {
    success: boolean;
    message?: string;
    inviteId?: string;
    inviteToken?: string;
    error?: string;
}

export interface InviteDetails {
    id: string;
    email: string;
    name: string;
    role: string;
    workspaceName: string;
    inviterName: string;
    expiresAt: number;
}

export interface GetInviteResponse {
    success: boolean;
    invite?: InviteDetails;
    error?: string;
    expired?: boolean;
    alreadyAccepted?: boolean;
    canRequestNew?: boolean;
}

export interface ConfirmInviteRequest {
    token: string;
    userId?: string;
    userEmail: string;
    userName: string;
}

export interface ConfirmInviteResponse {
    success: boolean;
    message?: string;
    invite?: {
        id: string;
        workspaceName: string;
        role: string;
    };
    error?: string;
    expired?: boolean;
}

// Send invitation to a team member
export async function sendInvite(request: InviteRequest): Promise<InviteResponse> {
    try {
        const response = await fetch('/api/invite-member', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to send invite:', error);
        return {
            success: false,
            error: 'Failed to send invitation. Please try again.',
        };
    }
}

// Get invitation details by token
export async function getInviteDetails(token: string): Promise<GetInviteResponse> {
    try {
        const response = await fetch(`/api/invite-member?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to get invite details:', error);
        return {
            success: false,
            error: 'Failed to load invitation details',
        };
    }
}

// Confirm/Accept an invitation
export async function confirmInvite(request: ConfirmInviteRequest): Promise<ConfirmInviteResponse> {
    try {
        const response = await fetch('/api/confirm-invite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to confirm invite:', error);
        return {
            success: false,
            error: 'Failed to accept invitation. Please try again.',
        };
    }
}

// Resend an invitation
export async function resendInvite(inviteId: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
        const response = await fetch('/api/resend-invite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inviteId }),
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to resend invite:', error);
        return {
            success: false,
            error: 'Failed to resend invitation. Please try again.',
        };
    }
}

// Validate email format
export function validateEmail(email: string): { isValid: boolean; error?: string } {
    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!email || email.trim() === '') {
        return { isValid: false, error: 'Email is required' };
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(trimmedEmail)) {
        return { isValid: false, error: 'Enter a valid email address' };
    }

    if (trimmedEmail.includes('..')) {
        return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true };
}
