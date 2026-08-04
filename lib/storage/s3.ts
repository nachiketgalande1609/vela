import 'server-only'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { env } from '@/lib/env'

export const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
})

export async function uploadToS3(
  key: string,
  body: Buffer,
  contentType: string,
  isPublic = false
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: env.AWS_S3_BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      ...(isPublic && { ACL: 'public-read' }),
    })
  )
}

export function s3PublicUrl(key: string): string {
  return `https://${env.AWS_S3_BUCKET}.s3.${env.AWS_REGION}.amazonaws.com/${key}`
}

export async function deleteFromS3(key: string): Promise<void> {
  const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
  await s3.send(new DeleteObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }))
}

export async function deleteManyFromS3(keys: string[]): Promise<void> {
  const { DeleteObjectsCommand } = await import('@aws-sdk/client-s3')
  if (!keys.length) return
  await s3.send(new DeleteObjectsCommand({
    Bucket: env.AWS_S3_BUCKET,
    Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true },
  }))
}

export function s3KeyFromUrl(url: string): string {
  try { return new URL(url).pathname.slice(1) } catch { return url }
}

export async function getPresignedUploadUrl(key: string, contentType: string, expiresInSeconds = 300): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  })
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}

export async function downloadFromS3(key: string): Promise<Buffer> {
  const response = await s3.send(new GetObjectCommand({ Bucket: env.AWS_S3_BUCKET, Key: key }))
  const chunks: Uint8Array[] = []
  for await (const chunk of response.Body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function getPresignedDownloadUrl(key: string, expiresInSeconds = 60, filename?: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET,
    Key: key,
    ...(filename && { ResponseContentDisposition: `attachment; filename="${filename}"` }),
  })
  return getSignedUrl(s3, command, { expiresIn: expiresInSeconds })
}
