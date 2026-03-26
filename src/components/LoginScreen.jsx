import { useState } from 'react';
import { signIn } from '../firebase';
import { dk } from '../constants';

const T = dk;
const font  = "'Inter','Segoe UI',sans-serif";
const serif = "'DM Serif Display',serif";

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Enter your email and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn(email.trim(), password);
      // onAuthStateChanged in App.jsx will handle the transition
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found'
        ? 'Incorrect email or password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many attempts. Try again in a few minutes.'
        : err.code === 'auth/invalid-email'
        ? 'Invalid email address.'
        : 'Sign in failed. Check your connection.';
      setError(msg);
      setLoading(false);
    }
  };

  const inp = {
    width: '100%', padding: '13px 16px',
    background: '#1a2130', border: '1px solid #2a3548',
    borderRadius: 6, color: '#e8eaf0',
    fontFamily: font, fontSize: 15, outline: 'none',
    transition: 'border-color .15s', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0b0e15',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: font, padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 400 }}>

        {/* Logo + branding */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56,
            background: '#3A7D44',
            clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <span style={{ color: '#fff', fontFamily: serif, fontSize: 20, fontWeight: 800 }}>HW</span>
          </div>
          <div style={{ fontFamily: serif, fontSize: 26, color: '#e8eaf0', marginBottom: 4 }}>
            HuronWest
          </div>
          <div style={{ fontSize: 12, color: '#8892a0', textTransform: 'uppercase', letterSpacing: '2px' }}>
            Facility Services · ERP
          </div>
        </div>

        {/* Login card */}
        <form onSubmit={handleSubmit} style={{
          background: '#161b24', border: '1px solid #222b3a',
          borderRadius: 8, padding: '32px 28px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#8892a0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 20 }}>
            Sign In to Your Account
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8892a0', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              style={inp}
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@huronwest.com"
              autoComplete="email"
              disabled={loading}
              onFocus={e => e.target.style.borderColor = '#3A7D44'}
              onBlur={e  => e.target.style.borderColor = '#2a3548'}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8892a0', marginBottom: 6 }}>Password</label>
            <input
              type="password"
              style={inp}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              onFocus={e => e.target.style.borderColor = '#3A7D44'}
              onBlur={e  => e.target.style.borderColor = '#2a3548'}
            />
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(224,82,82,0.1)', border: '1px solid rgba(224,82,82,0.3)',
              borderRadius: 5, padding: '10px 14px', marginBottom: 16,
              fontSize: 13, color: '#e05252',
            }}>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#2e6335' : '#3A7D44',
              color: '#fff', border: 'none', borderRadius: 6,
              fontSize: 14, fontWeight: 700, fontFamily: font,
              textTransform: 'uppercase', letterSpacing: '1px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.75 : 1,
              transition: 'background .15s, opacity .15s',
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: '#444e5e', lineHeight: 1.7 }}>
          HuronWest Facility Services ERP<br />
          Contact your administrator to manage accounts.
        </div>
      </div>
    </div>
  );
}
