import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import AppIcon from '../components/AppIcon';

interface InviteData {
    id: string;
    email: string;
    name: string;
    role: string;
    workspaceName: string;
    inviterName: string;
    expiresAt: number;
}

type InviteState = 'loading' | 'valid' | 'invalid' | 'expired' | 'already_accepted' | 'accepting' | 'success' | 'login_required';

export default function AcceptInvitePage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const { state, acceptInvite: contextAcceptInvite } = useAppContext();

    const [inviteState, setInviteState] = useState<InviteState>('loading');
    const [inviteData, setInviteData] = useState<InviteData | null>(null);
    const [error, setError] = useState<string>('');
    const [isResending, setIsResending] = useState(false);

    // Fetch invite details
    const fetchInviteDetails = useCallback(async () => {
        if (!token) {
            setInviteState('invalid');
            setError('Invalid invitation link');
            return;
        }

        try {
            const response = await fetch(`/api/invite-member?token=${token}`);
            const data = await response.json();

            if (data.success) {
                setInviteData(data.invite);
                setInviteState('valid');
            } else {
                if (data.alreadyAccepted) {
                    setInviteState('already_accepted');
                } else if (data.expired) {
                    setInviteState('expired');
                } else {
                    setInviteState('invalid');
                }
                setError(data.error);
            }
        } catch (err) {
            console.error('Failed to fetch invite:', err);
            setInviteState('invalid');
            setError('Failed to load invitation details');
        }
    }, [token]);

    useEffect(() => {
        fetchInviteDetails();
    }, [fetchInviteDetails]);

    // Handle accept invitation
    const handleAcceptInvite = async () => {
        if (!token || !inviteData) return;

        // Check if user is logged in
        if (!state.isAuthenticated || !state.user) {
            // Store the token and redirect to auth with return URL
            sessionStorage.setItem('pendingInviteToken', token);
            navigate(`/auth?returnUrl=/accept-invite?token=${token}`);
            return;
        }

        setInviteState('accepting');

        try {
            // Try to use backend API first
            const response = await fetch('/api/confirm-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    userId: state.user.id,
                    userEmail: state.user.email,
                    userName: state.user.name,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Update local context
                contextAcceptInvite(inviteData.id);
                setInviteState('success');
            } else {
                setError(data.error);
                if (data.expired) {
                    setInviteState('expired');
                } else {
                    setInviteState('invalid');
                }
            }
        } catch (err) {
            console.error('Failed to accept invite:', err);

            // Fallback to local context if API fails
            try {
                contextAcceptInvite(inviteData.id);
                setInviteState('success');
            } catch (contextErr) {
                setError('Failed to accept invitation');
                setInviteState('invalid');
            }
        }
    };

    // Handle resend invite
    const handleResendInvite = async () => {
        if (!inviteData) return;

        setIsResending(true);
        try {
            const response = await fetch('/api/resend-invite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inviteId: inviteData.id,
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert('New invitation has been sent to your email');
                setInviteState('expired');
            } else {
                setError(data.error || 'Failed to resend invitation');
            }
        } catch (err) {
            console.error('Failed to resend invite:', err);
            setError('Failed to resend invitation');
        } finally {
            setIsResending(false);
        }
    };

    // Render loading state
    if (inviteState === 'loading') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Loading invitation...</p>
                </div>
            </div>
        );
    }

    // Render success state
    if (inviteState === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AppIcon name="check" className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Welcome to the Team! 🎉
                    </h1>

                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        You have successfully joined <strong>{inviteData?.workspaceName}</strong> as a <strong>{inviteData?.role}</strong>.
                    </p>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Render error states
    if (inviteState === 'invalid' || inviteState === 'expired' || inviteState === 'already_accepted') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 p-8 text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AppIcon name="x" className="h-10 w-10 text-red-600 dark:text-red-400" />
                    </div>

                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {inviteState === 'already_accepted' ? 'Already a Member' : 'Invalid Invitation'}
                    </h1>

                    <p className="text-slate-600 dark:text-slate-300 mb-6">
                        {error}
                    </p>

                    <div className="space-y-3">
                        {inviteState === 'expired' && (
                            <button
                                onClick={handleResendInvite}
                                disabled={isResending}
                                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                            >
                                {isResending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <AppIcon name="share" className="h-5 w-5" />
                                        Request New Invitation
                                    </>
                                )}
                            </button>
                        )}

                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full py-3 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all"
                        >
                            Go to Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render valid invite - acceptance page
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/60 dark:border-slate-800/60 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <AppIcon name="team" className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">You're Invited!</h1>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Inviter Info */}
                    <div className="text-center mb-6">
                        <p className="text-slate-600 dark:text-slate-300 mb-1">
                            <strong>{inviteData?.inviterName}</strong> has invited you to join
                        </p>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                            {inviteData?.workspaceName}
                        </h2>
                    </div>

                    {/* Invite Details Card */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">Name</span>
                                <span className="text-slate-900 dark:text-white font-medium">{inviteData?.name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">Email</span>
                                <span className="text-slate-900 dark:text-white font-medium">{inviteData?.email}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">Role</span>
                                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider">
                                    {inviteData?.role}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-500 dark:text-slate-400 text-sm">Expires</span>
                                <span className="text-slate-900 dark:text-white text-sm">
                                    {inviteData?.expiresAt ? new Date(inviteData.expiresAt).toLocaleString() : '24 hours'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Accept Button */}
                    <button
                        onClick={handleAcceptInvite}
                        disabled={inviteState === 'accepting'}
                        className="w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-green-500/25 flex items-center justify-center gap-2 text-lg"
                    >
                        {inviteState === 'accepting' ? (
                            <>
                                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                                Accepting...
                            </>
                        ) : (
                            <>
                                <AppIcon name="check" className="h-6 w-6" />
                                Accept Invitation
                            </>
                        )}
                    </button>

                    {/* Additional Text */}
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm mt-4">
                        {state.isAuthenticated
                            ? 'Click the button above to join the team immediately'
                            : 'You will be asked to log in or create an account to accept this invitation'
                        }
                    </p>
                </div>
            </div>
        </div>
    );
}
