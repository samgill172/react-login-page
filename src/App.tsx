import { useState } from 'react'
import LoginForm from './components/loginform/LoginForm'
import RegistrationForm from './components/registrationform/RegistrationForm'

type AuthMode = 'register' | 'login'

function App() {
  const [authMode, setAuthMode] = useState<AuthMode>('register')

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f4efe7] px-4 py-6 text-stone-900 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-10rem] top-[-12rem] h-80 w-80 rounded-full bg-[#f97316]/18 blur-3xl sm:h-[28rem] sm:w-[28rem]" />
        <div className="absolute right-[-8rem] top-1/3 h-72 w-72 rounded-full bg-[#0f766e]/14 blur-3xl sm:h-[24rem] sm:w-[24rem]" />
        <div className="absolute bottom-[-8rem] left-1/3 h-72 w-72 rounded-full bg-[#facc15]/12 blur-3xl sm:h-[22rem] sm:w-[22rem]" />
      </div>

      <section className="relative mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-7xl overflow-hidden rounded-[2rem] border border-black/10 bg-[#fffaf3] shadow-[0_30px_90px_rgba(64,38,17,0.16)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative flex flex-col justify-between bg-[#1f1814] px-6 py-8 text-[#f8f1e7] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.22),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(45,212,191,0.16),transparent_28%)]" />

          <div className="relative flex items-center gap-3 text-sm font-medium uppercase tracking-[0.3em] text-[#f7d9c2]">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-white/8 text-lg tracking-normal text-white">
              N
            </div>
            Northstar
          </div>

          <div className="relative max-w-xl">
            <p className="inline-flex rounded-full border border-white/10 bg-white/7 px-4 py-2 text-xs font-medium uppercase tracking-[0.28em] text-[#f9c8a6]">
              Secure workspace access
            </p>
            <h1 className="mt-6 max-w-lg text-4xl font-bold leading-[1.02] text-white sm:text-5xl lg:text-6xl">
              Return to the dashboard that keeps the whole team aligned.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-[#dacfc3] sm:text-lg">
              Review launches, track approvals, and move from decision to delivery in a single calm workspace designed for fast-moving teams.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">14k+</p>
                <p className="mt-2 text-sm leading-6 text-[#d8ccc0]">weekly sign-ins across product, ops, and finance</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">9m</p>
                <p className="mt-2 text-sm leading-6 text-[#d8ccc0]">average time saved per approval cycle</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/7 p-5 backdrop-blur-sm">
                <p className="text-3xl font-bold text-white">99.9%</p>
                <p className="mt-2 text-sm leading-6 text-[#d8ccc0]">uptime backed by encrypted access controls</p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-between gap-4 rounded-[1.75rem] border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#f0c8aa]">Today&apos;s pulse</p>
              <p className="mt-2 text-xl font-semibold text-white">Campaign review board is ready for check-in.</p>
            </div>
            <div className="rounded-2xl bg-white px-4 py-3 text-center text-[#1f1814]">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Next sync</p>
              <p className="mt-1 text-lg font-bold">09:30</p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[#fffaf3] px-5 py-8 sm:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-5 inline-flex w-full rounded-full border border-stone-200 bg-white p-1 shadow-sm">
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={[
                  'flex-1 rounded-full px-4 py-3 text-sm font-semibold transition',
                  authMode === 'register'
                    ? 'bg-stone-950 text-white shadow-[0_14px_30px_rgba(28,25,23,0.18)]'
                    : 'text-stone-600 hover:text-stone-900',
                ].join(' ')}
              >
                Create account
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={[
                  'flex-1 rounded-full px-4 py-3 text-sm font-semibold transition',
                  authMode === 'login'
                    ? 'bg-stone-950 text-white shadow-[0_14px_30px_rgba(28,25,23,0.18)]'
                    : 'text-stone-600 hover:text-stone-900',
                ].join(' ')}
              >
                Log in
              </button>
            </div>

            {authMode === 'register' ? <RegistrationForm /> : <LoginForm />}
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
