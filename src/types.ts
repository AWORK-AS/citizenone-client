export interface Error {
    message?: string
    errors?: {
        [key: string]: string[];
    }
}