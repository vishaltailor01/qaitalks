export const parseMaybeJson = (val: any): any => {
  if (val === undefined || val === null) return []
  if (Array.isArray(val)) return val
  if (typeof val !== 'string') return val
  try {
    let parsed = JSON.parse(val)
    if (typeof parsed === 'string') {
      try { parsed = JSON.parse(parsed) } catch (_) { /* ignore */ }
    }
    return parsed
  } catch (e) {
    if (val.includes(',')) return val.split(',').map((s: string) => s.trim()).filter(Boolean)
    return [val]
  }
}

export default parseMaybeJson
