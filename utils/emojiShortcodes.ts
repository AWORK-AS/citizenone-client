// Text shortcodes -> emoji, used by the chat composer so typing ":fire:" or ":)"
// becomes an emoji. Auto-imported by Nuxt (utils/).

const SHORTCODES: Record<string, string> = {
    ':smile:': '😄', ':grin:': '😁', ':joy:': '😂', ':rofl:': '🤣',
    ':blush:': '😊', ':heart_eyes:': '😍', ':kiss:': '😘', ':sunglasses:': '😎',
    ':thinking:': '🤔', ':neutral:': '😐', ':sleepy:': '😴', ':wink:': '😉',
    ':cry:': '😢', ':sob:': '😭', ':angry:': '😡', ':scream:': '😱',
    ':thumbsup:': '👍', ':+1:': '👍', ':thumbsdown:': '👎', ':-1:': '👎',
    ':clap:': '👏', ':pray:': '🙏', ':muscle:': '💪', ':wave:': '👋',
    ':ok:': '👌', ':fire:': '🔥', ':sparkles:': '✨', ':star:': '⭐',
    ':heart:': '❤️', ':tada:': '🎉', ':cake:': '🎂', ':coffee:': '☕',
    ':check:': '✅', ':x:': '❌', ':warning:': '⚠️', ':question:': '❓',
    ':bulb:': '💡', ':pin:': '📌', ':100:': '💯', ':eyes:': '👀',
    ':rocket:': '🚀',
}

// ASCII smileys -> emoji. Order matters (longer first) and each is matched with
// a trailing boundary so it only fires on a completed token.
const ASCII: Array<[string, string]> = [
    [':-)', '🙂'], [':)', '🙂'], [':-D', '😀'], [':D', '😀'],
    [":'(", '😢'], [':-(', '🙁'], [':(', '🙁'], [';-)', '😉'],
    [';)', '😉'], [':-P', '😛'], [':P', '😛'], ['<3', '❤️'],
]

function escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function replaceEmojiShortcodes(text: string): string {
    if (!text) return text

    let result = text

    for (const [code, emoji] of Object.entries(SHORTCODES)) {
        if (result.includes(code)) {
            result = result.split(code).join(emoji)
        }
    }

    for (const [ascii, emoji] of ASCII) {
        // Only replace when followed by whitespace or end of string, so it does
        // not fire mid-typing (e.g. inside a URL).
        const re = new RegExp('(^|\\s)' + escapeRegExp(ascii) + '(?=\\s|$)', 'g')
        result = result.replace(re, '$1' + emoji)
    }

    return result
}
