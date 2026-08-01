import 'server-only'
import nodemailer from 'nodemailer'
import { env } from './env'

function getTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  })
}

async function sendMail(to: string, subject: string, html: string) {
  await getTransporter().sendMail({ from: env.SMTP_FROM, to, subject, html })
}

// ── Templates ─────────────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${env.APP_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
  await sendMail(
    to,
    'Verify your email address',
    `<p>Hi ${name ?? 'there'},</p>
     <p>Click the link below to verify your email. The link expires in 24 hours.</p>
     <p><a href="${url}">${url}</a></p>
     <p>If you did not create an account, you can safely ignore this email.</p>`,
  )
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${env.APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`
  await sendMail(
    to,
    'Reset your password',
    `<p>Hi ${name ?? 'there'},</p>
     <p>Click the link below to reset your password. The link expires in 1 hour.</p>
     <p><a href="${url}">${url}</a></p>
     <p>If you did not request a password reset, you can safely ignore this email.</p>`,
  )
}
