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
    <div className="min-h-screen w-full flex flex-col md:flex-row relative overflow-hidden font-body bg-black">
      {/* Background Video */}
      <video 
        autoPlay 
        muted 
        loop 
        playsInline 
        className="fixed inset-0 w-full h-full object-cover z-0"
      >
        <source src="/background.mp4" type="video/mp4" />
      </video>
      
      {/* Dark Overlay */}
      <div className="fixed inset-0 bg-black/45 z-[1] pointer-events-none"></div>

      {/* Dynamic Background Elements - Pulse blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-pulse z-[2] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] bg-secondary/15 rounded-full blur-[100px] animate-pulse delay-700 z-[2] pointer-events-none"></div>
      
      {/* Content Container (Split Screen) */}
      <div className="relative z-10 flex flex-col md:flex-row w-full min-h-screen">
        
        {/* Left Section: Visual Showcase (View of the video/branding) */}
        <div className="flex-1 hidden md:flex flex-col justify-end p-16">
          <div className="max-w-xl">
            <h2 className="text-5xl font-headline font-bold text-white mb-4 leading-tight">
              Future of <span className="text-primary italic">Intelligence</span>
            </h2>
            <p className="text-white/60 text-lg font-light tracking-wide max-w-md">
              Harnessing advanced data structures and AI-powered vision to redefine fitness and fashion ergonomics.
            </p>
          </div>
        </div>

        {/* Right Section: Login Panel */}
        <div className="w-full md:w-[480px] lg:w-[540px] flex items-center justify-center p-6 md:p-12 md:bg-black/20 md:backdrop-blur-sm border-l border-white/5">
          <div className="w-full max-w-[440px] bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-10 md:p-12 transition-all duration-500 hover:bg-white/15">
            {/* Logo Section */}
            <div className="flex flex-col items-center mb-10">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-tertiary flex items-center justify-center mb-4 shadow-lg shadow-primary/30">
                <span className="material-symbols-outlined text-on-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>dataset</span>
              </div>
              <h1 className="text-3xl font-headline font-bold text-white tracking-tight">FitLoop</h1>
              <p className="text-[12px] uppercase tracking-[0.2em] text-white/50 font-bold mt-1">Premium Fitness Lab</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-white/60 uppercase tracking-wider block ml-1">Email Address</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors text-lg">alternate_email</span>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="hello@fitloop.app" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-12 text-[14px] text-white placeholder:text-white/20 outline-none transition-all focus:border-primary/50"
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-white/60 uppercase tracking-wider block ml-1">Password</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-primary transition-colors text-lg">lock</span>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pl-12 text-[14px] text-white placeholder:text-white/20 outline-none transition-all focus:border-primary/50"
                    required 
                  />
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-none bg-white/5 text-primary focus:ring-primary" />
                  <span className="text-[11px] text-white/40 group-hover:text-white/70 transition-colors">Remember Me</span>
                </label>
                <a href="#" className="text-[11px] text-primary font-bold hover:underline">Reset Access</a>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button 
                  type="submit" 
                  className="bg-primary text-white font-black tracking-widest py-3.5 px-6 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-[14px]"
                >
                  <span>Authenticate System</span>
                  <span className="material-symbols-outlined text-lg">verified_user</span>
                </button>
              </div>
            </form>

            <div className="mt-10 text-center pt-8 border-t border-white/5">
              <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold font-mono">Unauthorized access is monitored.</p>
              <div className="flex justify-center gap-4 mt-4 opacity-20 transition-opacity hover:opacity-50">
                <span className="text-[9px] font-bold text-white">SHA-256</span>
                <span className="text-[9px] font-bold text-white">TLS 1.3</span>
                <span className="text-[9px] font-bold text-white">AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
