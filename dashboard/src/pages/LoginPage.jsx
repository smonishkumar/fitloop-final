import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple mock login
    login({ name: 'Alex Rivera', role: 'Lead Data Scientist', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDysVj_9v_RR3uqelJ60d91icVlkBHnWNT0A_cTQWd_0Xv6boyx6dccR_9QaH97I5P8sifzyiMv8B8eJRz-vuayOwjXi5DCF2JxqrgAu0vu0hUW5J0bvQ-ZM-b4s3_ImNMNoxrQZTOf4Cx0Sq-2xEA3qSEffzFcVvrX71lIIS_MjUQdTTMFeuxnSoS6oH46BHGwpCOhXDPjYvqFIeLl8mB3WJ3JRGtg6374wo4j45JihpnSv09okvEZjXxszYvBjsepXMQe_aV9sA' });
    navigate('/');
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center relative overflow-hidden font-body">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/15 rounded-full blur-[100px] animate-pulse delay-700"></div>
      
      <div className="w-full max-w-[460px] px-6 relative z-10 mx-auto">
        <div className="glass-card p-12 backdrop-blur-[32px] border-outline-variant/20 shadow-premium">
          {/* Logo Section */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary to-primary-dim flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
              <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
            </div>
            <h1 className="text-3xl font-headline font-bold bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent tracking-tight">FitLoop</h1>
            <p className="text-[12px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mt-1">Intelligence Division</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider block ml-1">Access Identity</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">alternate_email</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@intelligence.hub" 
                  className="input-standard !pl-12 text-[14px]"
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-on-surface-variant uppercase tracking-wider block ml-1">Security Key</label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors text-lg">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••" 
                  className="input-standard !pl-12 text-[14px]"
                  required 
                />
              </div>
            </div>

            <div className="flex items-center justify-center px-1">
              <p className="text-[12px] text-on-surface-variant/60 italic text-center">Secure session initialization required for each access</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button 
                type="submit" 
                className="btn-primary w-full !text-[14px] font-black tracking-widest"
              >
                <span>Authenticate System</span>
                <span className="material-symbols-outlined text-lg">verified_user</span>
              </button>
            </div>
          </form>

          <div className="mt-10 text-center pt-8 border-t border-outline-variant/10">
            <p className="text-[12px] text-on-surface-variant uppercase tracking-widest font-bold">Unauthorized access is monitored.</p>
            <div className="flex justify-center gap-4 mt-4 opacity-40">
              <span className="text-[11px] font-bold">SHA-256</span>
              <span className="text-[11px] font-bold">TLS 1.3</span>
              <span className="text-[11px] font-bold">AES-256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
