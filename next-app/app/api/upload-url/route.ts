import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const REGION = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION
const BUCKET = process.env.S3_BUCKET || process.env.NEXT_PUBLIC_S3_BUCKET

if (!REGION || !BUCKET) {
  // Do not throw in module scope; throw when route is called
}

export async function POST(req: Request) {
  try {
    const { fileName, contentType } = await req.json()
    if (!fileName || !contentType) return NextResponse.json({ error: 'Missing fileName or contentType' }, { status: 400 })

    const region = REGION
    const bucket = BUCKET
    if (!region || !bucket) return NextResponse.json({ error: 'S3 not configured' }, { status: 500 })

    const key = `profiles/${Date.now()}-${Math.random().toString(36).slice(2)}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '')}`

    const client = new S3Client({ region })
    const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType })
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 })

    // Construct a public URL depending on region
    const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`

    return NextResponse.json({ url: signedUrl, key, publicUrl })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
