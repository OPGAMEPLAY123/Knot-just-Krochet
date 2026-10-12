import React from 'react';
import { ArrowLeft, Sparkles, ShieldCheck, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginPageProps {
  navigate: (path: string) => void;
  redirectTo?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({ navigate, redirectTo = '/account' }) => {
  const { user, signInWithGoogle, loading, authError, clearAuthError } = useAuth();

  const handleSignIn = async () => {
    clearAuthError();
    try {
      await signInWithGoogle();
      navigate(redirectTo);
    } catch {
      // error is handled in context
    }
  };

  if (user) {
    navigate(redirectTo);
    return null;
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-[#FFFDF9] rounded-3xl p-8 sm:p-10 border border-[#EFE8DE] shadow-md space-y-6 text-center">
        {/* Brand Icon */}
        <div className="w-16 h-16 rounded-full bg-[#F7D6D8]/60 border border-[#E8A598]/40 flex items-center justify-center mx-auto text-3xl shadow-xs">
          🧶
        </div>

        {/* Brand Header */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold tracking-widest text-[#8B5E3C] uppercase">
            Welcome to
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#3D2C28]">
            Knot Just Krochet
          </h1>
          <p className="text-xs text-[#7A6158] max-w-xs mx-auto leading-relaxed">
            Sign in with your Google account to track orders, manage delivery addresses, and submit bespoke custom commissions.
          </p>
        </div>

        {authError && (
          <div className="p-3.5 bg-red-50 text-red-800 border border-red-200 rounded-2xl text-xs text-left">
            <p className="font-semibold mb-0.5">Authentication Notice</p>
            <p>{authError}</p>
          </div>
        )}

        {/* Google Sign In Button */}
        <div className="pt-2">
          <button
            onClick={handleSignIn}
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-full bg-[#3D2C28] hover:bg-[#2A1E1B] text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
              />
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#FBBC05"
                d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"
              />
              <path
                fill="#34A853"
                d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
              />
            </svg>
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </button>
        </div>

        {/* Reassurances */}
        <div className="pt-4 border-t border-[#F4EFEA] space-y-2 text-[11px] text-[#8B6B61] text-left">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
            <span>Fast, safe 1-click login — no passwords needed</span>
          </div>
          <div className="flex items-center gap-2">
            <Heart className="w-3.5 h-3.5 text-[#E8A598] shrink-0" />
            <span>Direct access to past orders & custom commissions</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C] shrink-0" />
            <span>Verified handmade shopping experience</span>
          </div>
        </div>

        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs text-[#8B5E3C] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Store
          </button>
        </div>
      </div>
    </div>
  );
};
