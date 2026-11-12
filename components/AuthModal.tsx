'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Loader2 } from 'lucide-react';
import { signIn, signUp, signInWithProvider } from '@/lib/supabase/auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/lib/useTranslation';

interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, tokens: AuthTokens) => void;
  onGuestMode: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  onGuestMode: _onGuestMode,
  initialMode = 'login',
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
    }
  }, [initialMode, isOpen]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (password.length < 6) throw new Error(t('auth_error_password_min'));
      if (mode === 'register' && password !== confirmPassword) {
        throw new Error(t('shell_pw_mismatch'));
      }
      const username = (name.trim() || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, '-');
      const result =
        mode === 'register'
          ? await signUp({ email, password, name: name.trim() || username })
          : await signIn({ email, password });

      if (result.error) throw result.error;
      if (!result.data.session || !result.data.user) {
        setError(t('auth_error_confirm_email'));
        return;
      }

      onAuthSuccess(
        {
          id: result.data.user.id,
          email: result.data.user.email || email,
          displayName: result.data.user.user_metadata?.full_name || name || email.split('@')[0],
        },
        {
          accessToken: result.data.session.access_token,
          refreshToken: result.data.session.refresh_token,
        }
      );
      onClose();
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : t('auth_error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Aether</p>
          <DialogTitle>{mode === 'login' ? t('auth_login_title') : t('auth_register_title')}</DialogTitle>
          <DialogDescription>
            {mode === 'login' ? t('auth_login_desc') : t('auth_register_desc')}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label htmlFor="modal-name" className="mb-2 block text-sm font-medium">
                {t('auth_name')}
              </label>
              <input
                id="modal-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder={t('auth_name_placeholder')}
                required
              />
            </div>
          )}
          <div>
            <label htmlFor="modal-email" className="mb-2 block text-sm font-medium">
              {t('auth_email')}
            </label>
            <input
              id="modal-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder={t('auth_email_placeholder')}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="modal-password" className="mb-2 block text-sm font-medium">
              {t('auth_password')}
            </label>
            <input
              id="modal-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              placeholder={t('auth_password_placeholder')}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
              required
            />
          </div>
          {mode === 'register' && (
            <div>
              <label htmlFor="modal-confirm-password" className="mb-2 block text-sm font-medium">
                {t('shell_confirm_password')}
              </label>
              <input
                id="modal-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                placeholder={t('shell_repeat_password_placeholder')}
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-md border border-rose-500/30 bg-rose-500/5 p-3 text-sm text-rose-500"
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? t('auth_submitting') : mode === 'login' ? t('auth_login_submit') : t('auth_register_submit')}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t('login_or')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError('');
              try {
                const { data, error } = await signInWithProvider('google');
                if (error) throw error;
                if (data?.url) {
                  window.location.href = data.url;
                }
              } catch (oauthError) {
                setError(
                  oauthError instanceof Error
                    ? oauthError.message
                    : t('shell_google_error')
                );
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {t('shell_continue_google')}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="w-full text-center text-sm text-primary hover:underline"
          >
            {mode === 'login' ? t('auth_toggle_register') : t('auth_toggle_login')}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
