import { InputHTMLAttributes } from 'react'

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string | string[]
}

export function FormField({ label, error, id, className = '', ...props }: FormFieldProps) {
  const errorMsg = Array.isArray(error) ? error[0] : error
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`block w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 shadow-sm
          placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-slate-50 disabled:text-slate-400
          ${errorMsg ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-slate-200 bg-white'}
          ${className}`}
      />
      {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
    </div>
  )
}
