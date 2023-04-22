import fs from "fs"
import path from "path"
import semver from "semver"
import fetch from "node-fetch"

import { Plugin } from "../../leeft"
import { findFilesRecursively } from "../../plugin-helper"

const getNodeVersions = async (): Promise<string[]> => {
    const response = await fetch("https://nodejs.org/dist/index.json")
    const releases = await response.json()
    if (Array.isArray(releases) && releases.length) {
        return releases.map((release: { version: string }) => release.version.substring(1)) // Remove the "v" prefix
    } else {
        console.error("Invalid or non-existent Node.js version provided.")
    }
}

const updateDockerfile = (dockerfilePath: string, nodeVersion: string) => {
    console.log(`Updating ${dockerfilePath}`)
    const content = fs.readFileSync(dockerfilePath, "utf8")
    const updatedContent = content.replace(/FROM node:(\d+|\d+\.\d+|\d+\.\d+\.\d+)/, `FROM node:${nodeVersion}`)
    fs.writeFileSync(dockerfilePath, updatedContent)
}

const updatePackageJson = (packageJsonPath: string, nodeVersion: string) => {
    console.log(`Updating ${packageJsonPath}`)
    const content = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"))
    content.engines = content.engines || {}
    content.engines.node = nodeVersion
    fs.writeFileSync(packageJsonPath, JSON.stringify(content, null, 2))
}

const updateNvmrc = (nvmrcPath: string, nodeVersion: string) => {
    console.log(`Updating ${nvmrcPath}`)
    fs.writeFileSync(nvmrcPath, nodeVersion)
}

const updateGithubActions = (workflowPath: string, nodeVersion: string) => {
    console.log(`Updating ${workflowPath}`)
    const content = fs.readFileSync(workflowPath, "utf8")
    const updatedContent = content.replace(/node-version: (\d+|\d+\.\d+|\d+\.\d+\.\d+)/, `node-version: ${nodeVersion}`)
    fs.writeFileSync(workflowPath, updatedContent)
}

const leeftNodeUpdate: Plugin = {
    command: "node update",
    description: "Update Node.js version in Dockerfile, package.json, .nvmrc, and GitHub Actions",
    execute: async (nodeVersion: string = "latest") => {
        const availableNodeVersions = await getNodeVersions()
        console.log(">>>", availableNodeVersions)

        if (nodeVersion === "latest") {
            nodeVersion = availableNodeVersions[0]
        } else if (!semver.valid(nodeVersion) || !availableNodeVersions.includes(nodeVersion)) {
            console.error("Invalid or non-existent Node.js version provided.")
            return
        }

        const projectRoot = process.cwd()

        // Update Dockerfile
        const dockerfiles = findFilesRecursively(projectRoot, "Dockerfile")
        dockerfiles.forEach((dockerfilePath) => {
            updateDockerfile(dockerfilePath, nodeVersion)
        })

        // Update package.json
        const packageJsonFiles = findFilesRecursively(projectRoot, "package.json")
        packageJsonFiles.forEach((packageJsonPath) => {
            updatePackageJson(packageJsonPath, nodeVersion)
        })

        // Update .nvmrc
        const nvmrcFiles = findFilesRecursively(projectRoot, ".nvmrc")
        nvmrcFiles.forEach((nvmrcPath) => {
            updateNvmrc(nvmrcPath, nodeVersion)
        })

        // Update GitHub Actions
        const workflowFolders = findFilesRecursively(
            projectRoot,
            "workflows",
            []
        ).filter((dir) => dir.includes(".github"))
        workflowFolders.forEach((workflowFolder) => {
            const workflowFiles = fs.readdirSync(workflowFolder)
            workflowFiles.forEach((file) => {
                if (file.endsWith(".yml") || file.endsWith(".yaml")) {
                    const workflowPath = path.join(workflowFolder, file)
                    updateGithubActions(workflowPath, nodeVersion)
                }
            })
        })

        console.log(`Node.js version updated to ${nodeVersion} in the project files.`)
    },
}

export default leeftNodeUpdate 
