import { useState, type ChangeEvent, type FormEvent } from 'react'
import type { LoginPayload, LoginResponse } from '../../../shared/auth'
import Button from '../button/Button'
import Input from '../input/Input'

type LoginFormProps = {
  className?: string
}

type LoginFormState = LoginPayload

type SubmissionState = {
  tone: 'idle' | 'success' | 'error'
  message: string
}

const initialFormState: LoginFormState = {
  email: '',
  password: '',
  rememberMe: false,
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export default function LoginForm({ className }: LoginFormProps) {
  const [formState, setFormState] = useState<LoginFormState>(initialFormState)
  const [submissionState, setSubmissionState] = useState<SubmissionState>({
    tone: 'idle',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { checked, name, type, value } = event.target

    setFormState((currentState) => ({
      ...currentState,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmissionState({ tone: 'idle', message: '' })

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formState),
      })

      const data = (await response.json()) as Partial<LoginResponse> & {
        message?: string
      }

      if (!response.ok) {
        throw new Error(data.message ?? 'Login failed. Please try again.')
      }

      setSubmissionState({
        tone: 'success',
        message: data.message ?? 'Signed in successfully.',
      })
    } catch (error) {
      setSubmissionState({
        tone: 'error',
        message: error instanceof Error ? error.message : 'Login failed. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section
      className={[
        'w-full max-w-[27rem] rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_22px_60px_rgba(60,37,17,0.08)]',
        className ?? '',
      ].join(' ')}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#c46a32]">
        Welcome back
      </p>
      <h2 className="mt-4 text-4xl font-bold leading-tight text-stone-950">
        Sign in and continue your workflow.
      </h2>
      <p className="mt-4 text-base leading-7 text-stone-600">
        Access campaign reviews, approvals, and shared timelines from one secure workspace.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Button label="Continue with Google" variant="outline" fullWidth />
        <Button label="Use SSO" variant="secondary" fullWidth />
      </div>

      <div className="my-8 flex items-center gap-4 text-xs font-medium uppercase tracking-[0.28em] text-stone-400">
        <div className="h-px flex-1 bg-stone-200" />
        Or sign in with email
        <div className="h-px flex-1 bg-stone-200" />
      </div>

      <form className="space-y-5" aria-label="Login form" onSubmit={handleSubmit}>
        <Input
          autoComplete="email"
          disabled={isSubmitting}
          label="Email address"
          hint="Use the address attached to your workspace."
          name="email"
          onChange={handleInputChange}
          placeholder="you@northstar.co"
          required
          type="email"
          value={formState.email}
        />
        <Input
          autoComplete="current-password"
          disabled={isSubmitting}
          label="Password"
          name="password"
          onChange={handleInputChange}
          placeholder="Enter your password"
          required
          type="password"
          value={formState.password}
        />

        <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
          <label className="flex items-center gap-3">
            <input
              checked={formState.rememberMe}
              disabled={isSubmitting}
              name="rememberMe"
              onChange={handleInputChange}
              type="checkbox"
              className="h-4 w-4 rounded border-stone-300 text-[#c46a32] focus:ring-[#f6d5c2]"
            />
            Keep me signed in
          </label>
          <a href="#" className="font-semibold text-[#c46a32] hover:text-[#a94f1b]">
            Forgot password?
          </a>
        </div>

        {submissionState.tone !== 'idle' ? (
          <div
            className={[
              'rounded-2xl px-4 py-3 text-sm',
              submissionState.tone === 'success'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-rose-50 text-rose-700',
            ].join(' ')}
          >
            {submissionState.message}
          </div>
        ) : null}

        <Button
          disabled={isSubmitting}
          label={isSubmitting ? 'Signing in...' : 'Login to Northstar'}
          type="submit"
          fullWidth
        />
      </form>
    </section>
  )
}