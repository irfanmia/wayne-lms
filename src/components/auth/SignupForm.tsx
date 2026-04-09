'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { signIn } from 'next-auth/react';

export default function SignupForm() {
  const { t } = useI18n();
  const { register, loginDemo } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!firstName.trim()) errors.firstName = 'First name is required';
    if (!lastName.trim()) errors.lastName = 'Last name is required';
    if (!username.trim()) errors.username = 'Username is required';
    if (!email.trim()) errors.email = 'Email is required';
    if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) errors.password = 'Password must contain at least one uppercase letter and one number';
    if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    setSubmitting(true);
    try {
      await register(username, email, password);
      router.push(redirect);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed';
      if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
        setError('Cannot connect to server. Try Demo Mode below.');
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = () => {
    loginDemo();
    router.push(redirect);
  };

  const inputClass = (field: string) =>
    `w-full bg-white border ${fieldErrors[field] ? 'border-red-300' : 'border-gray-300'} rounded-lg px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 transition-colors`;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">M</div>
        <h1 className="text-3xl font-medium text-gray-900 font-heading">{t('signup.createAccount')}</h1>
        <p className="text-gray-500 mt-1">{t('signup.subtitle')}</p>
      </div>
      <div className="space-y-3 mb-6">
        <button
          onClick={() => signIn('github', { callbackUrl: redirect })}
          className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white rounded-lg py-3 hover:bg-gray-800 transition-colors font-medium"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          {t('signup.signupGithub')}
        </button>
        <button className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 rounded-lg py-3 text-gray-700 hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          {t('signup.signupGoogle')}
        </button>
      </div>
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">{t('signup.or')}</span></div>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
      )}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1.5 font-medium">First Name</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="John" className={inputClass('firstName')} />
            {fieldErrors.firstName && <p className="text-red-500 text-xs mt-1">{fieldErrors.firstName}</p>}
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1.5 font-medium">Last Name</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className={inputClass('lastName')} />
            {fieldErrors.lastName && <p className="text-red-500 text-xs mt-1">{fieldErrors.lastName}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1.5 font-medium">{t('signup.username')}</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder={t('signup.usernamePlaceholder')} className={inputClass('username')} />
          {fieldErrors.username && <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1.5 font-medium">{t('signup.email')}</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('signup.emailPlaceholder')} className={inputClass('email')} />
          {fieldErrors.email && <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1.5 font-medium">{t('signup.password')}</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t('signup.passwordPlaceholder')} className={inputClass('password')} />
          {fieldErrors.password && <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>}
        </div>
        <div>
          <label className="block text-sm text-gray-700 mb-1.5 font-medium">Confirm Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className={inputClass('confirmPassword')} />
          {fieldErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{fieldErrors.confirmPassword}</p>}
        </div>
        <Button className="w-full" size="lg" disabled={submitting}>{submitting ? 'Creating account...' : t('signup.createBtn')}</Button>
      </form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-400">or</span></div>
      </div>
      <button
        onClick={handleDemo}
        className="w-full flex items-center justify-center gap-2 bg-amber-50 border border-amber-200 rounded-lg py-3 text-amber-700 hover:bg-amber-100 transition-colors text-sm font-medium"
      >
        <span>🎮</span> Try as Demo User
      </button>
      <p className="text-center text-gray-400 text-sm mt-6">
        {t('signup.haveAccount')} <Link href={`/login${redirect !== '/dashboard' ? `?redirect=${encodeURIComponent(redirect)}` : ''}`} className="text-orange-600 hover:text-orange-700 font-medium">{t('signup.logIn')}</Link>
      </p>
    </div>
  );
}
