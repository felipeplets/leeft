import fs from "fs"
import path from "path"
import { Leeft } from "./leeft"

const loadBuiltInPlugins = (leeft: Leeft) => {
  const pluginFolder = path.join(__dirname, "plugins")
  const pluginFiles = fs.readdirSync(pluginFolder)

  pluginFiles.forEach(async file => {
    const pluginPath = path.join(pluginFolder, file)
    const plugin = (await import(pluginPath)).default
    leeft.registerPlugin(plugin)
  })
}

const loadExternalPlugins = (leeft: Leeft, externalPlugins: string[]) => {
  externalPlugins.forEach(async pluginPath => {
    const plugin = await import(pluginPath)
    leeft.registerPlugin(plugin)
  })
}

const loadPlugins = (leeft: Leeft, externalPlugins: string[] = []) => {
  loadBuiltInPlugins(leeft)
  loadExternalPlugins(leeft, externalPlugins)
}

export { loadPlugins }
