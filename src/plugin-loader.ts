import fs from "fs"
import path from "path"
import { Leeft } from "./leeft"

const loadBuiltInPlugins = async (leeft: Leeft) => {
  const pluginFolder = path.join(__dirname, "plugins")
  const pluginFiles = fs.readdirSync(pluginFolder)

  for (let pluginFile of pluginFiles) {
    const pluginPath = path.join(pluginFolder, pluginFile)
    const plugin = (await import(pluginPath)).default
    leeft.registerPlugin(plugin)
  }
}

const loadExternalPlugins = (leeft: Leeft, externalPlugins: string[]) => {
  externalPlugins.forEach(async pluginPath => {
    const plugin = await import(pluginPath)
    leeft.registerPlugin(plugin)
  })
}

const loadPlugins = async (leeft: Leeft, externalPlugins: string[] = []) => {
  await loadBuiltInPlugins(leeft)
  loadExternalPlugins(leeft, externalPlugins)
}

export { loadPlugins }
