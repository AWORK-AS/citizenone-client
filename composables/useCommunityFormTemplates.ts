import { formService } from '@/components/api/user/FormService'

// Templates shared with the CitizenOne community appear in the template pickers
// next to the company's own forms. Their option values carry this prefix; picking
// one imports it into the company once, and from then on it is a normal form.
const COMMUNITY_PREFIX = 'community:'

export function isCommunityTemplateValue(value: unknown): boolean {
    return typeof value === 'string' && value.startsWith(COMMUNITY_PREFIX)
}

export async function fetchCommunityTemplateOptions(): Promise<{ value: string, label: string }[]> {
    const response = await formService.getCommunityTemplates()
    return (response?.data ?? []).map((template: any) => ({
        value: `${COMMUNITY_PREFIX}${template.uuid}`,
        label: template.title,
    }))
}

// Returns the uuid of a form the company owns: the picked form itself, or the
// company's new copy of a picked community template.
export async function resolvePickedFormUuid(value: string): Promise<string> {
    if (!isCommunityTemplateValue(value)) return value
    const response = await formService.importCommunityTemplate(value.slice(COMMUNITY_PREFIX.length))
    return response?.data?.uuid ?? ''
}
