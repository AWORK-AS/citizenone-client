/**
 * Label for a folder in a picker. Folders that share a name ("Contracts" under
 * both HR and Finance) are told apart by their full path, which the document
 * list endpoints send as `folder_path` (the folders above it, null at the root).
 */
export function folderOptionLabel(folder: { name: string; folder_path?: string | null }): string {
    return folder.folder_path ? `${folder.folder_path} / ${folder.name}` : folder.name
}
