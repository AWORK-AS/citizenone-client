// plugins/zoho-salesiq.client.ts

export default defineNuxtPlugin(() => {
    if (process.client) {
        // Define the Zoho SalesIQ type
        interface ZohoSalesIQ {
            widgetcode: string
            values: Record<string, any>
            ready: () => void
        }

        // Ensure the global $zoho object exists
        (window as any).$zoho = (window as any).$zoho || {}

        // Initialize Zoho SalesIQ object
        const $zoho: { salesiq?: ZohoSalesIQ } = (window as any).$zoho
        $zoho.salesiq = $zoho.salesiq || {
            widgetcode: "siq54763692a8cafd42c20535ec5f604811a321fe572529152c720e06cdf894b6b7",
            values: {},
            ready: function () { }
        }

        // Create and append the script element
        const d = document
        const s = d.createElement("script")
        s.type = "text/javascript"
        s.id = "zsiqscript"
        s.defer = true
        s.src = "https://salesiq.zohopublic.eu/widget"
        const t = d.getElementsByTagName("script")[0]

        if (t && t.parentNode) {
            t.parentNode.insertBefore(s, t)
        } else {
            console.error("Failed to insert Zoho SalesIQ script: parent node not found.")
        }
    }
})
