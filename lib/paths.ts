/**
 * Encodes one dynamic URL segment for use in an application route.
 *
 * `encodeURIComponent` deliberately leaves parentheses unescaped. Cloud Run's
 * routing layer does not reliably preserve those characters in a dynamic path,
 * so use strict RFC 3986 encoding for every persisted slug.
 */
export function encodePathSegment(value: string) {
  return encodeURIComponent(value.trim()).replace(/[!'()*]/g, (character) =>
    `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

export function localizedSlugPath(locale: string, basePath: string, slug: string) {
  return `/${locale}${basePath}/${encodePathSegment(slug)}`;
}

export function productPath(locale: string, slug: string) {
  return localizedSlugPath(locale, '/products', slug);
}
