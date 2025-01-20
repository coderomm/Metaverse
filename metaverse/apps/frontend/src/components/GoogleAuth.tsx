// app/src/components/GoogleAuth.tsx
export const GoogleSignIn = () => {
    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="flex items-center gap-2 px-4 py-2 border rounded"
        >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" />
            Sign in with Google
        </button>
    );
};