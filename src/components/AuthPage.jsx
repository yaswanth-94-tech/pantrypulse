import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, ChefHat, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { signInUser, signUpUser, continueAsGuest } from '../services/auth';
import confetti from 'canvas-confetti';

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    if (mode === 'signup' && !name.trim()) {
      setError('Please enter your name.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      let user;
      if (mode === 'signin') {
        user = await signInUser(email, password);
      } else {
        user = await signUpUser(name, email, password);
      }

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });

      onAuthSuccess(user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const guest = await continueAsGuest();
      confetti({
        particleCount: 45,
        spread: 55,
        origin: { y: 0.6 }
      });
      onAuthSuccess(guest);
    } catch (err) {
      setError('Guest login failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      
      {/* Background Liquid Canvas */}
      <div className="liquid-bg-canvas">
        <div className="liquid-orb liquid-orb-1" />
        <div className="liquid-orb liquid-orb-2" />
        <div className="liquid-orb liquid-orb-3" />
      </div>

      {/* Main Glass Authentication Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        className="relative z-10 w-full max-w-md liquid-glass-modal rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        {/* Top Specular Highlight Edge */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-b from-white/20 to-white/5 p-[1px] shadow-lg shadow-emerald-500/15 mb-1">
            <div className="w-full h-full bg-slate-950/80 backdrop-blur-xl rounded-[15px] flex items-center justify-center border border-white/10">
              <Leaf className="w-6 h-6 text-emerald-400" />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Pantry<span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-500 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300">Pulse</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Zero-Waste Smart Kitchen & AI Meal Copilot
          </p>
        </div>

        {/* Segmented Mode Switcher */}
        <div className="p-1 rounded-2xl liquid-glass-segmented mb-6 flex">
          <button
            type="button"
            onClick={() => { setMode('signin'); setError(null); }}
            className={`relative flex-1 py-2 text-xs font-semibold rounded-xl transition-colors duration-200 ${
              mode === 'signin' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {mode === 'signin' && (
              <motion.div
                layoutId="authSegmentIndicator"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-b from-white to-slate-100 dark:from-white/15 dark:to-white/5 border border-slate-200 dark:border-white/20 shadow-md"
              />
            )}
            <span className="relative z-10">Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('signup'); setError(null); }}
            className={`relative flex-1 py-2 text-xs font-semibold rounded-xl transition-colors duration-200 ${
              mode === 'signup' ? 'text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {mode === 'signup' && (
              <motion.div
                layoutId="authSegmentIndicator"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                className="absolute inset-0 rounded-xl bg-gradient-to-b from-white to-slate-100 dark:from-white/15 dark:to-white/5 border border-slate-200 dark:border-white/20 shadow-md"
              />
            )}
            <span className="relative z-10">Create Account</span>
          </button>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name field (Sign Up only) */}
          <AnimatePresence>
            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    required={mode === 'signup'}
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="chef@kitchen.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl liquid-glass-input text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl liquid-glass-input text-xs placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Primary Action Submit Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold liquid-btn-primary text-white shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                {mode === 'signin' ? 'Sign In to Kitchen' : 'Create Account'}
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </motion.button>
        </form>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" />
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider">or</span>
          <div className="flex-1 h-[1px] bg-slate-200 dark:bg-white/10" />
        </div>

        {/* Instant Guest Mode CTA */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          type="button"
          disabled={loading}
          onClick={handleGuestLogin}
          className="w-full py-2.5 rounded-xl text-xs font-semibold liquid-btn-secondary text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
          Continue as Guest (Instant Demo)
        </motion.button>

        {/* Feature Badges Footer */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-white/[0.08] grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.05]">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Smart Vision</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Receipt & Shelf</p>
          </div>
          <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.05]">
            <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Zero-Waste</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Rescue Recipes</p>
          </div>
          <div className="p-2 rounded-xl bg-black/[0.02] dark:bg-white/[0.02] border border-black/[0.06] dark:border-white/[0.05]">
            <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400">Freshness Copilot</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Expiry Tracking</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
