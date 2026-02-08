import { formatDate, slugify, cn } from '@/lib/utils'

describe('lib/utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-02-08')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Feb 8, 2025|2\/8\/2025/) // Accounts for locale variations
    })

    it('should handle string dates', () => {
      const formatted = formatDate(new Date('2025-12-25'))
      expect(formatted).toMatch(/Dec 25, 2025|12\/25\/2025/)
    })
  })

  describe('slugify', () => {
    it('should convert text to slug format', () => {
      const result = slugify('Hello World')
      expect(result).toBe('hello-world')
    })

    it('should remove special characters', () => {
      const result = slugify('Test @ Automation!')
      expect(result).toBe('test-automation')
    })

    it('should handle multiple spaces', () => {
      const result = slugify('Multi   Space   Text')
      expect(result).toBe('multi-space-text')
    })

    it('should handle multiple hyphens', () => {
      const result = slugify('Multiple---Hyphens')
      expect(result).toBe('multiple-hyphens')
    })
  })

  describe('cn', () => {
    it('should combine class names', () => {
      const result = cn('px-4', 'py-2', 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('should filter out falsy values', () => {
      const result = cn('px-4', false, 'py-2', undefined, 'bg-blue-500')
      expect(result).toBe('px-4 py-2 bg-blue-500')
    })

    it('should handle empty input', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })
})
