import { describe, it, expect } from 'vitest'
import en from '@/presentation/i18n/locales/en/translation.json'
import es from '@/presentation/i18n/locales/es/translation.json'
import gl from '@/presentation/i18n/locales/gl/translation.json'
import eu from '@/presentation/i18n/locales/eu/translation.json'
import ca from '@/presentation/i18n/locales/ca/translation.json'
import va from '@/presentation/i18n/locales/va/translation.json'

const keys = (o: object, p = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? keys(v as object, `${p}${k}.`) : [`${p}${k}`],
  )

describe('i18n locales', () => {
  const enKeys = keys(en).sort()
  it.each([
    ['es', es],
    ['gl', gl],
    ['eu', eu],
    ['ca', ca],
    ['va', va],
  ])('%s has exactly the same keys as en', (_name, locale) => {
    expect(keys(locale).sort()).toEqual(enKeys)
  })
})
