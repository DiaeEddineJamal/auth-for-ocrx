import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthForm } from './components/AuthForm';
import { ForgotPassword } from './components/ForgotPassword';
import { ResetPassword } from './components/ResetPassword';

function App() {
  return (
    <BrowserRouter>
      <div className="relative min-h-screen overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute inset-0 bg-black/40 z-10" />
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source 
              src="./src/vids/bgvid.mp4" 
              type="video/mp4" 
            />
          </video>
        </div>

        {/* Content */}
        <div className="relative z-20 min-h-screen flex flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
          {/* Title */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-2 tracking-tight">
              Luziv OCR
            </h1>
            <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full" />
          </div>

          {/* Auth Form Container */}
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <Routes>
              <Route path="/" element={<AuthForm />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Routes>
          </div>
        </div>
      </div>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;