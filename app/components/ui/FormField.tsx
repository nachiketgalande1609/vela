import { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | string[]
}

export function FormField({ label, error, id, className = '', ...props }: FormFieldProps) {
  const errorMsg = Array.isArray(error) ? error[0] : error
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`block w-full rounded-xl border px-4 py-3 text-sm text-neutral-900 transition-all bg-neutral-50
          placeholder:text-neutral-400 focus:outline-none focus:ring-4 focus:bg-white
          disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed
          ${errorMsg
            ? 'border-red-300 bg-red-50/50 focus:ring-red-400/5 focus:border-red-400'
            : 'border-neutral-200 hover:border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900/5'}
          ${className}`}
      />
      {errorMsg && <p className="text-xs text-red-500">{errorMsg}</p>}
    </div>
  )
}
