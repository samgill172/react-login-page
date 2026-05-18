import { useState, type ChangeEvent, type FormEvent } from 'react'
import Button from '../button/Button'
import Input from '../input/Input'
import {
  MIN_PASSWORD_LENGTH,
  type RegistrationPayload,
  type RegistrationResponse,
} from '../../../shared/auth'

type RegistrationFormState = RegistrationPayload & {
  confirmPassword: string
}

type SubmissionState = {
  tone: 'idle' | 'success' | 'error'
  message: string
}

const initialFormState: RegistrationFormState = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptedTerms: false,
  marketingOptIn: false,
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? ''

export default function RegistrationForm() {
  const [formState, setFormState] = useState<RegistrationFormState>(initialFormState)
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

    if (formState.password !== formState.confirmPassword) {
      setSubmissionState({
        tone: 'error',
        message: 'Passwords must match before you can create the account.',
      })
      return
    }

    if (!formState.acceptedTerms) {
      setSubmissionState({
        tone: 'error',
        message: 'You must accept the terms to create an account.',
      })
      return
    }

    setIsSubmitting(true)
    setSubmissionState({ tone: 'idle', message: '' })

    try {
      const payload: RegistrationPayload = {
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        password: formState.password,
        acceptedTerms: formState.acceptedTerms,
        marketingOptIn: formState.marketingOptIn,
      }

      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = (await response.json()) as Partial<RegistrationResponse> & {
        message?: string
      }

      if (!response.ok) {
        throw new Error(data.message ?? 'Registration failed. Please try again.')
      }

      setSubmissionState({
        tone: 'success',
        message: data.message ?? 'Account created. Check your inbox to verify your email.',
      })
      setFormState(initialFormState)
    } catch (error) {
      setSubmissionState({
        tone: 'error',
        message:
          error instanceof Error ? error.message : 'Registration failed. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="w-full max-w-[27rem] rounded-[2rem] border border-stone-200 bg-white p-8 shadow-[0_22px_60px_rgba(60,37,17,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#c46a32]">
        New account
      </p>
      <h2 className="mt-4 text-4xl font-bold leading-tight text-stone-950">
        Create your workspace access in one step.
      </h2>
      <p className="mt-4 text-base leading-7 text-stone-600">
        Start with your team profile now. Email verification and secure sign-in continue after registration.
      </p>

      <form className="mt-8 space-y-5" aria-label="Registration form" onSubmit={handleSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            autoComplete="given-name"
            disabled={isSubmitting}
            label="First name"
            maxLength={100}
            name="firstName"
            onChange={handleInputChange}
            placeholder="Sam"
            required
            value={formState.firstName}
          />
          <Input
            autoComplete="family-name"
            disabled={isSubmitting}
            label="Last name"
            maxLength={100}
            name="lastName"
            onChange={handleInputChange}
            placeholder="Garcia"
            required
            value={formState.lastName}
          />
        </div>

        <Input
          autoComplete="email"
          disabled={isSubmitting}
          hint="We will use this for sign-in and email verification."
          label="Email address"
          name="email"
          onChange={handleInputChange}
          placeholder="you@northstar.co"
          required
          type="email"
          value={formState.email}
        />

        <Input
          autoComplete="new-password"
          disabled={isSubmitting}
          hint={`Use at least ${MIN_PASSWORD_LENGTH} characters.`}
          label="Password"
          minLength={MIN_PASSWORD_LENGTH}
          name="password"
          onChange={handleInputChange}
          placeholder="Create a password"
          required
          type="password"
          value={formState.password}
        />

        <Input
          autoComplete="new-password"
          disabled={isSubmitting}
          label="Confirm password"
          minLength={MIN_PASSWORD_LENGTH}
          name="confirmPassword"
          onChange={handleInputChange}
          placeholder="Re-enter your password"
          required
          type="password"
          value={formState.confirmPassword}
        />

        <div className="space-y-3 rounded-3xl border border-stone-200 bg-[#fcfaf7] p-4 text-sm text-stone-600">
          <label className="flex items-start gap-3">
            <input
              checked={formState.acceptedTerms}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#c46a32] focus:ring-[#f6d5c2]"
              disabled={isSubmitting}
              name="acceptedTerms"
              onChange={handleInputChange}
              required
              type="checkbox"
            />
            I agree to the terms of service and privacy policy.
          </label>

          <label className="flex items-start gap-3">
            <input
              checked={formState.marketingOptIn}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[#c46a32] focus:ring-[#f6d5c2]"
              disabled={isSubmitting}
              name="marketingOptIn"
              onChange={handleInputChange}
              type="checkbox"
            />
            Send me release notes and occasional product updates.
          </label>
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
          fullWidth
          label={isSubmitting ? 'Creating account...' : 'Create Northstar account'}
          type="submit"
        />
      </form>
    </section>
  )
}
