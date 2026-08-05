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

// ── Shared layout ─────────────────────────────────────────────────────────────

function emailLayout(content: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vela</title>
</head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#E5E5E5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <span style="font-size:22px;font-weight:700;color:#E5E5E5;letter-spacing:-0.5px;">Vela</span>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="background:#141414;border:1px solid #2A2A2A;border-radius:6px;padding:32px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:24px;font-size:11px;color:#666;text-align:center;line-height:1.6;">
              <p style="margin:0;">Vela — Premium Mobile Wallpapers</p>
              <p style="margin:4px 0 0;">
                <a href="${env.APP_URL}/privacy" style="color:#666;text-decoration:underline;">Privacy Policy</a> &nbsp;·&nbsp;
                <a href="${env.APP_URL}/contact" style="color:#666;text-decoration:underline;">Contact</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ── Auth emails ───────────────────────────────────────────────────────────────

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${env.APP_URL}/auth/verify-email?token=${encodeURIComponent(token)}`
  await sendMail(
    to,
    'Verify your email address — Vela',
    emailLayout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#E5E5E5;">Verify your email</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#999;line-height:1.6;">Hi ${name ?? 'there'}, click the button below to verify your email address. The link expires in 24 hours.</p>
      <a href="${url}" style="display:inline-block;background:#C8A97E;color:#000;font-weight:600;font-size:14px;padding:12px 24px;border-radius:4px;text-decoration:none;">Verify Email</a>
      <p style="margin:24px 0 0;font-size:12px;color:#555;">If you didn't create a Vela account, you can safely ignore this email.</p>
    `),
  )
}

export async function sendPasswordResetEmail(to: string, name: string, token: string) {
  const url = `${env.APP_URL}/auth/reset-password?token=${encodeURIComponent(token)}`
  await sendMail(
    to,
    'Reset your password — Vela',
    emailLayout(`
      <h2 style="margin:0 0 8px;font-size:20px;color:#E5E5E5;">Reset your password</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#999;line-height:1.6;">Hi ${name ?? 'there'}, click the button below to set a new password. This link expires in 1 hour.</p>
      <a href="${url}" style="display:inline-block;background:#C8A97E;color:#000;font-weight:600;font-size:14px;padding:12px 24px;border-radius:4px;text-decoration:none;">Reset Password</a>
      <p style="margin:24px 0 0;font-size:12px;color:#555;">If you didn't request a password reset, you can safely ignore this email.</p>
    `),
  )
}

// ── Order emails ──────────────────────────────────────────────────────────────

type OrderItem = { title: string; type: 'wallpaper' | 'pack'; price: number }

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  paymentId: string,
  items: OrderItem[],
  total: number,
) {
  const itemRows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #2A2A2A;font-size:13px;color:#E5E5E5;">${item.title}${item.type === 'pack' ? ' <span style="font-size:11px;color:#888;">(Pack)</span>' : ''}</td>
      <td style="padding:10px 0;border-bottom:1px solid #2A2A2A;font-size:13px;color:#C8A97E;text-align:right;">₹${item.price.toFixed(0)}</td>
    </tr>
  `).join('')

  await sendMail(
    to,
    'Your Vela order is confirmed',
    emailLayout(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#E5E5E5;">Order confirmed</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#999;">Hi ${name ?? 'there'}, your payment was successful. Here's your receipt.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr>
          <th style="text-align:left;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#555;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">Item</th>
          <th style="text-align:right;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#555;padding-bottom:8px;border-bottom:1px solid #2A2A2A;">Price</th>
        </tr>
        ${itemRows}
        <tr>
          <td style="padding-top:12px;font-size:14px;font-weight:700;color:#E5E5E5;">Total</td>
          <td style="padding-top:12px;font-size:14px;font-weight:700;color:#C8A97E;text-align:right;">₹${total.toFixed(0)}</td>
        </tr>
      </table>

      <p style="margin:0 0 20px;font-size:12px;color:#555;">Payment ID: ${paymentId}</p>

      <a href="${env.APP_URL}/dashboard" style="display:inline-block;background:#C8A97E;color:#000;font-weight:600;font-size:14px;padding:12px 24px;border-radius:4px;text-decoration:none;">Go to My Library</a>
    `),
  )
}

export async function sendSubscriptionConfirmationEmail(
  to: string,
  name: string,
  renewsAt: Date,
) {
  const renewDate = renewsAt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  await sendMail(
    to,
    'Welcome to Vela+ — your subscription is active',
    emailLayout(`
      <h2 style="margin:0 0 4px;font-size:20px;color:#E5E5E5;">Welcome to Vela+</h2>
      <p style="margin:0 0 24px;font-size:14px;color:#999;">Hi ${name ?? 'there'}, your Vela+ subscription is now active. You have unlimited access to every wallpaper on Vela.</p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background:#1A1A1A;border-radius:4px;margin-bottom:24px;">
        <tr>
          <td style="padding:16px 20px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#555;">Plan</p>
            <p style="margin:0;font-size:14px;color:#E5E5E5;font-weight:600;">Vela+ Monthly — ₹499 / month</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 20px 16px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:#555;">Next renewal</p>
            <p style="margin:0;font-size:14px;color:#E5E5E5;font-weight:600;">${renewDate}</p>
          </td>
        </tr>
      </table>

      <p style="margin:0 0 20px;font-size:13px;color:#999;line-height:1.6;">
        Every wallpaper you download while subscribed is yours to keep forever — even if you cancel later.
      </p>

      <a href="${env.APP_URL}" style="display:inline-block;background:#C8A97E;color:#000;font-weight:600;font-size:14px;padding:12px 24px;border-radius:4px;text-decoration:none;">Start Browsing</a>
    `),
  )
}
