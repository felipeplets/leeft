interface Plugin {
    command: string
    description: string
    execute: (...args: any[]) => void
}

class Leeft {
    private plugins: Record<string, Plugin> = {}

    registerPlugin(plugin: Plugin) {
        const { command } = plugin

        if (!command) {
            throw new Error("Invalid plugin format. Plugins must have a command.")
        }

        this.plugins[command] = { ...plugin }
    }

    executeCommand(command: string, ...args: any[]) {
        const plugin = this.plugins[command]

        if (!plugin) {
            throw new Error(`Command "${command}" not found.`)
        }

        plugin.execute(...args)
    }

    getPlugins(): Plugin[] {
        return Object.values(this.plugins)
    }
}

export { Leeft, Plugin }