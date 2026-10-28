// Sign in right after the password is created, through the ordinary login.
//
// Setting the password used to end on the login form, where the new user typed
// the same email and password again. The setup page hands them to the login
// page instead, which runs its normal sign-in, so two-factor, the IP and device
// codes and "account not switched on yet" all apply exactly as when typed.
// In memory only (useState): never in the URL or in storage, gone on reload,
// and read once.
export interface PendingSignIn {
    email: string
    password: string
}

export function usePendingSignIn() {
    const pending = useState<PendingSignIn | null>('pendingSignIn', () => null)

    function hand(value: PendingSignIn) {
        pending.value = value
    }

    function take(): PendingSignIn | null {
        const value = pending.value
        pending.value = null
        return value
    }

    return { hand, take }
}
