import parseMaybeJson from '@/components/profile-utils'

describe('parseMaybeJson', () => {
  test('returns empty array for null/undefined', () => {
    expect(parseMaybeJson(undefined)).toEqual([])
    expect(parseMaybeJson(null)).toEqual([])
  })

  test('returns arrays unchanged', () => {
    const arr = [1, 2]
    expect(parseMaybeJson(arr)).toBe(arr)
  })

  test('parses JSON string arrays', () => {
    const json = JSON.stringify(['a', 'b'])
    expect(parseMaybeJson(json)).toEqual(['a', 'b'])
  })

  test('parses double-encoded JSON', () => {
    const double = JSON.stringify(JSON.stringify(['x']))
    expect(parseMaybeJson(double)).toEqual(['x'])
  })

  test('returns non-string non-array values unchanged', () => {
    const obj = { a: 1 }
    expect(parseMaybeJson(obj)).toBe(obj)
  })

  test('parses JSON that represents a string and returns the string', () => {
    const j = JSON.stringify('plain')
    expect(parseMaybeJson(j)).toEqual('plain')
  })

  test('splits comma-separated strings', () => {
    expect(parseMaybeJson('a,b, c')).toEqual(['a', 'b', 'c'])
  })

  test('wraps single string into array', () => {
    expect(parseMaybeJson('single')).toEqual(['single'])
  })
})

export {}
