import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '../lib/supabase';

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false); // Nouveau state pour gérer l'envoi de l'OTP
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');

  // Fonction de gestion de l'envoi de l'OTP
  const handleOtpSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Envoi de l'OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setIsOtpSent(true);
      toast.success('OTP sent to your email!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fonction de gestion de la vérification de l'OTP
  const handleOtpVerify = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Vérification de l'OTP
      const { error } = await supabase.auth.verifyOtp({
        email: email,
        token: otp,
        type: 'email'
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success('OTP verified successfully!');
      // Ici, vous pouvez rediriger l'utilisateur vers la page de réinitialisation du mot de passe
      // Exemple :
      // window.location.href = '/reset-password';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          Forgot Password
        </h2>
        <p className="mt-2 text-gray-600">
          {isOtpSent
            ? 'Enter the OTP sent to your email to verify your identity.'
            : 'Enter your email address and we\'ll send you an OTP to reset your password.'}
        </p>
      </div>

      {!isOtpSent ? (
        // Formulaire pour envoyer l'OTP
        <form onSubmit={handleOtpSend} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Please wait...' : 'Send OTP'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium">
              Back to Login
            </Link>
          </div>
        </form>
      ) : (
        // Formulaire pour vérifier l'OTP
        <form onSubmit={handleOtpVerify} className="mt-8 space-y-6">
          <div>
            <label htmlFor="otp" className="sr-only">
              OTP
            </label>
            <div className="relative">
              <input
                id="otp"
                name="otp"
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter OTP"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP'}
            </button>
          </div>

          <div className="text-center">
            <Link to="/" className="text-blue-600 hover:text-blue-500 font-medium">
              Back to Login
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}
