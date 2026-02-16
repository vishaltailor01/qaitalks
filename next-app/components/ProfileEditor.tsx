"use client"
import React, { useState, useRef } from 'react'
import { processFile } from '@/lib/fileProcessing'
import { parseCvFromText } from '@/lib/parseCv'

const DEFAULT_AVATAR = '/default-avatar.png'

export default function ProfileEditor() {
  React.useEffect(() => {
    // Load existing profile for current user
    let mounted = true
    async function load() {
      try {
        const res = await fetch('/api/profile')
        if (!res.ok) return
        const data = await res.json()
        if (!mounted) return
        if (data.image) setImageSrc(data.image)
        if (data.about) setAbout(data.about)
        if (data.experience) setExperience(JSON.parse(data.experience || '[]'))
        if (data.skills) setSkills(JSON.parse(data.skills || '[]'))
        if (data.licenses) setCerts(JSON.parse(data.licenses || '[]'))
      } catch (err) {
        // ignore
      }
    }
    load()
    return () => { mounted = false }
  }, [])
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [about, setAbout] = useState('')
  const [experience, setExperience] = useState<string[]>([])
  const [skills, setSkills] = useState<string[]>([])
  const [certs, setCerts] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    // Client-side size/type validation
    const MAX = 5 * 1024 * 1024 // 5MB
    if (f.size > MAX) {
      setMessage('Image too large. Maximum 5MB.')
      return
    }
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    if (!allowed.includes(f.type)) {
      setMessage('Invalid image type. Use PNG/JPEG/WebP/GIF.')
      return
    }
    // Upload file to S3 via presigned URL
    try {
      setLoading(true)
      setMessage(null)
      const metaResp = await fetch('/api/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: f.name, contentType: f.type }),
      })
      if (!metaResp.ok) throw new Error('Failed to get upload URL')
      const meta = await metaResp.json()
      if (meta.error) throw new Error(meta.error)
      const uploadUrl = meta.url
      const publicUrl = meta.publicUrl

      const uploadResp = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': f.type },
        body: f,
      })
      if (!uploadResp.ok) throw new Error('Upload failed')

      setImageSrc(publicUrl)
      setMessage('Image uploaded')
    } catch (err) {
      setMessage((err as Error).message || 'Upload error')
    } finally {
      setLoading(false)
    }
  }

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setLoading(true)
    setMessage(null)
    try {
      const res = await processFile(f)
      if (!res.success) {
        setMessage(res.error || 'Failed to process file')
      } else {
        const parsed = parseCvFromText(res.text || '')
        if (parsed.about) setAbout(parsed.about)
        if (parsed.experience) setExperience(parsed.experience)
        if (parsed.skills) setSkills(parsed.skills)
        if (parsed.licenses) setCerts(parsed.licenses)
        setMessage('CV parsed successfully')
      }
    } catch (err) {
      setMessage((err as Error).message || 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkedIn = async (url: string) => {
    if (!url) return
    setLoading(true)
    setMessage(null)
    try {
      const resp = await fetch('/api/linkedin-extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      if (!resp.ok) throw new Error('Failed to fetch LinkedIn profile')
      const data = await resp.json()
      // data may contain about, experience, skills, image
      if (data.image) setImageSrc(data.image)
      if (data.about) setAbout(data.about)
      if (Array.isArray(data.experience)) setExperience(data.experience)
      if (Array.isArray(data.skills)) setSkills(data.skills)
      if (Array.isArray(data.licenses)) setCerts(data.licenses)
      setMessage('LinkedIn profile imported')
    } catch (err) {
      setMessage((err as Error).message || 'LinkedIn import failed')
    } finally {
      setLoading(false)
    }
  }

  function cfResize(url: string | null, width = 200) {
    if (!url) return null
    const host = process.env.NEXT_PUBLIC_CF_IMAGE_HOST
    if (!host) return url
    const base = host.replace(/\/$/, '')
    // Use Cloudflare's image resizing proxy: /cdn-cgi/image/width=.../{originalUrl}
    return `${base}/cdn-cgi/image/width=${width},quality=80/${encodeURIComponent(url)}`
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Profile</h1>

      <div className="flex items-center gap-6 mb-6">
        <img
          src={cfResize(imageSrc, 96) || DEFAULT_AVATAR}
          alt="avatar"
          width={96}
          height={96}
          className="rounded-full object-cover"
        />

        <div>
          <label className="block text-sm font-medium">Profile Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Upload CV (PDF/DOCX/TXT)</label>
        <input ref={fileRef} type="file" accept=".pdf,.docx,.doc,.txt,.md" onChange={handleCvUpload} />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Or import from LinkedIn</label>
        <LinkedInImporter onImport={handleLinkedIn} />
      </div>

      <section className="mb-6">
        <h2 className="font-medium">About</h2>
        <textarea className="w-full border rounded p-2 mt-1" rows={4} value={about} onChange={(e) => setAbout(e.target.value)} />
      </section>

      <section className="mb-6">
        <h2 className="font-medium">Experience</h2>
        <textarea className="w-full border rounded p-2 mt-1" rows={6} value={experience.join('\n')} onChange={(e) => setExperience(e.target.value.split('\n'))} />
      </section>

      <section className="mb-6">
        <h2 className="font-medium">Licenses & Certifications</h2>
        <input className="w-full border rounded p-2 mt-1" value={certs.join(', ')} onChange={(e) => setCerts(e.target.value.split(',').map(s => s.trim()))} />
      </section>

      <section className="mb-6">
        <h2 className="font-medium">Skills</h2>
        <input className="w-full border rounded p-2 mt-1" value={skills.join(', ')} onChange={(e) => setSkills(e.target.value.split(',').map(s => s.trim()))} />
      </section>

      <div className="flex items-center gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading} onClick={async () => {
          setLoading(true)
          setMessage(null)
          try {
            const payload = {
              image: imageSrc,
              about,
              experience: JSON.stringify(experience),
              skills: JSON.stringify(skills),
              licenses: JSON.stringify(certs),
            }
            const res = await fetch('/api/profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('Failed to save profile')
            setMessage('Profile saved')
          } catch (err) {
            setMessage((err as Error).message || 'Save failed')
          } finally {
            setLoading(false)
          }
        }}>
          Save Profile
        </button>
        {loading && <span>Processing...</span>}
        {message && <span className="text-sm text-gray-700">{message}</span>}
      </div>
    </div>
  )
}

function LinkedInImporter({ onImport }: { onImport: (url: string) => void }) {
  const [url, setUrl] = useState('')
  return (
    <div className="flex gap-2">
      <input className="flex-1 border rounded p-2" placeholder="https://www.linkedin.com/in/username" value={url} onChange={(e) => setUrl(e.target.value)} />
      <button className="bg-green-600 text-white px-3 rounded" onClick={() => onImport(url)}>Import</button>
    </div>
  )
}
