import { useI18n } from 'vue-i18n'

/**
 * A ready-made consent form a clinic can create in one click and then edit in Forms like any
 * other. Built from the clinic's language at the moment it is created; after that it is the
 * clinic's own form.
 *
 * Asked for by a tattoo clinic that needs consent before the appointment, so it covers what a
 * typical consent form for a skin treatment asks: who the customer is, the treatment, the health
 * questions that matter, the risks, aftercare and a typed signature. Each confirmation is its own
 * required checkbox, so none of them can be skipped by ticking another.
 */
export function useConsentFormTemplate() {
    const { t } = useI18n()

    function field(key: string, extra: object = {}) {
        return { value: t(`patientForms.consentTemplate.fields.${key}`), ...extra }
    }

    function options(...keys: string[]) {
        return keys.map((key) => t(`patientForms.consentTemplate.options.${key}`))
    }

    function build() {
        return {
            title: t('patientForms.consentTemplate.title'),
            description: t('patientForms.consentTemplate.description'),
            is_active: true,
            is_follow_up_enabled: false,
            layout_mode: 'classic',
            show_numbering: true,
            fields: [
                { type: 'paragraph', ...field('intro') },
                { type: 'subheading', ...field('aboutYou') },
                { type: 'textfield', required: true, ...field('fullName') },
                { type: 'datefield', required: true, ...field('birthday') },
                { type: 'textfield', required: false, ...field('phone') },
                { type: 'subheading', ...field('treatment') },
                { type: 'textfield', required: false, ...field('treatmentDescription') },
                { type: 'datefield', required: false, ...field('appointmentDate') },
                { type: 'subheading', ...field('health') },
                { type: 'choice', required: true, options: options('yes', 'no'), ...field('adult') },
                {
                    type: 'checkbox',
                    required: false,
                    options: options('allergies', 'diabetes', 'epilepsy', 'heart', 'bloodThinners', 'skin', 'pregnant', 'alcohol'),
                    ...field('conditions'),
                },
                { type: 'textarea', required: false, ...field('conditionsDetails') },
                { type: 'subheading', ...field('consent') },
                { type: 'paragraph', ...field('risks') },
                { type: 'checkbox', required: true, options: options('understoodRisks'), ...field('confirmRisks') },
                { type: 'checkbox', required: true, options: options('understoodAftercare'), ...field('confirmAftercare') },
                { type: 'checkbox', required: true, options: options('truthful'), ...field('confirmTruthful') },
                { type: 'choice', required: false, options: options('yes', 'no'), ...field('photos') },
                { type: 'textfield', required: true, ...field('signature') },
            ],
        }
    }

    return { build }
}
