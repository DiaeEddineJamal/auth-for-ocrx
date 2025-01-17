import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { authenticator } from "otplib";
import { QRCode } from "qrcode.react";


type AuthMode = "login" | "register";

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        // Obtenez les données utilisateur après la connexion
        const { data: userResponse, error: userError } = await supabase.auth.getUser();
        if (userError) {
          toast.error("Failed to fetch user data.");
          return;
        }

        const userId = userResponse?.user?.id;

        const { data: userMetadata, error: metadataError } = await supabase
          .from("users")
          .select("two_factor_enabled, two_factor_secret")
          .eq("id", userId)
          .single();

        if (metadataError) {
          toast.error("Failed to fetch user metadata.");
          return;
        }

        if (userMetadata?.two_factor_enabled) {
          setRequires2FA(true);
          setTwoFactorSecret(userMetadata.two_factor_secret);
          return;
        }

        toast.success("Logged in successfully!");
        navigate("/dashboard");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        toast.success("Registration successful! Check your email.");
        setMode("login");
      }
    } catch (error) {
      toast.error("An error occurred during authentication.");
    } finally {
      setLoading(false);
    }
  };

  const handle2FACodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFactorSecret && authenticator.check(twoFactorCode, twoFactorSecret)) {
      toast.success("2FA validated successfully!");
      navigate("/dashboard");
    } else {
      toast.error("Invalid 2FA code.");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="mt-2 text-gray-600">
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-4">
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
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Password"
                minLength={6}
              />
            </div>
          </div>
        </div>

        {mode === "login" && (
          <div className="text-right">
            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              Forgot your password?
            </Link>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Please wait..."
            : mode === "login"
            ? "Sign in"
            : "Sign up"}
        </button>
      </form>

      {requires2FA && twoFactorSecret && (
        <form onSubmit={handle2FACodeSubmit} className="mt-8 space-y-6">
          <div className="text-center">
            <QRCode value={twoFactorSecret} />
            <p className="mt-4">Scan the QR code in your 2FA app</p>
          </div>
          <div>
            <label htmlFor="twoFactorCode" className="sr-only">
              Enter 2FA code
            </label>
            <input
              id="twoFactorCode"
              name="twoFactorCode"
              type="text"
              value={twoFactorCode}
              onChange={(e) => setTwoFactorCode(e.target.value)}
              required
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter 2FA code"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Validate 2FA
          </button>
        </form>
      )}
    </div>
  );
}
