export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')

    const headers: Record<string, string> = {}
    if (authorization) {
        headers.Authorization = authorization
    }

    try {
        const formData = await readFormData(event)
        try {
            for (const entry of formData.entries()) {
                const [k, v] = entry as any
                if (v && v.name) {

                } else {

                }
            }
        } catch (e) {

        }

        const response = await $fetch('/user/google-drive/upload', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers,
            body: formData,
        })

        try {
            const respString = typeof response === 'string' ? response : JSON.stringify(response)
        } catch (e) {
        }

        return response
    } catch (error: any) {
        console.error('Error uploading to Google Drive:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to upload file to Google Drive',
        })
    }
})
