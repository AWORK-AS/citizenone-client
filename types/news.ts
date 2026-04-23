export interface NewsAuthor {
    uuid: string,
    firstName: string,
    lastName: string
}

export interface NewsForm {
    image: string,
    title: string,
    link: string,
    content: string,
    is_featured: boolean,
    is_active: boolean,
    audience: any,
    department: any,
    attachments: any[]
}

export interface NewsItem {
    uuid: string,
    title: string,
    content: string,
    preview: string,
    link: string | null,
    button: string | null,
    image: string | null,
    is_featured: boolean,
    is_active: boolean,
    author: NewsAuthor,
    created_at: string,
    updated_at: string,
    audiences: any[],
    departments: any[],
    attachments: any[]
}