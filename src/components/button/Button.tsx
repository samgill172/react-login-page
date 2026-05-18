import type { ComponentPropsWithoutRef } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'outline'

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-stone-950 text-white hover:bg-stone-800 focus:ring-stone-300',
  secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200 focus:ring-stone-200',
  outline: 'border border-stone-200 bg-white text-stone-700 hover:bg-stone-50 focus:ring-stone-200',
}

type ButtonProps = Omit<ComponentPropsWithoutRef<'button'>, 'className'> & {
  label: string
  variant?: ButtonVariant
  fullWidth?: boolean
  className?: string
}

export default function Button({
  label,
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className,
  disabled = false,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={[
        'inline-flex min-h-12 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-60',
        fullWidth ? 'w-full' : 'w-auto',
        variantClasses[variant],
        className ?? '',
      ].join(' ')}
      {...buttonProps}
    >
      {label}
    </button>
  )
}