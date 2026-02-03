
import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Stethoscope, Mail, Lock, User, ArrowRight, Loader2, AlertCircle, X } from 'lucide-react';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

const Auth: React.FC<AuthProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        onAuthSuccess(data.user);
        onClose();
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: name,
            },
          },
        });
        if (authError) throw authError;
        onAuthSuccess(data.user);
        onClose();
      }
    } catch (err: any) {
      console.error('❌ Auth Error:', err);
      setError(err.message || "Xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden relative animate-in zoom-in-95 duration-500">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-900"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-10 sm:p-12">
          <div className="flex items-center gap-3 mb-8 justify-center">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-teal-600/20">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="font-bold text-xl tracking-tight uppercase text-slate-800">Stom AI</span>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {isLogin ? 'Xoş Gəlmisiniz' : 'Hesab Yaradın'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mt-1">
              {isLogin ? 'Davam etmək üçün daxil olun' : 'Klinikamıza üzv olun'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-medium animate-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Ad və Soyad"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/10 focus:bg-white focus:border-teal-500 transition-all"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="email"
                placeholder="E-poçt ünvanı"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/10 focus:bg-white focus:border-teal-500 transition-all"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input
                type="password"
                placeholder="Şifrə"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500/10 focus:bg-white focus:border-teal-500 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/10 hover:bg-slate-800 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? 'Daxil Ol' : 'Qeydiyyatdan Keç'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-bold text-slate-400 hover:text-teal-600 transition-colors"
            >
              {isLogin ? 'Hesabınız yoxdur? Qeydiyyat' : 'Artıq hesabınız var? Giriş'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
