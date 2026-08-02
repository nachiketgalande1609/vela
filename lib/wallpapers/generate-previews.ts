import sharp from 'sharp'
import path from 'path'

const PUBLIC_PREVIEWS_DIR = path.join(process.cwd(), 'public', 'previews')

export type GeneratedPreviews = {
  thumbPath: string   // relative path from public/
  previewPath: string // relative path from public/
}

async function createWatermarkOverlay(width: number, height: number): Promise<Buffer> {
  // Generate a tiled diagonal "VELA PREVIEW" watermark as SVG
  const tileSize = 160
  const tiles: string[] = []
  const cols = Math.ceil(width / tileSize) + 2
  const rows = Math.ceil(height / tileSize) + 2

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileSize - tileSize
      const y = r * tileSize - tileSize / 2
      tiles.push(
        `<text x="${x}" y="${y}" transform="rotate(-30, ${x}, ${y})" font-size="13" fill="rgba(255,255,255,0.18)" font-family="Arial" font-weight="bold" letter-spacing="2">VELA PREVIEW</text>`
      )
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${tiles.join('')}</svg>`
  return Buffer.from(svg)
}

export async function generatePreviews(
  sourcePath: string,
  wallpaperId: string
): Promise<GeneratedPreviews> {
  const thumbFilename = `thumb_${wallpaperId}.jpg`
  const previewFilename = `preview_${wallpaperId}.jpg`
  const thumbOut = path.join(PUBLIC_PREVIEWS_DIR, thumbFilename)
  const previewOut = path.join(PUBLIC_PREVIEWS_DIR, previewFilename)

  const THUMB_W = 400
  const THUMB_H = 711

  const thumbWatermark = await createWatermarkOverlay(THUMB_W, THUMB_H)
  await sharp(sourcePath)
    .resize(THUMB_W, THUMB_H, { fit: 'cover' })
    .blur(40)
    .composite([{ input: thumbWatermark, blend: 'over' }])
    .jpeg({ quality: 60 })
    .toFile(thumbOut)

  const PREV_W = 600
  const PREV_H = 1067

  const prevWatermark = await createWatermarkOverlay(PREV_W, PREV_H)
  await sharp(sourcePath)
    .resize(PREV_W, PREV_H, { fit: 'cover' })
    .blur(25)
    .composite([{ input: prevWatermark, blend: 'over' }])
    .jpeg({ quality: 70 })
    .toFile(previewOut)

  return {
    thumbPath: `/previews/${thumbFilename}`,
    previewPath: `/previews/${previewFilename}`,
  }
}

export async function generatePlaceholderPreviews(
  wallpaperId: string,
  color1: string,
  color2: string
): Promise<GeneratedPreviews> {
  const thumbFilename = `thumb_${wallpaperId}.jpg`
  const previewFilename = `preview_${wallpaperId}.jpg`
  const thumbOut = path.join(PUBLIC_PREVIEWS_DIR, thumbFilename)
  const previewOut = path.join(PUBLIC_PREVIEWS_DIR, previewFilename)

  const THUMB_W = 400
  const THUMB_H = 711

  const gradSvgThumb = `<svg xmlns="http://www.w3.org/2000/svg" width="${THUMB_W}" height="${THUMB_H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient></defs>
    <rect width="${THUMB_W}" height="${THUMB_H}" fill="url(#g)"/>
  </svg>`

  const thumbWatermark = await createWatermarkOverlay(THUMB_W, THUMB_H)
  await sharp(Buffer.from(gradSvgThumb))
    .resize(THUMB_W, THUMB_H)
    .blur(40)
    .composite([{ input: thumbWatermark, blend: 'over' }])
    .jpeg({ quality: 60 })
    .toFile(thumbOut)

  const PREV_W = 600
  const PREV_H = 1067

  const gradSvgPrev = `<svg xmlns="http://www.w3.org/2000/svg" width="${PREV_W}" height="${PREV_H}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient></defs>
    <rect width="${PREV_W}" height="${PREV_H}" fill="url(#g)"/>
  </svg>`

  const prevWatermark = await createWatermarkOverlay(PREV_W, PREV_H)
  await sharp(Buffer.from(gradSvgPrev))
    .resize(PREV_W, PREV_H)
    .blur(25)
    .composite([{ input: prevWatermark, blend: 'over' }])
    .jpeg({ quality: 70 })
    .toFile(previewOut)

  return {
    thumbPath: `/previews/${thumbFilename}`,
    previewPath: `/previews/${previewFilename}`,
  }
}
