import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/dal'
import { prisma } from '@/lib/db/prisma'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ paymentId: string }> }) {
  const session = await requireAuth()
  const { paymentId } = await params

  const [wallpapers, packs, user] = await Promise.all([
    prisma.purchase.findMany({
      where: { userId: session.id, paymentId: { startsWith: paymentId } },
      include: { wallpaper: { select: { title: true, category: true, price: true } } },
    }),
    prisma.packPurchase.findMany({
      where: { userId: session.id, paymentId: { startsWith: paymentId } },
      include: { pack: { select: { title: true, price: true, _count: { select: { wallpapers: true } } } } },
    }),
    prisma.user.findUnique({ where: { id: session.id }, select: { name: true, email: true } }),
  ])

  if (wallpapers.length === 0 && packs.length === 0) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  const orderDate = wallpapers[0]?.createdAt ?? packs[0]?.createdAt ?? new Date()
  const total = [...wallpapers, ...packs].reduce((sum, i) => sum + i.amount, 0)
  const itemCount = wallpapers.length + packs.length

  const rows = [
    ...wallpapers.map((p) => `
      <tr>
        <td>${p.wallpaper.title}</td>
        <td>${p.wallpaper.category} Wallpaper</td>
        <td style="text-align:right">₹${p.amount.toFixed(0)}</td>
      </tr>`),
    ...packs.map((p) => `
      <tr>
        <td>${p.pack.title}</td>
        <td>Pack · ${p.pack._count.wallpapers} wallpapers</td>
        <td style="text-align:right">₹${p.amount.toFixed(0)}</td>
      </tr>`),
  ].join('')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice · ${paymentId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #111; padding: 48px; max-width: 720px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; }
    .brand { font-size: 28px; font-weight: 700; letter-spacing: -0.5px; color: #111; }
    .brand span { color: #C8A97E; }
    .invoice-label { text-align: right; }
    .invoice-label h2 { font-size: 20px; font-weight: 600; color: #111; }
    .invoice-label p { font-size: 13px; color: #666; margin-top: 4px; }
    .section { margin-bottom: 32px; }
    .section-title { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #999; margin-bottom: 8px; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .meta-block p { font-size: 14px; color: #111; line-height: 1.6; }
    .meta-block .label { font-size: 12px; color: #888; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead tr { border-bottom: 2px solid #111; }
    thead th { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #888; padding: 8px 0; text-align: left; }
    thead th:last-child { text-align: right; }
    tbody tr { border-bottom: 1px solid #eee; }
    tbody td { font-size: 14px; color: #111; padding: 12px 0; vertical-align: top; }
    tbody td:first-child { font-weight: 500; }
    tbody td:nth-child(2) { color: #666; padding-left: 12px; }
    .totals { margin-top: 16px; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .total-row { display: flex; gap: 48px; font-size: 14px; color: #666; }
    .total-row.grand { font-size: 16px; font-weight: 700; color: #111; border-top: 2px solid #111; padding-top: 8px; margin-top: 4px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .footer p { font-size: 12px; color: #999; }
    .payment-id { font-family: monospace; font-size: 11px; color: #aaa; margin-top: 4px; }
    @media print {
      body { padding: 32px; }
      @page { margin: 0.5cm; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Vel<span>a</span></div>
    <div class="invoice-label">
      <h2>Invoice</h2>
      <p>${orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <div class="section meta-grid">
    <div class="meta-block">
      <p class="label">Billed to</p>
      <p>${user?.name ?? 'Customer'}</p>
      <p>${user?.email ?? ''}</p>
    </div>
    <div class="meta-block">
      <p class="label">From</p>
      <p>Vela</p>
      <p>vela.nachiketgalande.com</p>
    </div>
  </div>

  <div class="section">
    <p class="section-title">Order Summary · ${itemCount} item${itemCount !== 1 ? 's' : ''}</p>
    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th>Type</th>
          <th style="text-align:right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
    <div class="totals">
      <div class="total-row grand">
        <span>Total</span>
        <span>₹${total.toFixed(0)}</span>
      </div>
    </div>
  </div>

  <div class="footer">
    <div>
      <p>Thank you for your purchase.</p>
      <p class="payment-id">Payment ID: ${paymentId}</p>
    </div>
    <p>© ${new Date().getFullYear()} Vela. All rights reserved.</p>
  </div>

  <script>window.onload = () => window.print()</script>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `inline; filename="vela-invoice-${paymentId}.html"`,
    },
  })
}
