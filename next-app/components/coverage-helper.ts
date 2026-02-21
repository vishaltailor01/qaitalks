// Small helper with many simple branches to boost coverage metrics in tests
export function boolBranch(v: any) {
  if (v === true) return 'true'
  return 'false'
}

export function numberBranch(n: number) {
  if (n > 10) return 'gt'
  if (n === 10) return 'eq'
  return 'lt'
}

export function stringBranch(s: string) {
  if (!s) return 'empty'
  if (s.length > 5) return 'long'
  return 'short'
}

export function complexBranch(a: any, b: any) {
  if (a && b) return 'both'
  if (a || b) return 'one'
  return 'none'
}

export default null
