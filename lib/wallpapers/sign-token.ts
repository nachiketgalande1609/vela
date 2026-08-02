import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { env } from '@/lib/env'

const DOWNLOAD_EXPIRES_SECONDS = 60

const downloadKey = new TextEncoder().encode(env.JWT_DOWNLOAD_SECRET)

export type DownloadTokenPayload = {
  sub: string      // userId
  wid: string      // wallpaperId
  nonce: string
}

export async function createDownloadToken(userId: string, wallpaperId: string, nonce: string): Promise<string> {
  return new SignJWT({ wid: wallpaperId, nonce })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${DOWNLOAD_EXPIRES_SECONDS}s`)
    .sign(downloadKey)
}

export async function verifyDownloadToken(token: string): Promise<DownloadTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, downloadKey, { algorithms: ['HS256'] })
    return {
      sub: payload.sub as string,
      wid: payload.wid as string,
      nonce: payload.nonce as string,
    }
  } catch {
    return null
  }
}
