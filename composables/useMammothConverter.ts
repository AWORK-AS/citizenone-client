import mammoth from 'mammoth'

export const useMammothConverter = () => {
    const convertDocxToHtml = async (fileData: ArrayBuffer | Blob): Promise<string> => {
        try {
            let arrayBuffer: ArrayBuffer
            if (fileData instanceof Blob) {
                arrayBuffer = await fileData.arrayBuffer()
            } else {
                arrayBuffer = fileData
            }

            const result = await mammoth.convertToHtml(
                { arrayBuffer },
                {
                    includeDefaultStyleMap: true,
                    styleMap: [
                        // Preserve underline (by default Mammoth ignores it)
                        "u => u",
                        // Heading mappings
                        "p[style-name='Heading 1'] => h1:fresh",
                        "p[style-name='Heading 2'] => h2:fresh",
                        "p[style-name='Heading 3'] => h3:fresh",
                        "p[style-name='Heading 4'] => h4:fresh",
                        "p[style-name='Heading 5'] => h5:fresh",
                        "p[style-name='Heading 6'] => h6:fresh",
                        "p[style-name='heading 1'] => h1:fresh",
                        "p[style-name='heading 2'] => h2:fresh",
                        "p[style-name='heading 3'] => h3:fresh",
                        "p[style-name='heading 4'] => h4:fresh",
                        "p[style-name='heading 5'] => h5:fresh",
                        "p[style-name='heading 6'] => h6:fresh",
                    ],
                    convertImage: mammoth.images.imgElement((image) => {
                        return image.read("base64").then((imageBuffer) => {
                            return {
                                src: `data:${image.contentType};base64,${imageBuffer}`
                            }
                        })
                    })
                }
            )

            if (result.messages.length > 0) {
                console.warn('Mammoth conversion warnings:', result.messages)
            }

            // Note: Mammoth.js does not preserve font-family, font-size, or text-align
            // These are fundamental limitations of the library
            // The DOCX/PDF output will have these styles, but they won't be preserved when re-opening
            // console.warn('⚠️ Font styles (family, size, alignment) are not preserved by Mammoth.js when reading DOCX files')

            return result.value
        } catch (error) {
            console.error('Error converting DOCX to HTML with Mammoth:', error)
            throw new Error('Failed to convert document. Please try again.')
        }
    }

    return {
        convertDocxToHtml
    }
}
