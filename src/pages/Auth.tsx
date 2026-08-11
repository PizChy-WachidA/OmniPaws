import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, PawPrint, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Mode = 'login' | 'register';

const AuthPage = () => {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'owner' | 'provider'>('owner');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const redirected = useRef(false);

  useEffect(() => {
    if (!loading && user && !redirected.current) {
      redirected.current = true;
      if (user.role === 'provider') navigate('/provider/dashboard', { replace: true });
      else if (user.role === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        // navigation handled by useEffect above
      } else {
        await register(email, password, name, role);
        toast.success('Account created! Please check your email to verify.');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50/60 via-white to-emerald-50/30 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <PawPrint className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-extrabold text-foreground">
              Omni<span className="text-primary">Paws</span>
            </span>
          </a>
          <p className="text-muted-foreground mt-3 text-sm">
            {mode === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your free account today.'}
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-border shadow-xl p-8">
          {/* Mode Toggle */}
          <div className="flex rounded-xl border border-border p-1 mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                  mode === m ? 'bg-primary text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {m === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="pl-9 h-11 rounded-xl border-border"
                    required
                  />
                </div>
                <div className="flex rounded-xl border border-border p-1">
                  {(['owner', 'provider'] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                        role === r ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {r === 'owner' ? '🐾 Pet Owner' : '🩺 Service Provider'}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-9 h-11 rounded-xl border-border"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-9 pr-9 h-11 rounded-xl border-border"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/30 mt-2"
              disabled={submitting}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>

          {/* Demo note */}
          <div className="mt-6 p-4 bg-primary/5 rounded-xl text-xs text-muted-foreground text-center leading-relaxed">
            <strong className="text-foreground">Demo:</strong> Register with any email/password (min 6 chars).<br/>
            To test admin: set role = admin in Supabase profiles table.
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing you agree to our{' '}
          <a href="#" className="text-primary underline">Terms</a> and{' '}
          <a href="#" className="text-primary underline">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
