export function useGtag() {
    const gtagReportConversion = (url: any) => {
        const callback = () => {
            if (typeof url !== 'undefined') {
                window.location = url
            }
        }

        if (typeof window.gtag !== 'undefined') {
            window.gtag('event', 'conversion', {
                send_to: 'AW-16858750370/fKRlCNrJ0J8aEKK78OY-',
                value: 1.0,
                currency: 'DKK',
                event_callback: callback
            })
            window.gtag('event', 'conversion', {
                send_to: 'AW-16858750370/H2tyCMiC-LAbEKK78OY-',
                value: 1.0,
                currency: 'DKK',
                event_callback: callback
            })
        } else {
            console.warn("Google Tag Manager (gtag) not initialized.")
            callback() // Fallback in case gtag is not available
        }

        return false
    };

    return { gtagReportConversion }
}
