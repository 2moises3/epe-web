import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('combines conditional class names', () => {
    expect(cn('text-sm', false && 'hidden', 'font-medium')).toBe(
      'text-sm font-medium',
    )
  })

  it('resolves conflicting Tailwind classes', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
  })
})
