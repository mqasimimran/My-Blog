import 'server-only'
import { randomUUID } from 'node:crypto'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export const R2_VARIABLES = ['R2_ACCOUNT_ID', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY', 'R2_BUCKET_NAME', 'R2_PUBLIC_URL'] as const

export function storageStatus() {
  const provider = process.env.UPLOAD_STORAGE_PROVIDER || 'supabase'
  return { provider, missing: R2_VARIABLES.filter(name => !process.env[name]?.trim()) }
}

export async function createR2Upload(bucket: string, path: string, size: number, contentType: string) {
  if (storageStatus().missing.length) throw new Error('R2 configuration is incomplete. See Admin > Storage.')
  const origin = new URL(process.env.R2_PUBLIC_URL!)
  if (origin.protocol !== 'https:' || origin.username || origin.password || origin.search || origin.hash) {
    throw new Error('R2_PUBLIC_URL must be a public HTTPS media URL.')
  }
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: process.env.R2_ACCESS_KEY_ID!, secretAccessKey: process.env.R2_SECRET_ACCESS_KEY! },
    requestChecksumCalculation: 'WHEN_REQUIRED',
  })
  // A new key prevents accidental overwrites of existing portfolio assets.
  const key = `${bucket}/${randomUUID()}/${path}`
  const uploadUrl = await getSignedUrl(client, new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!, Key: key, ContentType: contentType, ContentLength: size,
  }), { expiresIn: 300, signableHeaders: new Set(['content-type', 'content-length']) })
  return { provider: 'r2', path: key, uploadUrl, contentType,
    publicUrl: `${origin.href.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}` }
}
