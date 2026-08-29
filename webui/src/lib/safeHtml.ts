/**
 * Safe HTML utilities for rendering user content without XSS.
 */

/**
 * Sanitize an HTML string to prevent XSS.
 * Strips script tags, event handler attributes, javascript: URLs,
 * and other dangerous patterns.
 */
export function safeHtml(html: string): string {
  if (!html) return ''

  let result = html

  // Remove script tags and their content
  result = result.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')

  // Remove event handler attributes (onclick, onerror, etc.)
  result = result.replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')

  // Remove javascript: URLs
  result = result.replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '')

  // Remove vbscript: URLs
  result = result.replace(/href\s*=\s*(?:"vbscript:[^"]*"|'vbscript:[^']*')/gi, '')

  // Remove data: URIs that could execute code (only in src attributes)
  result = result.replace(/src\s*=\s*(?:"data:text\/html[^"]*"|'data:text\/html[^']*')/gi, '')

  // Remove <iframe> tags
  result = result.replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, '')

  // Remove <object> tags
  result = result.replace(/<object\b[^>]*>[\s\S]*?<\/object>/gi, '')

  // Remove <embed> tags
  result = result.replace(/<embed\b[^>]*\/?>/gi, '')

  // Remove <form> tags (optional, but prevents form-based attacks)
  result = result.replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, '')

  return result
}

/**
 * Highlight all occurrences of a search query within text.
 * Escapes HTML entities in the text first, then wraps matches in <mark> tags.
 * Returns an HTML string safe for use with dangerouslySetInnerHTML.
 */
export function safeHighlight(text: string, query: string): string {
  if (!text) return ''
  if (!query || !query.trim()) return escapeHtml(text)

  const escapedText = escapeHtml(text)
  const escapedQuery = escapeHtml(query.trim())

  // Escape special regex characters in the query for safe use in RegExp
  const pattern = escapedQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Case-insensitive highlighting
  const regex = new RegExp(`(${pattern})`, 'gi')

  return escapedText.replace(regex, '<mark>$1</mark>')
}

/**
 * Escape HTML special characters to prevent injection.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
