import { describe, it, expect } from 'vitest'
import en from '@/presentation/i18n/locales/en/translation.json'
import es from '@/presentation/i18n/locales/es/translation.json'

describe('i18n locales', () => {
  it('es has exactly the same keys as en', () => {
    const keys = (o: object, p = ''): string[] =>
      Object.entries(o).flatMap(([k, v]) =>
        v && typeof v === 'object' ? keys(v as object, `${p}${k}.`) : [`${p}${k}`],
      )
    expect(keys(es).sort()).toEqual(keys(en).sort())
  })
})
