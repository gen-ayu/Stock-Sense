import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Lock, Mail, User, ShieldCheck, ArrowRight, KeyRound, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose?: () => void;
  defaultMode?: 'login' | 'signup' | 'forgot';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultMode = 'login' }) => {
  const { login, signup, resetPassword } = useInventory();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(defaultMode);

  // Login form state
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');

  // Signup form state
  const [signupLoginId, setSignupLoginId] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupRole, setSignupRole] = useState<'Inventory Manager' | 'Warehouse Staff'>('Inventory Manager');

  // Forgot password state
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpStep, setOtpStep] = useState(1); // 1 = enter id, 2 = enter otp & new pass
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [userOtp, setUserOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Error & success messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const res = login(loginId, password);
    if (!res.success) {
      setErrorMessage(res.message || 'Invalid Login Id or Password');
    } else {
      if (onClose) onClose();
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (signupPassword !== signupConfirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    const res = signup({
      loginId: signupLoginId,
      name: signupName,
      email: signupEmail,
      password: signupPassword,
      role: signupRole,
    });

    if (!res.success) {
      setErrorMessage(res.message || 'Signup failed');
    } else {
      setSuccessMessage('Account created successfully! Logging you in...');
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotIdentifier.trim()) {
      setErrorMessage('Please enter your Login ID or Email');
      return;
    }
    // Generate simulated 6-digit OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setOtpStep(2);
    setSuccessMessage(`Simulated OTP sent: ${mockOtp}`);
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (userOtp !== generatedOtp) {
      setErrorMessage('Invalid verification OTP code. Please enter the code shown above.');
      return;
    }
    const res = resetPassword(forgotIdentifier, newPassword);
    if (!res.success) {
      setErrorMessage(res.message || 'Password reset failed');
    } else {
      setSuccessMessage(res.message || 'Password successfully reset!');
      setTimeout(() => {
        setMode('login');
        setOtpStep(1);
        setErrorMessage('');
        setSuccessMessage('');
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 text-white text-center relative">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 mb-3 shadow-inner">
            <ShieldCheck className="w-6 h-6 text-teal-400" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">StockSense Portal</h2>
          <p className="text-xs text-slate-300 mt-1">Enterprise Inventory Access & Security</p>
        </div>

        {/* Content Tabs */}
        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Login Id</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. ayush.giri"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('forgot');
                  }}
                  className="text-teal-700 hover:text-teal-900 font-medium hover:underline cursor-pointer"
                >
                  Forget Password ?
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('signup');
                  }}
                  className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
                >
                  New here? <span className="text-teal-700 font-semibold underline">Sign Up</span>
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                <span>SIGN IN</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-500">
                  Demo Credentials: <span className="font-mono font-medium text-slate-700">ayush.giri</span> /{' '}
                  <span className="font-mono font-medium text-slate-700">Password@123</span>
                </p>
              </div>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                  Enter Login Id <span className="text-slate-400 font-normal">(6-12 chars, unique)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    minLength={6}
                    maxLength={12}
                    value={signupLoginId}
                    onChange={(e) => setSignupLoginId(e.target.value)}
                    placeholder="e.g. jdoe2026"
                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Full Name</label>
                <input
                  type="text"
                  required
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                  Enter Email Id <span className="text-slate-400 font-normal">(unique in system)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">
                    Enter Password <span className="text-slate-400 font-normal">(&gt;8 chars)</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Password@123"
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-0.5">Re-Enter Password</label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="Password@123"
                    className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-0.5">Operational Role</label>
                <select
                  value={signupRole}
                  onChange={(e) => setSignupRole(e.target.value as any)}
                  className="w-full px-3 py-1.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Inventory Manager">Inventory Manager</option>
                  <option value="Warehouse Staff">Warehouse Staff</option>
                </select>
              </div>

              <p className="text-[10px] text-slate-500 leading-tight">
                * Password must contain lowercase, uppercase, and special characters with length &gt; 8 characters.
              </p>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer mt-1"
              >
                CREATE ACCOUNT & SIGN IN
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('login');
                  }}
                  className="text-xs text-slate-600 hover:text-teal-700 font-medium cursor-pointer"
                >
                  Already have an account? <span className="font-semibold underline">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === 'forgot' && (
            <div className="space-y-4">
              {otpStep === 1 ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <p className="text-xs text-slate-600">
                    Enter your Login ID or registered Email Address to receive an OTP verification code.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Login ID / Email</label>
                    <input
                      type="text"
                      required
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      placeholder="ayush.giri or ayush.anand.giri@gmail.com"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <span>Send Verification Code</span>
                    <KeyRound className="w-4 h-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-3">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    <p className="font-semibold">Simulated OTP Delivery:</p>
                    <p className="font-mono text-base font-bold text-amber-900 mt-1">{generatedOtp}</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">Use this 6-digit code below to reset password.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={userOtp}
                      onChange={(e) => setUserOtp(e.target.value)}
                      placeholder="e.g. 123456"
                      className="w-full px-3 py-2 text-center text-lg tracking-widest font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Enter New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    Set New Password
                  </button>
                </form>
              )}

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setMode('login');
                    setOtpStep(1);
                  }}
                  className="text-xs text-slate-600 hover:text-teal-700 font-medium cursor-pointer"
                >
                  ← Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
