// What pressing a starter in Cody's empty thread does. Pure, for node --test.
//
// One rule, the same one the "Spørg Cody AI" button on a brief line follows:
// a prompt that is a complete question is asked at once; a prompt that stops
// mid-sentence ("Skriv et journalnotat for ", "Find de vedhæftede filer om ")
// needs a name from the user, so it is put in the field with the cursor at the
// end instead. An unfinished prompt is recognised by its trailing space, which
// is how the quickPrompts strings in lang/*.json already mark it.

export type StarterMode = 'send' | 'fill'

export function starterMode(prompt: string): StarterMode {
    return /\s$/.test(prompt) ? 'fill' : 'send'
}
