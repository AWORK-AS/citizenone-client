// Post-purchase tours for apps. Keyed by the app's generic_name; the success
// pages append ?tour=<key> to the app's setup route and the user layout opens
// the tour guide for any registered key. Add an entry here (plus i18n texts
// under appTours.<key>) to give the next app a tour.

export interface AppTourStep {
    icon: string
    titleKey: string
    textKey: string
}

export interface AppTour {
    steps: AppTourStep[]
}

const tours: Record<string, AppTour> = {
    surveys: {
        steps: [
            {
                icon: 'ph:clipboard-text',
                titleKey: 'appTours.surveys.step1.title',
                textKey: 'appTours.surveys.step1.text',
            },
            {
                icon: 'ph:paper-plane-tilt',
                titleKey: 'appTours.surveys.step2.title',
                textKey: 'appTours.surveys.step2.text',
            },
            {
                icon: 'ph:chart-line-up',
                titleKey: 'appTours.surveys.step3.title',
                textKey: 'appTours.surveys.step3.text',
            },
            {
                icon: 'ph:bell-ringing',
                titleKey: 'appTours.surveys.step4.title',
                textKey: 'appTours.surveys.step4.text',
            },
        ],
    },
}

export function useAppTours() {
    function getTour(appKey: string): AppTour | null {
        return tours[appKey] ?? null
    }

    return { getTour }
}
