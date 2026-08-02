import 'server-only'
import { createReadStream, statSync } from 'fs'
import path from 'path'

const PRIVATE_DIR = path.join(process.cwd(), 'private', 'wallpapers')

export function resolveStoragePath(storagePath: string): string {
  // storagePath is a filename only — never allow path traversal
  const filename = path.basename(storagePath)
  return path.join(PRIVATE_DIR, filename)
}

export function streamFileResponse(storagePath: string, filename = 'vela-wallpaper.jpg'): Response {
  const filePath = resolveStoragePath(storagePath)

  let stat: ReturnType<typeof statSync>
  try {
    stat = statSync(filePath)
  } catch {
    return new Response('File not found', { status: 404 })
  }

  const stream = createReadStream(filePath)
  // Node.js ReadStream → Web ReadableStream
  const readable = new ReadableStream({
    start(controller) {
      stream.on('data', (chunk) => controller.enqueue(chunk))
      stream.on('end', () => controller.close())
      stream.on('error', (err) => controller.error(err))
    },
    cancel() {
      stream.destroy()
    },
  })

  return new Response(readable, {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Length': String(stat.size),
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store, no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'",
    },
  })
}
