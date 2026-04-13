import { useUserStore } from "~/store/user"
import { dawaService } from "./dk/DawaService"

class ZipLookerService {
    findCityRegionMunicipality(zip: string): Promise<any> {
        const userStore = useUserStore() as any
        const userCountryCode = userStore.getUser?.country?.iso_2

        return ZipLookerFactory.getZipLooker(userCountryCode).getQuickAddress(zip)
    }
}

export const zipLookerService = new ZipLookerService()

class ZipLookerFactory {
    static getZipLooker(country: string): ZipLooker {
        switch (country) {
            case 'DK':
                return dawaService
            default:
                throw new Error('Invalid country')
        }
    }
}

export default interface ZipLooker{
    lookupZipCode(zip: string): Promise<any>

    //For Consistency:
    //Always return city, municipality, and region
    //OPTIONAL: fullData 
    getQuickAddress(zip: string): Promise<any> 
}
