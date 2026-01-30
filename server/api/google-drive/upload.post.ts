export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')
    
    const headers: Record<string, string> = {}
    if (authorization) {
        headers.Authorization = authorization
    }

    try {
        const formData = await readFormData(event)
        
        return await $fetch('/google-drive/upload', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers,
            body: formData,
        })
    } catch (error: any) {
        console.error('Error uploading to Google Drive:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to upload file to Google Drive',
        })
    }
})
