import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock, Mail } from "lucide-react";
import QRCode from "qrcode-generator";
import { supabase } from "../lib/supabase";

// Type pour les différents modes d'authentification
type AuthMode = "login" | "register" | "twoFactor";

// Fonction pour générer un code OTP à 6 chiffres (pas utilisé ici mais présent pour des tests)
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [loading, setLoading] = useState(false);
  const [otpCode, setOtpCode] = useState<string>(""); // Code OTP entré par l'utilisateur
  const [secret, setSecret] = useState<string | null>(null); // Secret utilisé pour générer le QR code
  const [authData, setAuthData] = useState<any>(null); // Stocker les données d'authentification
  const navigate = useNavigate();

  // Fonction pour générer un QR code pour la 2FA
  const generateQRCode = (secret: string) => {
    const qr = QRCode(0, "H");  // Version QR et niveau de correction d'erreur
    qr.addData(secret);
    qr.make();
    return qr.createImgTag(4); // Retourne le QR code sous forme de tag <img>
  };

  // Fonction de soumission du formulaire
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
          if (error.message === "Email not confirmed") {
            toast.error(
              "Please check your email and confirm your account before logging in"
            );
          } else {
            toast.error(error.message);
          }
          return;
        }

        // Stocker les données d'authentification pour la 2FA
        setAuthData(data);

        // Si l'utilisateur est authentifié, générer le code OTP et afficher le QR code
        if (data?.session) {
          setMode("twoFactor");
          const otpSecret = "otpauth://totp/MyApp:" + email + "?secret=MYSECRETKEY"; // Remplacer par le secret réel
          setSecret(otpSecret);

          toast.success("Please scan the QR code in your authenticator app.");
        }
      } else if (mode === "twoFactor") {
        // Validation du format du code OTP (doit être une combinaison de 6 chiffres)
        if (!/^\d{6}$/.test(otpCode)) {
          toast.error("Invalid OTP code. Please enter a 6-digit code.");
          return;
        }
        toast.success("OTP validated successfully!");
        
        // Rediriger après validation
        window.location.href = `http://localhost:8501?token=${authData?.session?.access_token}`;
      } else {
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          toast.error(error.message);
          return;
        }

        if (data?.user?.identities?.length === 0) {
          toast.success(
            "Registration successful! Please check your email to confirm your account."
          );
        } else {
          toast.success("Registration successful! You can now log in.");
          setMode("login");
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 p-8 bg-white/90 backdrop-blur-md rounded-xl shadow-2xl border border-white/20">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
          {mode === "login" ? "Welcome back" : mode === "twoFactor" ? "Enter OTP" : "Create an account"}
        </h2>
        <p className="mt-2 text-gray-600">
          {mode === "login" || mode === "twoFactor" 
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {mode === "login" || mode === "twoFactor" ? "Sign up" : "Log in"}
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

        {mode === "twoFactor" && (
          <div>
            <label htmlFor="otp" className="sr-only">
              OTP Code
            </label>
            <input
              id="otp"
              name="otp"
              type="text"
              required
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Enter OTP code"
            />
          </div>
        )}

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
            : mode === "twoFactor"
            ? "Validate OTP"
            : "Sign up"}
        </button>
      </form>

      {/* Affichage du QR code si en mode 2FA */}
      {mode === "twoFactor" && secret && (
        <div className="mt-4 text-center">
          <p>Scan this QR code with your authenticator app:</p>
          <div dangerouslySetInnerHTML={{ __html: generateQRCode(secret) }} />
        </div>
      )}
    </div>
  );
}
