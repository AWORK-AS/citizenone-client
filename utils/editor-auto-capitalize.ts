import { Plugin, TextWatcher } from 'ckeditor5'
import { shouldCapitalizeLastLetter } from '@/utils/auto-capitalize'

/**
 * CKEditor 5 plugin applying `shouldCapitalizeLastLetter` while typing.
 *
 * The capital is written in its own change, so Ctrl+Z right after it brings
 * the lowercase letter back when it was meant to stay lowercase. Pasted,
 * dictated and AI-inserted text is left exactly as it is - only typing
 * triggers it. The editable also gets `autocapitalize="sentences"`, so phone
 * and tablet keyboards open each sentence in capitals on their own.
 */
export class AutoCapitalize extends Plugin {
    static get pluginName() {
        return 'AutoCapitalize' as const
    }

    init() {
        const editor = this.editor
        const model = editor.model
        const watcher = new TextWatcher(model, shouldCapitalizeLastLetter)

        watcher.on('matched:data', (evt: any, data: any) => {
            // Rewriting text in the middle of an IME composition (Android
            // keyboards compose every word) would break the composition; the
            // keyboard's own autocapitalize covers those devices.
            if (!data.batch.isTyping || editor.editing.view.document.isComposing) {
                return
            }

            const range = model.createRange(data.range.end.getShiftedBy(-1), data.range.end)
            const letter = range.getItems().next().value as any

            if (!letter?.is('$textProxy')) {
                return
            }

            const upper = letter.data.toLocaleUpperCase()

            if (upper === letter.data) {
                return
            }

            model.enqueueChange(writer => {
                model.insertContent(writer.createText(upper, letter.getAttributes()), range)
            })
        })

        editor.on('ready', () => {
            editor.editing.view.change(writer => {
                for (const root of editor.editing.view.document.roots) {
                    writer.setAttribute('autocapitalize', 'sentences', root)
                }
            })
        })
    }
}
