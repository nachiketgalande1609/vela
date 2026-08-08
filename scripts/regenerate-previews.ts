/**
 * Regenerates preview and thumb images for every wallpaper in the DB.
 * Run: npm run regen-previews
 *
 * - Preview: full natural aspect ratio, max 600px wide (no cropping)
 * - Thumb:   fixed 400×711 crop (9:16, used in grid cards)
 */
import { readFileSync } from 'fs'
import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import sharp from 'sharp'

// ── Load .env.local ────────────────────────────────────────────────────────────
try {
  const raw = readFileSync('.env.local', 'utf-8')
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = val
  }
} catch {
  console.warn('Could not load .env.local — ensure env vars are set')
}

// ── Clients ────────────────────────────────────────────────────────────────────
const prisma = new PrismaClient()

const BUCKET = process.env.AWS_S3_BUCKET!
const REGION = process.env.AWS_REGION!

const s3 = new S3Client({
  region: REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

// ── Helpers ────────────────────────────────────────────────────────────────────
async function downloadFromS3(key: string): Promise<Buffer> {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const chunks: Uint8Array[] = []
  for await (const chunk of res.Body as AsyncIterable<Uint8Array>) chunks.push(chunk)
  return Buffer.concat(chunks)
}

async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<void> {
  await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: body, ContentType: contentType, ACL: 'public-read' }))
}

function s3Url(key: string) {
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${key}`
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  const wallpapers = await prisma.wallpaper.findMany({
    select: { id: true, storagePath: true },
    orderBy: { createdAt: 'asc' },
  })

  const total = wallpapers.length
  console.log(`\nRegenerating previews for ${total} wallpaper${total !== 1 ? 's' : ''}...\n`)

  let ok = 0
  let fail = 0

  for (let i = 0; i < wallpapers.length; i++) {
    const w = wallpapers[i]
    const label = `[${i + 1}/${total}] ${w.id}`
    process.stdout.write(`${label}  `)

    try {
      // storagePath is stored as the S3 key (e.g. "wallpapers/uuid.jpg")
      const storageKey = w.storagePath.startsWith('http')
        ? new URL(w.storagePath).pathname.slice(1)
        : w.storagePath

      const buffer = await downloadFromS3(storageKey)

      const previewKey = `previews/preview_${w.id}.jpg`
      const thumbKey   = `previews/thumb_${w.id}.jpg`

      const [thumbBuffer, previewBuffer] = await Promise.all([
        sharp(buffer).resize(400, 711, { fit: 'cover' }).jpeg({ quality: 75 }).toBuffer(),
        sharp(buffer).resize({ width: 600, withoutEnlargement: true }).jpeg({ quality: 70 }).toBuffer(),
      ])

      await Promise.all([
        uploadToS3(thumbKey, thumbBuffer, 'image/jpeg'),
        uploadToS3(previewKey, previewBuffer, 'image/jpeg'),
      ])

      await prisma.wallpaper.update({
        where: { id: w.id },
        data: { previewPath: s3Url(previewKey), thumbPath: s3Url(thumbKey) },
      })

      console.log('✓')
      ok++
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.log(`✗  ${msg}`)
      fail++
    }
  }

  console.log(`\n──────────────────────────────────`)
  console.log(`Done:  ${ok} succeeded  •  ${fail} failed`)
  console.log(`──────────────────────────────────\n`)
}

main()
  .catch((err) => { console.error(err); process.exit(1) })
  .finally(() => prisma.$disconnect())
