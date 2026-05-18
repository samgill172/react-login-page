export const MIN_PASSWORD_LENGTH = 8
export const NAME_MAX_LENGTH = 100

export type AuthUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  status: 'pending_verification' | 'active' | 'disabled'
  createdAt: string
}

export type RegistrationPayload = {
  firstName: string
  lastName: string
  email: string
  password: string
  acceptedTerms: boolean
  marketingOptIn: boolean
}

export type LoginPayload = {
  email: string
  password: string
  rememberMe: boolean
}

export type RegistrationResponse = {
  message: string
  user: AuthUser
}

export type LoginResponse = {
  message: string
  user: AuthUser
  session: {
    expiresAt: string
    token: string
  }
}
