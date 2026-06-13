import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate a brief network delay
    await new Promise((r) => setTimeout(r, 600));

    const success = login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md bg-white rounded-xl shadow-lg p-8"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl font-bold text-[#1B2A4A]">
            LOGIX
          </h1>
          <p className="text-sm tracking-[0.3em] text-[#E8672C] font-medium mt-1">
            CONTROL TOTAL
          </p>
          <p className="text-[#6B7A99] text-sm mt-3">
            Sistema de Control Logístico Integral
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-[#1B2A4A] mb-1.5"
            >
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-[#6B7A99]" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ingrese su usuario"
                className="w-full pl-10 pr-4 py-2.5 border border-[#E2E6EF] rounded-lg text-sm text-[#1B2A4A] placeholder-[#6B7A99]/50 focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30 focus:border-[#E8672C] transition-colors"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1B2A4A] mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-[#6B7A99]" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingrese su contraseña"
                className="w-full pl-10 pr-10 py-2.5 border border-[#E2E6EF] rounded-lg text-sm text-[#1B2A4A] placeholder-[#6B7A99]/50 focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30 focus:border-[#E8672C] transition-colors"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#6B7A99] hover:text-[#1B2A4A] transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8672C] hover:bg-[#d45a22] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg py-3 font-semibold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Ingresando...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 pt-5 border-t border-[#E2E6EF]">
          <p className="text-xs text-[#6B7A99] text-center mb-2">
            Usuarios de demostración
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-[#6B7A99]">
            <div className="bg-[#F7F8FA] rounded-md px-2.5 py-1.5">
              <span className="font-medium text-[#1B2A4A]">admin</span> / admin123
            </div>
            <div className="bg-[#F7F8FA] rounded-md px-2.5 py-1.5">
              <span className="font-medium text-[#1B2A4A]">supervisor</span> / sup123
            </div>
            <div className="bg-[#F7F8FA] rounded-md px-2.5 py-1.5">
              <span className="font-medium text-[#1B2A4A]">bodeguero</span> / bod123
            </div>
            <div className="bg-[#F7F8FA] rounded-md px-2.5 py-1.5">
              <span className="font-medium text-[#1B2A4A]">consulta</span> / con123
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
