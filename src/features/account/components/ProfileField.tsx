import { type ReactNode, cloneElement, isValidElement } from 'react'

/** Campo de formulário do perfil, com label, dica e erro associado. */
export function ProfileField({
  id,
  label,
  hint,
  error,
  input,
}: {
  id: string
  label: string
  hint?: string | undefined
  error?: string | undefined
  input: ReactNode
}) {
  const control =
    isValidElement(input) && error
      ? cloneElement(input as React.ReactElement<Record<string, unknown>>, {
          'aria-invalid': true,
          'aria-describedby': `${id}-error`,
        })
      : input

  return (
    <div>
      <label htmlFor={id} className="text-sm text-text-secondary">
        {label}
      </label>
      {control}
      {hint && !error && <p className="mt-1 font-mono text-xs text-text-secondary">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 font-mono text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}
