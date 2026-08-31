#!/usr/bin/env python3
"""Rewrite the citizen word in a lang file as vue-i18n links.

A company can rename the citizen in Settings (term_citizen and friends). Only
useTerminology() call sites honoured that, and none of them covered the plain
Danish strings, so a dental account still read "Borgere" everywhere. Rewriting
the strings as links moves the substitution into vue-i18n itself: no call site
changes, and the company's own words arrive through mergeLocaleMessage().

Two rules the vue-i18n 9 tokenizer forces on us, both measured rather than
assumed (see readLinkedRefer in vue-i18n's dist):

  - A linked key ends only at a space, at one of { % @ | ( ), or at the end of
    the string. Anything else, a comma or a full stop included, is read INTO the
    key, the lookup fails and the word disappears with no warning at all:
    "Se @:terms.citizenDefinite, tak" renders as "Se  tak". Every link this
    script writes is therefore terminated by a literal, even an empty one.
  - Danish compounds glue the bare stem to the tail, so borgerjournal becomes
    patientjournal through the same literal: @:terms.citizen{'journal'}.

Usage:  terminology-link.py lang/dk.json [--write]
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter

# The four keys already carried by useTerminology(). Suffix is glued after the
# term, so the genitive needs no key of its own: borgeren + s, patienten + s.
LOCALES: dict[str, dict[str, object]] = {
    'dk': {
        # Suffix is glued after the term, so the genitive needs no key of its own:
        # borgeren + s, patienten + s.
        'inflections': {
            'Borgernes': ('citizensDefinite', 's'), 'borgernes': ('citizensDefinite', 's'),
            'Borgerens': ('citizenDefinite', 's'), 'borgerens': ('citizenDefinite', 's'),
            'Borgeres': ('citizens', 's'), 'borgeres': ('citizens', 's'),
            'Borgers': ('citizen', 's'), 'borgers': ('citizen', 's'),
            'Borgerne': ('citizensDefinite', ''), 'borgerne': ('citizensDefinite', ''),
            'Borgeren': ('citizenDefinite', ''), 'borgeren': ('citizenDefinite', ''),
            'Borgere': ('citizens', ''), 'borgere': ('citizens', ''),
            'Borger': ('citizen', ''), 'borger': ('citizen', ''),
        },
        'stem': r'([Bb])orger(.+)$',
        'glue': '',
        'not_the_citizen': {'statsborger', 'Statsborger'},
    },
    'en': {
        # English needs neither compounds nor a definite form: the article is a separate word,
        # so "the citizen" already renders through terms.citizen, and "citizen journal" is two
        # words rather than one glued compound.
        'inflections': {
            'Citizens': ('citizens', ''), 'citizens': ('citizens', ''),
            'Citizen': ('citizen', ''), 'citizen': ('citizen', ''),
        },
        'stem': None,
        'glue': ' ',
        # The product is called CitizenOne. Token matching keeps it whole, and it is listed as
        # well so a future change to the matching cannot quietly rename the company.
        'not_the_citizen': {'CitizenOne', 'citizenone', 'CitizenOnes', 'citizenDefinite'},
    },
    'no': {
        'inflections': {
            'Brukernes': ('citizensDefinite', 's'), 'brukernes': ('citizensDefinite', 's'),
            'Brukerens': ('citizenDefinite', 's'), 'brukerens': ('citizenDefinite', 's'),
            'Brukeres': ('citizens', 's'), 'brukeres': ('citizens', 's'),
            'Brukers': ('citizen', 's'), 'brukers': ('citizen', 's'),
            'Brukerne': ('citizensDefinite', ''), 'brukerne': ('citizensDefinite', ''),
            'Brukeren': ('citizenDefinite', ''), 'brukeren': ('citizenDefinite', ''),
            'Brukere': ('citizens', ''), 'brukere': ('citizens', ''),
            'Bruker': ('citizen', ''), 'bruker': ('citizen', ''),
        },
        'stem': r'([Bb])ruker(.+)$',
        'glue': '',
        # En administratorbruker er en medarbejder, og statsbruker er en fejloversaettelse af
        # statsborger. Ingen af dem er den person arbejdet handler om.
        'not_the_citizen': {'Administratorbruker', 'administratorbruker', 'statsbruker', 'Statsbruker'},
    },
    'sv': {
        'inflections': {
            'Klienternas': ('citizensDefinite', 's'), 'klienternas': ('citizensDefinite', 's'),
            'Klientens': ('citizenDefinite', 's'), 'klientens': ('citizenDefinite', 's'),
            'Klienters': ('citizens', 's'), 'klienters': ('citizens', 's'),
            'Klienterna': ('citizensDefinite', ''), 'klienterna': ('citizensDefinite', ''),
            'Klienten': ('citizenDefinite', ''), 'klienten': ('citizenDefinite', ''),
            'Klienter': ('citizens', ''), 'klienter': ('citizens', ''),
            'Klient': ('citizen', ''), 'klient': ('citizen', ''),
        },
        # Praefiks foran stammen. Dansk skriver demo-borgere med bindestreg, saa ordet staar
        # frit; svensk limer det sammen og skal derfor navngives.
        'prefixed': {
            'demoklienter': ('demo', 'citizens', ''),
            'Demoklienter': ('Demo', 'citizens', ''),
        },
        'stem': r'([Kk])lient(.+)$',
        'glue': '',
        'not_the_citizen': set(),
    },
}

# Compound tails seen in the file. Listed rather than matched by pattern so that
# a new compound fails the run instead of being guessed at: borgersundhed must
# split as borger + sundhed, and a suffix-first guess would read borger + s.
# Keys left in plain language, with the reason.
KEEP_LITERAL: dict[str, str] = {
    'settings.company.form.termCitizen': 'labels the field that defines the word',
    'settings.company.form.termCitizenDefinite': 'labels the field that defines the word',
    'settings.company.form.termCitizens': 'labels the field that defines the word',
    'settings.company.form.termCitizensDefinite': 'labels the field that defines the word',
}

# Superadmin spans every tenant, so one tenant's word does not belong there.
KEEP_LITERAL_PREFIXES: tuple[str, ...] = ('superadmin.',)

WORD = re.compile(r'[A-Za-zÆØÅæøåÄÖäö]+')
Q = "'"


def link(term: str, tail: str, capitalise: bool) -> str:
    modifier = '@.capitalize:' if capitalise else '@:'

    return f'{modifier}terms.{term}{{{Q}{tail}{Q}}}'


def convert(value: str, rules: dict) -> tuple[str, int, list[str], list[str]]:
    """Return the rewritten string, how many words changed, unknown forms, compounds seen."""
    changed = 0
    unknown: list[str] = []
    compounds: list[str] = []
    inflections = rules['inflections']
    stem = re.compile(rules['stem']) if rules['stem'] else None
    glue = rules['glue']

    # Spans of {...}: a named parameter, not prose. English is the case that needs this, because
    # its word IS the parameter name: "mentioned you in {citizen}'s journal" would otherwise
    # become {@:terms.citizen{''}} and render the link as literal text.
    braces = [(m.start(), m.end()) for m in re.finditer(r'\{[^{}]*\}', value)]

    # Links already written. The English placeholder contains the English word, so without this
    # a second run would rewrite @:terms.citizen into @:terms.@:terms.citizen. Danish escapes it
    # only because its word and the placeholder share no letters.
    braces += [(m.start(), m.end()) for m in re.finditer(r'@[.:][A-Za-z.:]+', value)]

    def replace(match: re.Match[str]) -> str:
        nonlocal changed
        word = match.group(0)

        if any(start < match.start() < end for start, end in braces):
            return word

        if word in rules['not_the_citizen']:
            return word

        prefixed = rules.get('prefixed', {})

        if word in prefixed:
            prefix, term, suffix = prefixed[word]
            changed += 1

            return prefix + link(term, suffix, False)

        if word in inflections:
            term, suffix = inflections[word]
            changed += 1

            return link(term, suffix, word[0].isupper())

        found = stem.match(word) if stem else None

        if found:
            # The split is always at the stem, never inside a suffix, so borgersundhed can only
            # become borger + sundhed and never borger + s + undhed.
            compounds.append(word)
            changed += 1

            return link('citizen', glue + found.group(2), word[0].isupper())

        if any(form.lower() in word.lower() for form in list(inflections)[-1:]):
            unknown.append(word)

        return word

    return WORD.sub(replace, value), changed, unknown, compounds


def walk(node, prefix=''):
    if isinstance(node, dict):
        for key, child in node.items():
            yield from walk(child, f'{prefix}{key}.')
    elif isinstance(node, str):
        yield prefix[:-1], node


def rewrite(node, rules, prefix='', stats=None):
    if isinstance(node, dict):
        return {k: rewrite(v, rules, f'{prefix}{k}.', stats) for k, v in node.items()}

    if isinstance(node, str):
        key = prefix[:-1]

        if not rules['probe'].search(node):
            return node

        if key in KEEP_LITERAL or key.startswith(KEEP_LITERAL_PREFIXES):
            stats['kept'].append(key)

            return node

        new, changed, unknown, compounds = convert(node, rules)
        stats['compounds'].extend(compounds)

        if unknown:
            stats['unknown'].extend((key, w) for w in unknown)

        if changed:
            stats['converted'].append((key, node, new))
        elif not unknown:
            stats['untouched'].append((key, node))

        return new

    return node


def main() -> int:
    path = sys.argv[1]
    locale = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].startswith('--') else 'dk'
    write = '--write' in sys.argv

    rules = dict(LOCALES[locale])
    rules['probe'] = re.compile('|'.join(re.escape(w) for w in rules['inflections']), re.I)

    source = open(path, encoding='utf-8').read()
    data = json.loads(source)

    total = sum(1 for _, v in walk(data) if rules['probe'].search(v))
    stats = {'converted': [], 'kept': [], 'unknown': [], 'untouched': [], 'compounds': []}
    result = rewrite(data, rules, stats=stats)

    print(f'{path} [{locale}]: {total} strings contain the word')
    print(f'  converted        {len(stats["converted"])}')
    print(f'  kept literal     {len(stats["kept"])}')
    print(f'  untouched        {len(stats["untouched"])}')
    accounted = len(stats['converted']) + len(stats['kept']) + len(stats['untouched'])
    print(f'  accounted for    {accounted} of {total}')

    if stats['compounds']:
        forms = Counter(stats['compounds'])
        print(f'  compounds        {len(forms)} distinct: ' + ', '.join(list(forms)[:8]))

    if stats['unknown']:
        forms = Counter(w for _, w in stats['unknown'])
        print('\n  UNKNOWN WORD FORMS, nothing written:')
        for form, count in forms.most_common():
            print(f'    {count:4}  {form}')

        return 1

    if stats['untouched']:
        print('\n  untouched:')
        for key, value in stats['untouched'][:6]:
            print(f'    {key} = {value[:70]}')

    if not write:
        print('\n  sample:')
        for key, old, new in stats['converted'][:4]:
            print(f'    {key}\n      - {old[:84]}\n      + {new[:84]}')
        print('\n  dry run, pass --write to apply')

        return 0

    rendered = json.dumps(result, ensure_ascii=False, indent=4) + '\n'
    open(path, 'w', encoding='utf-8').write(rendered)
    print(f'\n  written, {len(rendered) - len(source):+d} bytes')

    return 0


if __name__ == '__main__':
    raise SystemExit(main())
