export default defineEventHandler(async (event) => {
    const invoiceId = getQuery(event).invoiceId as string
    const token = getCookie(event, '_token') || getHeader(event, 'authorization')?.replace('Bearer ', '')
    
    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    if (!invoiceId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invoice ID is required'
        })
    }

    try {
        const config = useRuntimeConfig()
        const backendUrl = `${config.public.apiBaseURL}/stripe/invoices/${invoiceId}/pdf`
        
        // Call backend with redirect: manual to get the Location header
        const response = await fetch(backendUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
            redirect: 'manual'
        })

        let pdfUrl: string | null = null
        
        if (response.status === 301 || response.status === 302 || response.status === 307 || response.status === 308) {
            pdfUrl = response.headers.get('location')
        }

        if (!pdfUrl) {
            throw createError({
                statusCode: 500,
                statusMessage: 'No redirect URL received from backend'
            })
        }

        console.log('Downloading PDF from Stripe:', pdfUrl)

        // Download PDF from Stripe (server-to-server, no CORS issues)
        const pdfResponse = await fetch(pdfUrl, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        })

        if (!pdfResponse.ok) {
            throw createError({
                statusCode: pdfResponse.status,
                statusMessage: `Failed to download PDF from Stripe: ${pdfResponse.statusText}`
            })
        }

        const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer())
        
        if (!pdfBuffer || pdfBuffer.length === 0) {
            throw createError({
                statusCode: 500,
                statusMessage: 'PDF buffer is empty'
            })
        }

        console.log('PDF downloaded successfully, size:', pdfBuffer.length)

        // Set proper headers for PDF download
        const res = event.node.res
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Length', pdfBuffer.length)
        res.setHeader('Content-Disposition', `attachment; filename="receipt_${invoiceId}.pdf"`)
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
        
        res.write(pdfBuffer)
        res.end()
    } catch (error: any) {
        console.error('Error downloading PDF:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.message || 'Failed to download PDF'
        })
    }
})
