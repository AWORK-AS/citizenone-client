/**
 * True only inside the Electron desktop shell (set by its preload bridge) -
 * undefined/false in a regular browser tab. Shared here since more than one
 * screen needs it (the desktop-fixed sidebar in layouts/user.vue, and any
 * page that promotes "get the app" - that promo makes no sense to a user
 * already running the dedicated desktop app).
 */
export function useIsDesktopApp(): boolean {
    return !!(typeof window !== 'undefined' && (window as any).citizenOneDesktop?.isDesktop)
}

/**
 * "darwin" / "win32" / "linux" inside the desktop shell, undefined in a
 * browser tab. Never changes after launch, so callers can read it once
 * (e.g. into a plain const) rather than treating it as reactive state.
 */
export function useDesktopPlatform(): string | undefined {
    if (typeof window === 'undefined') return undefined
    return (window as any).citizenOneDesktop?.platform
}

/** Opens `path` in a new, independent desktop window. No-op outside the
 *  desktop shell - callers gate the button itself on useIsDesktopApp(). */
export function openInNewDesktopWindow(path: string): void {
    if (typeof window === 'undefined') return
    ;(window as any).citizenOneDesktop?.openInNewWindow(path)
}

/** Reports a citizen/chat visit for the Dock's "Seneste" (recently viewed)
 *  menu. Fire-and-forget, no-op outside the desktop shell. */
export function reportRecentDesktopItem(item: { type: string; uuid: string; label: string }): void {
    if (typeof window === 'undefined') return
    ;(window as any).citizenOneDesktop?.reportRecentItem(item)
}
