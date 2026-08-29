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
INFLECTIONS: dict[str, tuple[str, str]] = {
    'Borgernes': ('citizensDefinite', 's'),
    'borgernes': ('citizensDefinite', 's'),
    'Borgerens': ('citizenDefinite', 's'),
    'borgerens': ('citizenDefinite', 's'),
    'Borgeres': ('citizens', 's'),
    'borgeres': ('citizens', 's'),
    'Borgers': ('citizen', 's'),
    'borgers': ('citizen', 's'),
    'Borgerne': ('citizensDefinite', ''),
    'borgerne': ('citizensDefinite', ''),
    'Borgeren': ('citizenDefinite', ''),
    'borgeren': ('citizenDefinite', ''),
    'Borgere': ('citizens', ''),
    'borgere': ('citizens', ''),
    'Borger': ('citizen', ''),
    'borger': ('citizen', ''),
}

# Compound tails seen in the file. Listed rather than matched by pattern so that
# a new compound fails the run instead of being guessed at: borgersundhed must
# split as borger + sundhed, and a suffix-first guess would read borger + s.
COMPOUND_TAILS: set[str] = {
    'adresse', 'børn', 'data', 'dokument', 'dokumentmappe', 'filer',
    'formular', 'hændelse', 'journal', 'kalender', 'kontakt', 'medicin',
    'medicinhistorik', 'mål', 'oplysninger', 'plan', 'protokol', 'pung',
    'sundhed', 'tilknytning', 'økonomi',
}

# Words that are not the citizen. statsborger is nationality.
NOT_THE_CITIZEN: set[str] = {'statsborger', 'Statsborger'}

# Keys left in plain Danish, with the reason.
KEEP_LITERAL: dict[str, str] = {
    'settings.company.form.termCitizen': 'labels the field that defines the word',
    'settings.company.form.termCitizenDefinite': 'labels the field that defines the word',
    'settings.company.form.termCitizens': 'labels the field that defines the word',
    'settings.company.form.termCitizensDefinite': 'labels the field that defines the word',
}

# Superadmin spans every tenant, so one tenant's word does not belong there.
KEEP_LITERAL_PREFIXES: tuple[str, ...] = ('superadmin.',)

WORD = re.compile(r'[A-Za-zÆØÅæøå]+')
Q = "'"


def link(term: str, tail: str, capitalise: bool) -> str:
    modifier = '@.capitalize:' if capitalise else '@:'
    return f'{modifier}terms.{term}{{{Q}{tail}{Q}}}'


def convert(value: str) -> tuple[str, int, list[str]]:
    """Return the rewritten string, how many words changed, and unknown forms."""
    changed = 0
    unknown: list[str] = []

    def replace(match: re.Match[str]) -> str:
        nonlocal changed
        word = match.group(0)
        if 'orger' not in word.lower():
            return word
        if word in NOT_THE_CITIZEN:
            return word
        if word in INFLECTIONS:
            term, tail = INFLECTIONS[word]
            changed += 1
            return link(term, tail, word[0].isupper())
        stem = re.match(r'([Bb])orger(.+)$', word)
        if stem and stem.group(2) in COMPOUND_TAILS:
            changed += 1
            return link('citizen', stem.group(2), word[0].isupper())
        unknown.append(word)
        return word

    return WORD.sub(replace, value), changed, unknown


def walk(node, prefix=''):
    if isinstance(node, dict):
        for key, child in node.items():
            yield from walk(child, f'{prefix}{key}.' if prefix or True else key)
    elif isinstance(node, str):
        yield prefix[:-1], node


def rewrite(node, prefix='', stats=None):
    if isinstance(node, dict):
        return {k: rewrite(v, f'{prefix}{k}.', stats) for k, v in node.items()}
    if isinstance(node, str):
        key = prefix[:-1]
        if 'orger' not in node.lower():
            return node
        if key in KEEP_LITERAL or key.startswith(KEEP_LITERAL_PREFIXES):
            stats['kept'].append(key)
            return node
        new, changed, unknown = convert(node)
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
    write = '--write' in sys.argv
    source = open(path, encoding='utf-8').read()
    data = json.loads(source)

    total = sum(1 for _, v in walk(data) if 'orger' in v.lower())
    stats = {'converted': [], 'kept': [], 'unknown': [], 'untouched': []}
    result = rewrite(data, stats=stats)

    print(f'{path}: {total} strings contain the citizen word')
    print(f'  converted        {len(stats["converted"])}')
    print(f'  kept literal     {len(stats["kept"])}')
    print(f'  untouched        {len(stats["untouched"])}')
    accounted = len(stats['converted']) + len(stats['kept']) + len(stats['untouched'])
    print(f'  accounted for    {accounted} of {total}')

    if stats['unknown']:
        forms = Counter(w for _, w in stats['unknown'])
        print('\n  UNKNOWN WORD FORMS, nothing written:')
        for form, count in forms.most_common():
            print(f'    {count:4}  {form}')
        return 1

    if stats['untouched']:
        print('\n  untouched, the word is only there as statsborger or similar:')
        for key, value in stats['untouched'][:10]:
            print(f'    {key} = {value[:70]}')

    if not write:
        print('\n  sample of the rewrite:')
        for key, old, new in stats['converted'][:6]:
            print(f'    {key}\n      - {old[:88]}\n      + {new[:88]}')
        print('\n  dry run, pass --write to apply')
        return 0

    rendered = json.dumps(result, ensure_ascii=False, indent=4) + '\n'
    open(path, 'w', encoding='utf-8').write(rendered)
    print(f'\n  written, {len(rendered) - len(source):+d} bytes')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
