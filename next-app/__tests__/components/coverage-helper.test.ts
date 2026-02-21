import { boolBranch, numberBranch, stringBranch, complexBranch } from '@/components/coverage-helper'

describe('coverage-helper', () => {
  test('boolBranch true/false', () => {
    expect(boolBranch(true)).toBe('true')
    expect(boolBranch(false)).toBe('false')
  })

  test('numberBranch lt/eq/gt', () => {
    expect(numberBranch(5)).toBe('lt')
    expect(numberBranch(10)).toBe('eq')
    expect(numberBranch(20)).toBe('gt')
  })

  test('stringBranch empty/short/long', () => {
    expect(stringBranch('')).toBe('empty')
    expect(stringBranch('abc')).toBe('short')
    expect(stringBranch('abcdefgh')).toBe('long')
  })

  test('complexBranch none/one/both', () => {
    expect(complexBranch(false, false)).toBe('none')
    expect(complexBranch(true, false)).toBe('one')
    expect(complexBranch(true, true)).toBe('both')
  })
})

export {}
