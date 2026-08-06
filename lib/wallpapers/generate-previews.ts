import 'server-only'
import sharp from 'sharp'
import { uploadToS3, s3PublicUrl } from '@/lib/storage/s3'

export type GeneratedPreviews = {
  thumbPath: string
  previewPath: string
}

export async function generatePreviews(
  sourceBuffer: Buffer,
  wallpaperId: string
): Promise<GeneratedPreviews> {
  const thumbKey = `previews/thumb_${wallpaperId}.jpg`
  const previewKey = `previews/preview_${wallpaperId}.jpg`

  const [thumbBuffer, previewBuffer] = await Promise.all([
    // Thumb: fixed 9:16 crop for consistent card grids
    sharp(sourceBuffer).resize(400, 711, { fit: 'cover' }).jpeg({ quality: 75 }).toBuffer(),
    // Preview: full image at natural aspect ratio, max width 900px — no cropping
    sharp(sourceBuffer).resize({ width: 900, withoutEnlargement: true }).jpeg({ quality: 85 }).toBuffer(),
  ])

  await Promise.all([
    uploadToS3(thumbKey, thumbBuffer, 'image/jpeg', true),
    uploadToS3(previewKey, previewBuffer, 'image/jpeg', true),
  ])

  return {
    thumbPath: s3PublicUrl(thumbKey),
    previewPath: s3PublicUrl(previewKey),
  }
}

export async function generatePlaceholderPreviews(
  wallpaperId: string,
  color1: string,
  color2: string
): Promise<GeneratedPreviews> {
  const thumbKey = `previews/thumb_${wallpaperId}.jpg`
  const previewKey = `previews/preview_${wallpaperId}.jpg`

  const THUMB_W = 400
  const THUMB_H = 711
  const PREV_W = 600
  const PREV_H = 1067

  const gradSvgThumb = `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_W}" height="${THUMB_H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient></defs>
    <rect width="${THUMB_W}" height="${THUMB_H}" fill="url(#g)"/>
  </svg>`

  const gradSvgPrev = `<svg xmlns="http://www.w3.org/2000/svg" width="${PREV_W}" height="${PREV_H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient></defs>
    <rect width="${PREV_W}" height="${PREV_H}" fill="url(#g)"/>
  </svg>`

  const [thumbBuffer, previewBuffer] = await Promise.all([
    sharp(Buffer.from(gradSvgThumb)).resize(THUMB_W, THUMB_H).jpeg({ quality: 75 }).toBuffer(),
    sharp(Buffer.from(gradSvgPrev)).resize(PREV_W, PREV_H).jpeg({ quality: 85 }).toBuffer(),
  ])

  await Promise.all([
    uploadToS3(thumbKey, thumbBuffer, 'image/jpeg', true),
    uploadToS3(previewKey, previewBuffer, 'image/jpeg', true),
  ])

  return {
    thumbPath: s3PublicUrl(thumbKey),
    previewPath: s3PublicUrl(previewKey),
  }
}
