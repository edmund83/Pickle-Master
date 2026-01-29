/**
 * International SEO utilities
 *
 * @example
 * ```ts
 * import { buildInternationalMetadata, LOCALES, buildUrl } from '@/lib/seo'
 * ```
 */

export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_CONFIG,
  isValidLocale,
  getLocaleConfig,
  type Locale,
  type LocaleConfig,
} from './locales'

export {
  getSiteOrigin,
  buildUrl,
  buildAbsoluteUrl,
  buildLocalePath,
  normalizePathname,
  extractPathname,
  getLocaleFromPath,
} from './urls'

export {
  getHreflangCode,
  buildHreflangAlternates,
  buildMetadataAlternates,
} from './hreflang'

export {
  buildInternationalMetadata,
  getLocaleFromParams,
  type InternationalMetadataInput,
} from './metadata'
