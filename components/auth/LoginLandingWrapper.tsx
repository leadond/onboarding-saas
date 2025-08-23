'use client'

import React from 'react'
import { LoginForm } from './login-form'
import { AppLogo } from '@/components/branding/app-logo'

export function LoginLandingWrapper() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        body { font-family: 'Poppins', sans-serif; margin: 0; }
        .hero-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
          position: relative;
          overflow: hidden;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .hero-bg::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E") repeat;
          z-index: 0;
        }
        header {
          position: relative;
          z-index: 20;
          padding: 1.5rem 1.5rem;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: white;
        }
        .logo-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .logo-icon {
          width: 3rem;
          height: 3rem;
          background: linear-gradient(to bottom right, #06b6d4, #3b82f6);
          border-radius: 0.75rem;
          display: flex;
          justify-content: center;
          align-items: center;
          box-shadow: 0 10px 15px rgba(6, 182, 212, 0.5);
        }
        .logo-icon svg {
          width: 1.75rem;
          height: 1.75rem;
          color: white;
        }
        nav a, nav button {
          color: rgba(255,255,255,0.8);
          margin-left: 2rem;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          font-size: 1rem;
          transition: color 0.3s ease;
        }
        nav a:hover, nav button:hover {
          color: white;
        }
        main {
          position: relative;
          z-index: 10;
          max-width: 1280px;
          margin: 2rem auto;
          padding: 0 1.5rem;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3rem;
          align-items: start;
          color: white;
          min-height: calc(100vh - 6rem);
        }
        .left-content {
          grid-column: span 3;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }
        .slide-in {
          animation: slideIn 0.8s ease-out forwards;
          opacity: 0;
          transform: translateX(-50px);
        }
        @keyframes slideIn {
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .fade-in {
          animation: fadeIn 1s ease-out forwards;
          opacity: 0;
        }
        @keyframes fadeIn {
          to { opacity: 1; }
        }
        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
        }
        .metric-card {
          background: linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(6, 182, 212, 0.2);
          border-radius: 1.25rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
        }
        .metric-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(6, 182, 212, 0.2);
        }
        .glow-effect {
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
        }
        .right-content {
          grid-column: span 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 1.5rem;
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.3);
          padding: 2rem;
          width: 100%;
          max-width: 28rem;
          color: #1e293b;
        }
        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        .login-header svg {
          width: 2rem;
          height: 2rem;
          color: white;
          background: linear-gradient(to bottom right, #06b6d4, #3b82f6);
          border-radius: 0.5rem;
          padding: 0.25rem;
          margin: 0 auto 0.5rem;
          display: block;
        }
        .login-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }
        .login-header p {
          color: #64748b;
          font-size: 0.875rem;
        }
      `}</style>

      <div className="hero-bg">
        <header>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/20">
            <AppLogo size="4xl" className="text-white drop-shadow-2xl" />
          </div>
          <nav>
            <a href="#solutions">Solutions</a>
            <a href="#enterprise">Enterprise</a>
            <a href="#resources">Resources</a>
            <button>Book Demo</button>
          </nav>
        </header>

        <main>
          <section className="left-content">
            <div className="slide-in">
              <div style={{ display: 'inline-flex', alignItems: 'center', padding: '0.5rem 1rem', borderRadius: '9999px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#06b6d4', fontWeight: '500', fontSize: '0.875rem' }}>
                <div style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#22c55e', borderRadius: '9999px', marginRight: '0.75rem', animation: 'pulse 2s infinite' }} />
                Trusted by 2,500+ Enterprise Companies
              </div>
              <h1 style={{ fontSize: '3.75rem', fontWeight: '700', lineHeight: 1.1, marginTop: '1rem', marginBottom: '1rem' }}>
                End Client<br />
                <span style={{ background: 'linear-gradient(to right, #06b6d4, #3b82f6, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Onboarding
                </span><br />
                Chaos
              </h1>
              <p style={{ fontSize: '1.25rem', color: '#94a3b8', maxWidth: '32rem' }}>
                The average enterprise loses $2.4M annually to inefficient onboarding. Our AI automation platform eliminates manual bottlenecks and creates seamless client journeys that convert 3x faster.
              </p>
            </div>

            {/* Additional content like Industry Pain Points and Solution Benefits can be added here similarly */}
          </section>

          <section className="right-content">
            <div className="login-card">
              <div className="login-header">
                <svg fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h2>Access Your Dashboard</h2>
                <p>Continue optimizing your client onboarding</p>
              </div>
              <LoginForm />
            </div>
          </section>
        </main>
      </div>
    </>
  )
}