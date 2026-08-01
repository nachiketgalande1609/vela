import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }).max(100).trim(),
  email: z.string().email({ message: 'Enter a valid email address.' }).trim().toLowerCase(),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter.' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter.' })
    .regex(/[0-9]/, { message: 'Password must contain at least one number.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Password must contain at least one special character.' }),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address.' }).trim().toLowerCase(),
  password: z.string().min(1, { message: 'Password is required.' }),
  rememberMe: z.boolean().optional().default(false),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address.' }).trim().toLowerCase(),
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/[A-Z]/, { message: 'Must contain an uppercase letter.' })
    .regex(/[a-z]/, { message: 'Must contain a lowercase letter.' })
    .regex(/[0-9]/, { message: 'Must contain a number.' })
    .regex(/[^A-Za-z0-9]/, { message: 'Must contain a special character.' }),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

export const verifyEmailSchema = z.object({
  token: z.string().min(1, { message: 'Verification token is required.' }),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
