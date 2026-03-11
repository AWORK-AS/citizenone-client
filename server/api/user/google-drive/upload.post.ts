export default defineEventHandler(async (event) => {
    const runtimeConfig = useRuntimeConfig()
    const authorization = getHeader(event, 'authorization')

    const headers: Record<string, string> = {}
    if (authorization) {
        headers.Authorization = authorization
    }

    try {
        const formData = await readFormData(event)

        console.log('Proxy /api/user/google-drive/upload - incoming authorization:', authorization)
        try {
            for (const entry of formData.entries()) {
                const [k, v] = entry as any
                if (v && v.name) {
                    console.log('formData entry:', k, 'fileName=', v.name)
                } else {
                    console.log('formData entry:', k, 'value=', v)
                }
            }
        } catch (e) {
            console.log('Could not iterate formData entries', e)
        }

        console.log('Proxy /api/user/google-drive/upload - forwarding headers:', headers)

        const response = await $fetch('/user/google-drive/upload', {
            baseURL: runtimeConfig.public.apiBaseURL,
            method: 'POST',
            headers,
            body: formData,
        })

        try {
            const respString = typeof response === 'string' ? response : JSON.stringify(response)
            console.log('Proxy /api/user/google-drive/upload - backend response (truncated):', respString.substring(0, 2000))
        } catch (e) {
            console.log('Proxy /api/user/google-drive/upload - could not stringify backend response', e)
        }

        console.log('Proxy /api/user/google-drive/upload - backend response received')
        return response
    } catch (error: any) {
        console.error('Error uploading to Google Drive:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to upload file to Google Drive',
        })
    }
})
