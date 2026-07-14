// Validated screening instruments offered as quick-start survey templates.
// Scores are stored per option (index-aligned with options) and summed by the
// backend; score_ranges drive the interpretation label shown with a result.

const FREQUENCY_OPTIONS_4 = [
    'Slet ikke',
    'Adskillige dage',
    'Mere end halvdelen af dagene',
    'Næsten hver dag',
]

const FREQUENCY_SCORES_4 = ['0', '1', '2', '3']

const WHO5_OPTIONS = [
    'På intet tidspunkt',
    'Lidt af tiden',
    'Lidt mindre end halvdelen af tiden',
    'Lidt mere end halvdelen af tiden',
    'Det meste af tiden',
    'Hele tiden',
]

const WHO5_SCORES = ['0', '1', '2', '3', '4', '5']

function choiceQuestion(value: string, options: string[], scores: string[]) {
    return { type: 'choice', value, required: true, options: [...options], scores: [...scores] }
}

export interface SurveyTemplate {
    key: string
    name: string
    title: string
    description: string
    fields: any[]
    score_ranges: { from: number, to: number, label: string }[]
}

export const surveyTemplates: SurveyTemplate[] = [
    {
        key: 'gad7',
        name: 'GAD-7',
        title: 'GAD-7 - Generaliseret angst',
        description: 'Hvor ofte har du i løbet af de sidste 2 uger været generet af følgende problemer?',
        fields: [
            'Følt dig nervøs, ængstelig eller meget anspændt',
            'Ikke været i stand til at stoppe eller kontrollere din bekymring',
            'Bekymret dig for meget om forskellige ting',
            'Haft svært ved at slappe af',
            'Været så rastløs, at det har været svært at sidde stille',
            'Været let at irritere',
            'Følt dig bange, som om der ville ske noget forfærdeligt',
        ].map((value) => choiceQuestion(value, FREQUENCY_OPTIONS_4, FREQUENCY_SCORES_4)),
        score_ranges: [
            { from: 0, to: 4, label: 'Minimal angst' },
            { from: 5, to: 9, label: 'Mild angst' },
            { from: 10, to: 14, label: 'Moderat angst' },
            { from: 15, to: 21, label: 'Svær angst' },
        ],
    },
    {
        key: 'phq9',
        name: 'PHQ-9',
        title: 'PHQ-9 - Depression',
        description: 'Hvor ofte har du i løbet af de sidste 2 uger været generet af følgende problemer?',
        fields: [
            'Lille interesse eller glæde ved at gøre ting',
            'Nedtrykthed, depression eller håbløshed',
            'Problemer med at falde i søvn, sove igennem eller sove for meget',
            'Træthed eller mangel på energi',
            'Nedsat appetit eller overspisning',
            'Følt dig dårligt tilpas ved dig selv - eller følt at du er en fiasko eller har svigtet dig selv eller din familie',
            'Koncentrationsbesvær, fx når du læser avis eller ser fjernsyn',
            'Bevæget dig eller talt så langsomt, at andre kan have bemærket det - eller det modsatte: været så rastløs og urolig, at du har bevæget dig mere end sædvanligt',
            'Tanker om, at du ville være bedre stillet død, eller tanker om at gøre skade på dig selv',
        ].map((value) => choiceQuestion(value, FREQUENCY_OPTIONS_4, FREQUENCY_SCORES_4)),
        score_ranges: [
            { from: 0, to: 4, label: 'Ingen eller minimal depression' },
            { from: 5, to: 9, label: 'Mild depression' },
            { from: 10, to: 14, label: 'Moderat depression' },
            { from: 15, to: 19, label: 'Moderat svær depression' },
            { from: 20, to: 27, label: 'Svær depression' },
        ],
    },
    {
        key: 'who5',
        name: 'WHO-5',
        title: 'WHO-5 - Trivselsindeks',
        description: 'Angiv for hvert af de 5 udsagn, hvad der kommer tættest på, hvordan du har haft det i de sidste 2 uger. Råscoren (0-25) ganges med 4 for at få trivselsscoren på 0-100-skalaen.',
        fields: [
            'I de sidste 2 uger har jeg været glad og i godt humør',
            'I de sidste 2 uger har jeg følt mig rolig og afslappet',
            'I de sidste 2 uger har jeg følt mig aktiv og energisk',
            'I de sidste 2 uger er jeg vågnet frisk og udhvilet',
            'I de sidste 2 uger har min dagligdag været fyldt med ting, der interesserer mig',
        ].map((value) => choiceQuestion(value, WHO5_OPTIONS, WHO5_SCORES)),
        score_ranges: [
            { from: 0, to: 12, label: 'Lav trivsel - risiko for depression eller stressbelastning' },
            { from: 13, to: 25, label: 'God trivsel' },
        ],
    },
]
