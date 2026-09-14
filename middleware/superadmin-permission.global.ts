import { useUserStore } from '@/store/user'
import { userService } from '@/components/api/superadmin/UserService'
import { superadminNavItemForPath, useSuperadminNav } from '@/composables/useSuperadminNav'

/**
 * Holder en superadmin-side lukket for den kollega der ikke må se den.
 *
 * Menuen skjuler punktet, og det er ikke en adgangskontrol: den kollega der kender
 * adressen, har den i historikken eller har den som bogmærke, kommer ind på siden. Data
 * er beskyttet - hver rute i API'et navngiver sin rettighed - men resultatet er en side
 * fuld af 403'er frem for et svar, og det ser ud som en fejl i systemet.
 *
 * Global frem for `definePageMeta` på hver af de 17 sider. Rettigheden slås op i
 * `useSuperadminNav`, som også bygger menuen, så der er ét sted der ved hvad et område
 * kræver. Et `definePageMeta` pr. side ville være det samme svar skrevet to gange, og
 * den ene af dem bliver glemt når en side flyttes.
 *
 * En kollega der bliver afvist sendes til det første område de faktisk har - ikke til
 * /superadmin/dashboard, som en bogholder ikke må se.
 */
export default defineNuxtRouteMiddleware(async (to) => {
    if (!to.path.startsWith('/superadmin')) {
        return
    }

    const item = superadminNavItemForPath(to.path)

    if (!item?.permission) {
        return
    }

    const userStore = useUserStore() as any

    // På en kold navigation har layoutets eget kald ikke kørt endnu - det sker i
    // onMounted, altså efter route-middleware - så uden dette afviser vi en kollega der
    // har adgang, hver gang de åbner en side direkte.
    if (!userStore.getUser?.uuid) {
        try {
            const response = await userService.getCurrentUser()

            if (response?.data) {
                userStore.setUser(response.data)
            }
        } catch {
            // Et uautentificeret kald falder igennem til afvisningen nedenfor, hvilket
            // er hvor det skal ende alligevel.
        }
    }

    const { can, isPlatformStaff } = usePermissions()

    // En kunde-bruger hører slet ikke i panelet, og det er login der afgør det. Her
    // ville en afvisning sende dem rundt i /superadmin frem for ud af det.
    if (!isPlatformStaff()) {
        return
    }

    if (can(item.permission)) {
        return
    }

    const { firstAllowedHref } = useSuperadminNav()
    const fallback = firstAllowedHref.value

    if (!fallback || fallback === to.path) {
        // Ingen områder overhovedet: en rolle uden et enkelt hak. Panelet har ingen
        // side at vise, og en redirect til sig selv er en løkke.
        return
    }

    return navigateTo(fallback)
})
