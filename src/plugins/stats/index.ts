import fs from "node:fs"
import path from "node:path"

import { Plugin } from "../../leeft"

function findPackageJsonFiles(directoryPath: string): string[] {
  const files = fs.readdirSync(directoryPath)

  let packageJsonFiles: string[] = []

  files.forEach((file) => {
    const filePath = path.join(directoryPath, file)
    const stats = fs.statSync(filePath)

    if (stats.isDirectory() && file !== "node_modules") {
      packageJsonFiles = packageJsonFiles.concat(findPackageJsonFiles(filePath))
    } else if (stats.isFile() && file === "package.json") {
      packageJsonFiles.push(filePath)
    }
  })

  return packageJsonFiles
}

type Result = { file: string; value: string }
type Results = [Result?]

function findPackageJsons(
  attribute: string,
  callback: (results: Results) => void,
) {
  const packageJsonFiles = findPackageJsonFiles(process.cwd())

  const results: Results = []

  packageJsonFiles.forEach((file) => {
    const packageJson = JSON.parse(fs.readFileSync(file, "utf-8"))
    const value = packageJson[attribute]

    if (value) {
      results.push({ file, value })
    }
  })

  callback(results)
}



const leeftStats: Plugin = {
  command: "stats",
  description: "Find statuses about your monorepo",
  execute: () => { 
    findPackageJsons("name", (results) => {
      console.log("Packages: ", results.length)
    })
  }
}

export default leeftStats
