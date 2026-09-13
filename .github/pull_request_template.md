> # TEST FIRST BEFORE DEPLOY TO MAIN
> No CI gates this repo yet. If this branch has not been run, it has not been tested.
> Fill in **Verified** below with what you actually ran. "Should work" is not a verification.

## What

## Why

## Backend dependency

Merge order: `citizenone-backend#<PR>` before this one. Or: none.

The backend PR merges first, always. A client feature whose endpoint is not on the backend's
deployed branch will ship broken, silently.

- [ ] No backend change needed
- [ ] Backend PR linked above, and it is merged or queued ahead of this one

## Enforcement

- [ ] This PR adds no gate
- [ ] This PR adds a gate, **and the backend enforces it too** (linked above)

A hidden nav item, a `v-if`, or a route middleware in this repo is not a security control. There is
no global auth middleware here: session validity is only discovered when a request 401s, and
`companyHasModule()` fails open on an empty module list.

## Types

- [ ] No new `any` in `components/api/`
- [ ] New service methods return a real type

## i18n

- [ ] No user-facing string added
- [ ] String added to **all four** locale files: `lang/dk.json`, `en.json`, `no.json`, `sv.json`
- [ ] Citizen-facing wording uses the terminology links (`@:terms.*`), not a hardcoded "borger"

## Verified

Ran:

```
```

Not run:

## Checklist

- [ ] Targets `dev`, not `main`
- [ ] Branch is up to date with `dev`
- [ ] No production data, PII or customer names in the diff or in this description
- [ ] Built on Node 22 with the pinned pnpm
