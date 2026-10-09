import { useI18n } from 'vue-i18n'

const CARE_AREAS: Array<[string, string]> = [
    ['functional_level', 'functionalLevel'],
    ['musculoskeletal_system', 'musculoskeletalSystem'],
    ['nutrition', 'nutrition'],
    ['skin_and_mucous_membranes', 'skinAndMucousMembranes'],
    ['communication', 'communication'],
    ['psychosocial_conditions', 'psychosocialConditions'],
    ['respiration_and_circulation', 'respirationAndCirculation'],
    ['sexuality', 'sexuality'],
    ['pain_and_sensory_impressions', 'painAndSensoryImpressions'],
    ['sleep_and_rest', 'sleepAndRest'],
    ['knowledge_and_development', 'knowledgeAndDevelopment'],
    ['excretion_of_waste', 'excretionOfWaste'],
]

export function careAreaOptions(t?: (key: string) => string): Array<{ value: string, label: string }> {
    const translate = t ?? useI18n().t
    return CARE_AREAS.map(([value, key]) => ({
        value,
        label: translate(`citizens.treatments.form.areaTypes.${key}`),
    }))
}

export function careAreaLabel(key: string | null | undefined, t?: (key: string) => string): string {
    return careAreaOptions(t).find((o) => o.value === key)?.label ?? ''
}
