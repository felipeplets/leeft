import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import { Leeft } from "./leeft"

const registerCommands = (leeft: Leeft): yargs.Argv => {
  const yargsInstance = yargs(hideBin(process.argv))
    .scriptName("leeft")
    .usage('$0 <cmd> [args]')
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
  , yargsInstance)

  return dynamicYargs
}

export { registerCommands }