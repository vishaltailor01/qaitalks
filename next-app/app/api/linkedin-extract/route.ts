import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { url } = body
    if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })

    // Basic fetch of the LinkedIn page and attempt to extract meta tags.
    // Note: LinkedIn may block requests or require authentication. This is a best-effort extractor.
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Next.js)'
      }
    })
    if (!res.ok) return NextResponse.json({ error: 'Failed to fetch' }, { status: 502 })
    const html = await res.text()

    // Simple extraction of og:description, og:title, og:image
    const ogTitle = (html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) || [])[1]
    const ogDesc = (html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) || [])[1]
    const ogImage = (html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) || [])[1]

    // Very naive skills/experience extraction from description
    const about = ogDesc || ''
    const data = {
      title: ogTitle || null,
      about,
      image: ogImage || null,
      experience: about ? about.split(/\.|;|\n/).slice(0, 5).map(s => s.trim()).filter(Boolean) : [],
      skills: [],
      licenses: [],
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
