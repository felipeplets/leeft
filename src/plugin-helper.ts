import fs from "fs"
import path from "path"

const ignoreList = ["node_modules"]

const findFilesRecursively = (
    directory: string,
    filename: string,
    files: string[] = []
): string[] => {
    const entries = fs.readdirSync(directory, { withFileTypes: true })

    entries.forEach((entry) => {
        const fullPath = path.join(directory, entry.name)

        if (entry.isFile() && entry.name === filename) {
            files.push(fullPath)
        } else if (entry.isDirectory() && !ignoreList.includes(entry.name)) {
            findFilesRecursively(fullPath, filename, files)
        }
    })

    return files
}

export { findFilesRecursively }