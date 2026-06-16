// Lightweight, dependency-free confetti burst. Uses the Web Animations API and
// cleans up after itself, so there is no global CSS or leftover DOM.
export function useConfetti() {
    function celebrate(options?: { emojis?: string[]; count?: number; duration?: number }) {
        if (typeof document === 'undefined' || typeof window === 'undefined') return
        if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

        const emojis = options?.emojis ?? ['🎂', '🎉', '🎈', '✨', '🥳']
        const count = options?.count ?? 36
        const duration = options?.duration ?? 3000

        const container = document.createElement('div')
        container.style.cssText =
            'position:fixed;inset:0;pointer-events:none;z-index:9999;overflow:hidden'
        document.body.appendChild(container)

        const width = window.innerWidth
        const height = window.innerHeight

        for (let i = 0; i < count; i++) {
            const piece = document.createElement('div')
            piece.textContent = emojis[i % emojis.length]
            const size = 14 + Math.round((i % 5) * 4)
            const startX = (width / count) * i + ((i * 37) % 40) - 20
            piece.style.cssText =
                `position:absolute;top:-40px;left:${startX}px;font-size:${size}px;will-change:transform,opacity`

            container.appendChild(piece)

            const drift = ((i * 53) % 200) - 100
            const rotate = ((i * 91) % 720) - 360
            const delay = (i % 8) * 90
            const fall = duration - delay

            piece.animate(
                [
                    { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
                    { transform: `translate(${drift}px, ${height + 80}px) rotate(${rotate}deg)`, opacity: 1, offset: 0.85 },
                    { transform: `translate(${drift}px, ${height + 80}px) rotate(${rotate}deg)`, opacity: 0 },
                ],
                { duration: fall, delay, easing: 'cubic-bezier(.2,.6,.4,1)', fill: 'forwards' }
            )
        }

        window.setTimeout(() => container.remove(), duration + 400)
    }

    return { celebrate }
}
