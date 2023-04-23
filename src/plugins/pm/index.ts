import fs from "node:fs"
import path from "node:path"
import { execSync } from "node:child_process"

const packageManagers = [
  { name: "yarn", lockFile: "yarn.lock" },
  { name: "pnpm", lockFile: "pnpm-lock.yaml" },
  { name: "npm", lockFile: "package-lock.json" },
]
const readPackageJson = (projectPath: string): Record<string, any> | null => {
  const packageJsonPath = path.join(projectPath, "package.json")

  if (fs.existsSync(packageJsonPath)) {
    const packageJsonContent = fs.readFileSync(packageJsonPath, "utf-8")
    return JSON.parse(packageJsonContent)
  }

  return null
}
const detectFromPackageManagerProperty = (packageJson: Record<string, any>): string | null => {
  if (packageJson.packageManager) {
    return packageJson.packageManager
  }

  return null
}
const detectFromEnginesProperty = (packageJson: Record<string, any>): string[] => {
  const results: string[] = []

  if (packageJson.engines) {
    packageManagers.forEach((pm) => {
      if (packageJson.engines[pm.name]) {
        let version: string | undefined
        try {
          version = execSync(`${pm.name} -v`).toString().trim()
        } catch (error) {
          version = "undefined"
        }

        results.push(`${pm.name} v${version}`)
      }
    })
  }

  return results
}
const detectFromLockFiles = (projectPath: string): string[] => {
  const results: string[] = []

  packageManagers.forEach((pm) => {
    if (fs.existsSync(path.join(projectPath, pm.lockFile))) {
      let version: string | undefined
      try {
        version = execSync(`${pm.name} -v`).toString().trim()
      } catch (error) {
        version = "undefined"
      }

      results.push(`${pm.name} v${version}`)
    }
  })

  return results
}
const detectPackageManager = (projectPath: string): string[] => {
  const results: string[] = []
  const packageJson = readPackageJson(projectPath)

  if (packageJson) {
    const packageManagerPropertyResult = detectFromPackageManagerProperty(packageJson)
    if (packageManagerPropertyResult) {
      results.push(packageManagerPropertyResult)
      return results
    }

    const enginesPropertyResults = detectFromEnginesProperty(packageJson)
    if (enginesPropertyResults.length > 0) {
      return enginesPropertyResults
    }
  }

  const lockFileResults = detectFromLockFiles(projectPath)
  if (lockFileResults.length > 0) {
    return lockFileResults
  }

  const possibleManagers = packageManagers.map(pm => pm.name).join(', ')
  results.push(`undefined (possibly ${possibleManagers})`)

  return results
}

const packageManagerPlugin = {
  command: "pm",
  description: "Detect package manager and version",
  execute: () => {
    const projectPath = process.cwd()
    const detectedPMs = detectPackageManager(projectPath)
    console.log("Package Manager(s):")
    detectedPMs.forEach(pm => console.log(`- ${pm}`))
  },
}

export default packageManagerPlugin