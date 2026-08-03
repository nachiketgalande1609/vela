import 'server-only'
import { getPresignedDownloadUrl } from '@/lib/storage/s3'

export async function streamFileResponse(storagePath: string, filename = 'vela-wallpaper.jpg'): Promise<Response> {
  try {
    const url = await getPresignedDownloadUrl(storagePath, 60)
    // Redirect to S3 presigned URL — browser streams directly from S3
    return Response.redirect(url, 302)
  } catch {
    return new Response('File not found', { status: 404 })
  }
}
