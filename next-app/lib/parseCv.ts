// Simple heuristic parser to extract sections from plain text CVs
export function parseCvFromText(text: string) {
  const lower = text.replace(/\r/g, '\n')

  const result: {
    about?: string
    experience?: string[]
    skills?: string[]
    licenses?: string[]
  } = {}

  // Try to capture an "About" block at start
  const aboutMatch = text.split('\n\n')[0]
  if (aboutMatch && aboutMatch.length < 1000) result.about = aboutMatch.trim()

  // Experience: look for lines beginning with dates or headings
  const experience: string[] = []
  const expRegex = /\b(Experience|Work Experience|Employment)\b/i
  const skillsRegex = /\b(Skills|Technical Skills)\b/i
  const licenseRegex = /\b(Licenses|Certifications|Certifications & Licenses)\b/i

  const sections = text.split(/\n\s*\n/)
  for (const s of sections) {
    if (expRegex.test(s) || /\d{4}/.test(s)) {
      experience.push(...s.split('\n').map(l => l.trim()).filter(Boolean))
    }
    if (skillsRegex.test(s)) {
      // split by commas or newlines
      const found = s.replace(/Skills\:*/i, '').split(/[\n,]/).map(x => x.trim()).filter(Boolean)
      result.skills = (result.skills || []).concat(found)
    }
    if (licenseRegex.test(s)) {
      const found = s.replace(/(Licenses|Certifications)\:*/i, '').split(/[\n,]/).map(x => x.trim()).filter(Boolean)
      result.licenses = (result.licenses || []).concat(found)
    }
  }

  if (experience.length) result.experience = experience
  if (result.skills) result.skills = Array.from(new Set(result.skills))
  if (result.licenses) result.licenses = Array.from(new Set(result.licenses))

  return result
}
