import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sprout, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../auth/useAuth';

const MESSAGES = {
  'account-exists': 'हे ईमेल आधीच नोंदणीकृत आहे. / This email is already registered.',
  'account-missing': 'या ईमेलचे खाते सापडले नाही. / No account found for that email.',
  'password-wrong': 'पासवर्ड चुकीचा आहे. / Incorrect password.',
  'password-short': 'पासवर्ड कमीत कमी ६ अक्षरी असावा. / Password must be at least 6 characters.',
  'email-invalid': 'कृपया वैध ईमेल टाका. / Enter a valid email address.',
  'name-required': 'कृपया नाव टाका. / Please enter your name.',
  mismatch: 'पासवर्ड जुळत नाहीत. / Passwords do not match.',
  'insecure-context':
    'सुरक्षित संदर्भ आवश्यक आहे (https किंवा localhost). / Needs HTTPS or localhost.',
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, hasAccounts } = useAuth();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (field) => (event) => setForm((f) => ({ ...f, [field]: event.target.value }));

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    if (mode === 'signup' && form.password !== form.confirm) {
      setError(MESSAGES.mismatch);
      return;
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        await signup({ name: form.name, email: form.email, password: form.password });
      } else {
        await login({ email: form.email, password: form.password });
      }
      const back = location.state?.from;
      navigate(typeof back === 'string' && back !== '/login' ? back : '/', { replace: true });
    } catch (err) {
      setError(MESSAGES[err.message] || 'काहीतरी चूक झाली. / Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.75rem 0.7rem 2.4rem',
    borderRadius: '10px',
    border: '1px solid #B0BEC5',
    fontSize: '0.92rem',
    fontFamily: 'inherit',
    color: '#263238',
    background: '#fff',
    outline: 'none',
  };
  const iconStyle = { position: 'absolute', left: '0.7rem', top: '50%', transform: 'translateY(-50%)', color: '#78909C' };
  const field = { position: 'relative', marginBottom: '0.85rem' };

  return (
    <div className="auth-screen">
      <style>{`
        .auth-screen {
          min-height: 100vh; display: flex; align-items: center; justify-content: center;
          padding: 1.5rem 1rem; box-sizing: border-box;
          background: linear-gradient(160deg, #E8F5E9 0%, #F1F8E9 45%, #FFF8E1 100%);
          font-family: 'Mukta', system-ui, sans-serif;
        }
        .auth-card {
          width: 100%; max-width: 420px; background: #fff; border-radius: 18px;
          padding: 1.75rem 1.5rem 1.5rem; box-shadow: 0 12px 32px rgba(27, 94, 32, 0.14);
        }
        .auth-brand { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 1.25rem; }
        .auth-brand-mark {
          width: 46px; height: 46px; border-radius: 13px; display: grid; place-items: center;
          background: #1B5E20; color: #fff; flex-shrink: 0;
        }
        .auth-title { font-size: 1.2rem; font-weight: 700; color: #1B5E20; line-height: 1.2; margin: 0; }
        .auth-sub { margin: 0.15rem 0 0; font-size: 0.78rem; color: #607D8B; }
        .auth-tabs { display: flex; gap: 0.4rem; background: #ECEFF1; padding: 0.3rem; border-radius: 10px; margin-bottom: 1.1rem; }
        .auth-tab {
          flex: 1; border: none; background: transparent; padding: 0.5rem 0.4rem;
          border-radius: 8px; font-size: 0.82rem; font-weight: 600; color: #546E7A;
          cursor: pointer; font-family: inherit; line-height: 1.25;
        }
        .auth-tab.is-active { background: #fff; color: #1B5E20; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
        .auth-label { display: block; font-size: 0.75rem; font-weight: 600; color: #455A64; margin-bottom: 0.25rem; }
        .auth-error {
          background: #FFEBEE; color: #B71C1C; border: 1px solid #FFCDD2; border-radius: 9px;
          padding: 0.55rem 0.65rem; font-size: 0.78rem; margin-bottom: 0.85rem; line-height: 1.4;
        }
        .auth-submit {
          width: 100%; border: none; border-radius: 10px; padding: 0.75rem;
          background: #1B5E20; color: #fff; font-size: 0.95rem; font-weight: 700;
          font-family: inherit; cursor: pointer; margin-top: 0.35rem;
        }
        .auth-submit:disabled { background: #90A4AE; cursor: not-allowed; }
        .auth-note {
          margin-top: 1rem; font-size: 0.72rem; color: #78909C; line-height: 1.5;
          border-top: 1px solid #ECEFF1; padding-top: 0.75rem;
        }
      `}</style>

      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-mark">
            <Sprout size={26} />
          </div>
          <div>
            <h1 className="auth-title">पीक मित्र · Peek Mitra</h1>
            <p className="auth-sub">शेतकरी सल्ला व पीक निवड / Farm advisory &amp; crop choice</p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'login'}
            className={`auth-tab${mode === 'login' ? ' is-active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            साइन इन
            <br />
            Sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab${mode === 'signup' ? ' is-active' : ''}`}
            onClick={() => { setMode('signup'); setError(''); }}
          >
            नवीन खाते
            <br />
            Create account
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={submit} noValidate>
          {mode === 'signup' && (
            <div style={field}>
              <label className="auth-label" htmlFor="auth-name">नाव / Name</label>
              <User size={17} style={iconStyle} />
              <input
                id="auth-name"
                style={inputStyle}
                value={form.name}
                onChange={update('name')}
                autoComplete="name"
                placeholder="Prathamesh"
              />
            </div>
          )}

          <div style={field}>
            <label className="auth-label" htmlFor="auth-email">ईमेल / Email</label>
            <Mail size={17} style={iconStyle} />
            <input
              id="auth-email"
              type="email"
              style={inputStyle}
              value={form.email}
              onChange={update('email')}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </div>

          <div style={field}>
            <label className="auth-label" htmlFor="auth-password">पासवर्ड / Password</label>
            <Lock size={17} style={iconStyle} />
            <input
              id="auth-password"
              type="password"
              style={inputStyle}
              value={form.password}
              onChange={update('password')}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              placeholder="••••••"
            />
          </div>

          {mode === 'signup' && (
            <div style={field}>
              <label className="auth-label" htmlFor="auth-confirm">पासवर्ड पुन्हा / Confirm password</label>
              <Lock size={17} style={iconStyle} />
              <input
                id="auth-confirm"
                type="password"
                style={inputStyle}
                value={form.confirm}
                onChange={update('confirm')}
                autoComplete="new-password"
                placeholder="••••••"
              />
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={busy}>
            {busy
              ? 'थांबा… / Please wait…'
              : mode === 'signup'
                ? 'खाते तयार करा / Create account'
                : 'साइन इन / Sign in'}
          </button>
        </form>

        <p className="auth-note">
          {hasAccounts
            ? 'खाती या डिव्हाइसवर स्थानिकरित्या साठवली जातात आणि पासवर्ड PBKDF2 ने हॅश केला जातो. / Accounts are stored on this device; passwords are hashed with PBKDF2.'
            : 'पहिल्यांदा वापरत आहात? “नवीन खाते” निवडून खाते तयार करा. / First time here? Choose “Create account”.'}
        </p>
      </div>
    </div>
  );
}
