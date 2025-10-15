export function fileHelper() {
    function getFileExtension(url: string): string {
        const fileName = url?.split('/')?.pop() // Extract file name from URL
        if (fileName) {
            const ext = fileName?.split('.')?.pop()?.toLowerCase() // Get the file extension
            return ext || ''
        }
        return ''
    }

    function isImage(url: string): boolean {
        const ext = getFileExtension(url)
        return ['jpg', 'jpeg', 'png', 'gif'].includes(ext)
    }

    function isExcel(url: string): boolean {
        const ext = getFileExtension(url)
        return ext === 'xlsx' || ext === 'xls'
    }

    function isPdf(url: string): boolean {
        return getFileExtension(url) === 'pdf'
    }

    function isPpt(url: string): boolean {
        const ext = getFileExtension(url)
        return ext === 'pptx' || ext === 'ppt'
    }

    function isWord(url: string): boolean {
        const ext = getFileExtension(url)
        return ext === 'docx' || ext === 'doc'
    }

    return {
        isImage,
        isExcel,
        isPdf,
        isPpt,
        isWord,
    }
}