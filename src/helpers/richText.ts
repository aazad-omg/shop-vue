import DOMPurify from 'dompurify'

export function htmlToText(html: string): string {
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? ''
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 's', 'ul', 'ol', 'li', 'h2', 'h3'],
    ALLOWED_ATTR: [],
  })
}
