import { Leeft } from "../leeft"
import {loadPlugins} from "../plugin-loader"
import { registerCommands } from "../cli"

const leeft = new Leeft()
loadPlugins(leeft).then(() => {
    const dynamicYargs = registerCommands(leeft)
    dynamicYargs.help().argv
})

