import { useI18n } from 'vue-i18n'

export function defaultCareNoteTemplate(t?: (key: string) => string): string {
    const translate = t ?? useI18n().t
    return ['observation', 'assessment', 'plan', 'followUp']
        .map((key) => `<p><strong>${translate(`citizens.treatments.template.${key}`)}</strong></p><p></p>`)
        .join('')
}

function normalise(html: string): string {
    return (html ?? '')
        .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .replace(/>\s+</g, '><')
        .trim()
}

// True when the HTML is still just the untouched template skeleton (or empty).
export function isUnfilledTemplate(html: string, template: string): boolean {
    const current = normalise(html)
    return current === '' || current === normalise(template)
}
