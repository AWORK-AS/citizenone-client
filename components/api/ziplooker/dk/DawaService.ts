import type ZipLooker from "../ZipLookerService";

class DawaService implements ZipLooker {
    async lookupZipCode(zip: string): Promise<any> {
        if (!zip || zip.length < 4) return null
        
        try {
            const response = await $fetch(`https://api.dataforsyningen.dk/postnumre/${zip}`)
            return response
        } catch (error: any) {
            if (error.response?.status !== 404) {
                console.error('Error fetching data from DAWA:', error)
            }
            return null
        }
    }

    async getQuickAddress(zip: string) {
        const data = await this.lookupZipCode(zip)
        
        if (data && data.kommuner.length > 0) {
            const primaryMuni = data.kommuner[0].kode
            
            const muniDetails = await $fetch(`https://api.dataforsyningen.dk/kommuner/${primaryMuni}`) as any
            const region = muniDetails.region.navn.split(" ")[1]
            const city = data.navn.split(" ")[0]

            return {
                city: city,     
                municipality: data.kommuner[0].navn,
                region: region,
                fullData: data
            }
        }
        
        return null
    }

}

export const dawaService = new DawaService()
