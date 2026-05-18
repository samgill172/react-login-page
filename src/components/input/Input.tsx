import { useId, type ComponentPropsWithoutRef } from 'react'

type InputProps = Omit<ComponentPropsWithoutRef<'input'>, 'className'> & {
  label: string
  hint?: string
  inputClassName?: string
}

export default function Input({
  label,
  hint,
  inputClassName,
  id,
  type = 'text',
  ...inputProps
}: InputProps) {
  const inputId = useId()

  return (
    <label className="flex w-full flex-col gap-2">
      <span className="text-sm font-semibold text-stone-700">{label}</span>
      <input
        id={id ?? inputId}
        type={type}
        className={[
          'h-14 w-full rounded-2xl border border-stone-200 bg-[#fcfaf7] px-4 text-base text-stone-900 placeholder:text-stone-400 focus:border-[#c46a32] focus:outline-none focus:ring-4 focus:ring-[#f6d5c2] disabled:cursor-not-allowed disabled:opacity-60',
          inputClassName ?? '',
        ].join(' ')}
        {...inputProps}
      />
      {hint ? <span className="text-sm text-stone-500">{hint}</span> : null}
    </label>
  )
}
