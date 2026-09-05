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
