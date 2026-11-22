import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../../firebase/firebase';
import { useAuth } from '../../context/AuthContext';
import { useProfile } from '../../context/ProfileContext';
import logoImg from '../../assets/logo.jpg';
import { Mail, Lock, Cpu, GraduationCap, Loader2, ShieldCheck, UserCheck, Shield } from 'lucide-react';

const Login = () => {
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' | 'verifier' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { loginStudent, loginVerifier, loginAdmin } = useAuth();
  const { refreshProfile } = useProfile();

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const response = await fetch(`http://${window.location.hostname}:5000/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, isRegister: false })
      });

      const data = await response.json();
      if (response.ok && data.token) {
        loginStudent(data.token, data.user || null);
        if (refreshProfile) await refreshProfile();
        navigate('/student');
      } else {
        setError(data.error || 'Authentication with backend failed');
      }
    } catch (err) {
      console.error('Google authentication failed:', err);
      setError('Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      if (selectedRole === 'student') {
        const response = await fetch(`http://${window.location.hostname}:5000/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });

        const data = await response.json();
        if (response.ok && data.token) {
          try {
            await signInWithEmailAndPassword(auth, cleanEmail, password);
          } catch (fbError) {
            console.warn('Firebase email sign-in fallback notice:', fbError);
          }
          loginStudent(data.token, data.user || null);
          if (refreshProfile) await refreshProfile();
          navigate('/student');
        } else {
          setError(data.error || 'Login failed. Please check your credentials.');
        }
      } else if (selectedRole === 'verifier') {
        const response = await fetch(`http://${window.location.hostname}:5000/api/verifier/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });

        const data = await response.json();
        if (response.ok && data.token) {
          const profile = {
            id: data.verifier?.id || 'verifier',
            name: data.verifier?.name || 'Verifier',
            role: data.verifier?.role === 'verifier' ? 'Identity Verifier' : (data.verifier?.role || 'Staff'),
            email: data.verifier?.email || cleanEmail,
            department: data.verifier?.department || 'Student Affairs',
            membershipDate: `Member since ${new Date().toLocaleDateString()}`,
            avgProcessingTime: '2.5 min',
            certificationLevel: 'Level 2 - Authorized',
            lastLogin: data.verifier?.lastLogin ? new Date(data.verifier.lastLogin).toLocaleString() : 'Just now',
            profilePicture: data.verifier?.profilePicture || null
          };
          loginVerifier(data.token, profile);
          navigate('/verifier');
        } else {
          setError(data.error || 'Invalid verifier credentials.');
        }
      } else if (selectedRole === 'admin') {
        if (!cleanEmail.endsWith('@ms.sab.ac.lk')) {
          setError('Access denied: Admin email must belong to @ms.sab.ac.lk domain.');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://${window.location.hostname}:5000/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail, password })
        });

        const data = await response.json();
        if (response.ok && data.token) {
          if (data.firebaseToken) {
            try {
              await signInWithCustomToken(auth, data.firebaseToken);
            } catch (fbErr) {
              console.warn('Admin custom token sign-in warning:', fbErr);
            }
          }
          loginAdmin(data.token, data.admin);
          navigate('/admin');
        } else {
          setError(data.error || 'Invalid admin credentials.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Unable to reach the backend server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#F3F6FF] p-6 font-sans text-[#1A1A1A]">
      <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-between gap-12">
        {/* LEFT SIDE: System Overview & Branding */}
        <div className="flex-1 space-y-8 max-w-xl hidden lg:block text-left">
          <BrandSection />
        </div>

        {/* RIGHT SIDE: Role Selector & Auth Card */}
        <div className="flex-1 w-full max-w-md mx-auto lg:mx-0">
          <div className="bg-white rounded-[32px] shadow-2xl shadow-slate-200 p-6 md:p-8 border border-white">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white p-0.5 shadow-sm border border-slate-100 flex items-center justify-center">
                <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-2xl font-bold text-left text-slate-900">Sign In</h2>
            </div>
            <p className="text-gray-400 text-left text-sm mt-1 mb-5">
              Select your role to access the identity system
            </p>

            {/* Role Switcher Pill Bar */}
            <div className="bg-[#F0F2F5] p-1.5 rounded-2xl flex gap-1 mb-5">
              <button
                type="button"
                onClick={() => { setSelectedRole('student'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'student'
                    ? 'bg-white shadow-sm text-[#800000]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <GraduationCap size={15} /> Student
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('verifier'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'verifier'
                    ? 'bg-white shadow-sm text-[#800000]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <UserCheck size={15} /> Verifier
              </button>
              <button
                type="button"
                onClick={() => { setSelectedRole('admin'); setError(''); }}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  selectedRole === 'admin'
                    ? 'bg-white shadow-sm text-[#800000]'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                <Shield size={15} /> Admin
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium p-3 rounded-xl mb-4 text-left">
                {error}
              </div>
            )}

            {/* Google Sign-in for Students only */}
            {selectedRole === 'student' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-4 rounded-xl border border-gray-200 shadow-xs transition-all duration-200 active:scale-[0.98] cursor-pointer mb-4 text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47c0,-0.32 -0.03,-0.64 -0.08,-0.9Z" fill="#4285F4" />
                    <path d="M12,20.6c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.57c-0.9,0.6 -2.07,0.97 -3.27,0.97c-2.33,0 -4.3,-1.57 -5,-3.69H3V15.7c1.48,2.94 4.5,4.9 8,4.9Z" fill="#34A853" />
                    <path d="M7,13.1c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.1H3V9.6C2.36,10.9 2,12.4 2,14c0,1.6 0.36,3.1 1,4.4L7,15.1c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7Z" fill="#FBBC05" />
                    <path d="M12,6.8c1.32,0 2.5,0.45 3.44,1.35l2.58,-2.58C16.46,4.09 14.43,3.4 12,3.4c-3.5,0 -6.52,1.96 -8,4.9L7,10.8c0.7,-2.12 2.67,-3.69 5,-3.69Z" fill="#EA4335" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center my-4">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-xs font-bold uppercase tracking-wider">or email</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>
              </>
            )}

            {/* Form */}
            <form className="space-y-4 text-left" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 ml-1">
                  {selectedRole === 'admin' ? 'Admin Email (@ms.sab.ac.lk)' : 'Email Address'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    placeholder={
                      selectedRole === 'admin'
                        ? 'admin@ms.sab.ac.lk'
                        : selectedRole === 'verifier'
                        ? 'verifier@ms.sab.ac.lk'
                        : 'student@example.com'
                    }
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#F3F6FF] border border-transparent rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#800000] focus:bg-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-700 ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#F3F6FF] border border-transparent rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#800000] focus:bg-white text-sm"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#800000] hover:bg-[#660000] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-sm"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading
                  ? 'Signing In...'
                  : selectedRole === 'admin'
                  ? 'Sign In to Admin Portal'
                  : selectedRole === 'verifier'
                  ? 'Sign In to Verifier Portal'
                  : 'Sign In to Student Portal'}
              </button>
            </form>

            {/* Links & Role-specific notices */}
            {selectedRole === 'student' ? (
              <p className="mt-5 text-xs text-gray-500">
                Don't have a student account?{' '}
                <Link to="/register" className="font-bold text-[#800000] hover:underline">
                  Register here
                </Link>
              </p>
            ) : (
              <p className="mt-5 text-xs text-gray-400">
                Authorized staff accounts only. All access is logged on blockchain audit trails.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BrandSection = () => (
  <>
    <div className="flex items-center gap-4">
      <div className="bg-white rounded-2xl shadow-lg shadow-red-200 overflow-hidden w-16 h-16 shrink-0 flex items-center justify-center p-1">
        <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
      </div>
      <div>
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900">University Blockchain Identity</h1>
        <p className="text-gray-500 font-medium text-sm text-left">Unified Portal: Student â€¢ Verifier â€¢ Administrator</p>
      </div>
    </div>

    <div className="space-y-6 pt-2">
      <div className="flex gap-4 items-start">
        <div className="bg-white p-3 rounded-xl shadow-xs text-red-700 shrink-0">
          <Cpu size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">AI-Powered Biometrics</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Real-time liveness detection and facial biometric match against government ID.
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="bg-white p-3 rounded-xl shadow-xs text-purple-600 shrink-0">
          <ShieldCheck size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Polygon Blockchain Security</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Tamper-proof identity verification credentials recorded immutably on-chain.
          </p>
        </div>
      </div>

      <div className="flex gap-4 items-start">
        <div className="bg-white p-3 rounded-xl shadow-xs text-blue-600 shrink-0">
          <GraduationCap size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Group 14 Capstone System</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Unified role-based workflow for students, verification staff, and university administrators.
          </p>
        </div>
      </div>
    </div>
  </>
);

export default Login;

