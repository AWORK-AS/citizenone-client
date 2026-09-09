// Opens an already-downloaded document Blob in a new browser tab instead of
// saving it to disk (file-saver's saveAs). The object URL is revoked after a
// short delay so the tab has time to load it before the memory is freed.
export function documentBlobViewer() {
    function openBlobInNewTab(blob: Blob): boolean {
        const url = URL.createObjectURL(blob)
        const opened = window.open(url, '_blank')
        setTimeout(() => URL.revokeObjectURL(url), 60_000)
        return !!opened
    }

    return {
        openBlobInNewTab,
    }
}
