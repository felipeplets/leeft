import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { Leeft } from "./leeft"

const registerCommands = (leeft: Leeft): yargs.Argv => {
    console.log(">>>", leeft.getPlugins())
  const dynamicYargs = leeft
    .getPlugins()
    .reduce((yargsInstance, plugin) => 
        yargsInstance.command(
            plugin.command,
            plugin.description,
            (yargs) => yargs,
            (argv) => {
                leeft.executeCommand(plugin.command, ...argv._.slice(1))
            }
        )
  , yargs(hideBin(process.argv)))

  return dynamicYargs
}

export { registerCommands }