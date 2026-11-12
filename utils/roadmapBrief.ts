/**
 * A ready-to-paste task brief for a roadmap item or a wish, so it can be handed to a
 * developer or an AI assistant in one go. Starts with the fixed reference
 * ("Roadmap #218" / "Ønske #12"), which is also what goes in the commit, so the work
 * can be found from the roadmap and the roadmap from the code.
 */

const STATUS: Record<string, string> = { in_progress: 'I gang', planned: 'Planlagt', released: 'Udgivet' }

function plain(html: string | null | undefined): string {
    return (html ?? '')
        .replace(/<\/(p|li|h\d)>/gi, '\n')
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<li[^>]*>/gi, '- ')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
}

function section(title: string, body: string | null | undefined): string[] {
    const text = (body ?? '').trim()
    return text ? [`## ${title}`, text, ''] : []
}

function footer(reference: string): string[] {
    return [
        '## Sådan',
        `- CitizenOne (citizenone-backend / citizenone-client). Følg reglerne: pull dev, branch, PR til dev.`,
        `- Skriv "${reference}" i commit og PR, så arbejdet kan findes fra roadmap.`,
        '- Tjek først i koden, om noget af det allerede findes, og byg videre på det.',
        '- Skriv tests. Sig til, hvis noget er uklart, før du bygger.',
    ]
}

export function roadmapReference(item: { number?: number | null }): string {
    return item?.number ? `Roadmap #${item.number}` : 'Roadmap'
}

export function roadmapItemBrief(item: any): string {
    const reference = roadmapReference(item)
    const internal = item.internal ?? {}
    const facts = [
        `Status: ${STATUS[item.status] ?? item.status}`,
        internal.stage && `Fase: ${internal.stage}`,
        internal.priority && `Prioritet: ${internal.priority}${internal.is_important ? ' (vigtig)' : ''}`,
        internal.category && `Kategori: ${internal.category}`,
        internal.ticket && `Ticket: ${internal.ticket}`,
        item.expected_period && `Forventet: ${item.expected_period}`,
        item.industries?.length && `Brancher: ${item.industries.map((industry: any) => industry.dk_name || industry.en_name).join(', ')}`,
    ].filter(Boolean).map((line) => `- ${line}`)

    const customers = (item.requests ?? []).map((request: any) => request.company?.name || request.customer_name).filter(Boolean)
    const wishes = (item.wishes ?? []).map((wish: any) => `- Ønske #${wish.number}${wish.company ? ` (${wish.company})` : ''}: ${wish.message}`)

    return [
        `# ${reference}: ${item.title}`,
        '',
        ...facts,
        '',
        ...section('Beskrivelse (det kunderne ser)', plain(item.description)),
        ...section('Oprindelig tekst', internal.original_text),
        ...section('Ønsker fra appen', wishes.join('\n')),
        ...section('Kunder der ønsker det', customers.join(', ')),
        ...section('Interne noter', internal.notes),
        ...footer(reference),
    ].join('\n').trim() + '\n'
}

export function wishBrief(wish: any): string {
    const reference = wish.roadmap_item?.number ? `Roadmap #${wish.roadmap_item.number}` : `Ønske #${wish.number}`
    return [
        `# ${reference}: ønske fra ${wish.company?.name ?? 'en kunde'}`,
        '',
        `- Ønske #${wish.number}, sendt ${new Date(wish.created_at).toLocaleDateString('da-DK')}${wish.user?.name ? ` af ${wish.user.name}` : ''}`,
        wish.roadmap_item ? `- På roadmap som Roadmap #${wish.roadmap_item.number}: ${wish.roadmap_item.title}` : '- Ikke på roadmap endnu',
        wish.images?.length ? `- ${wish.images.length} skærmbillede(r): ${wish.images.map((image: any) => image.url).join(' ')}` : '',
        '',
        ...section('Ønsket', wish.message),
        ...footer(reference),
    ].filter((line, index, lines) => line !== '' || lines[index - 1] !== '').join('\n').trim() + '\n'
}
