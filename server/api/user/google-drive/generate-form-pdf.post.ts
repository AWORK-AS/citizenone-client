export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
    }
    if (authorization) {
        headers.Authorization = authorization
    }

    try {
        const body = await readBody(event)

        const response = await $fetch('/user/google-drive/generate-form-pdf', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers,
            body,
            responseType: 'blob',
        })

        // Set response headers for PDF download
        setResponseHeader(event, 'Content-Type', 'application/pdf')

        return response
    } catch (error: any) {
        console.error('Error generating form PDF:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to generate form PDF',
        })
    }
})
