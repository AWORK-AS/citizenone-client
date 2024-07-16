export interface ContactUsError {
    message?: string;
    errors?: {
        [key: string]: string[];
    };
}