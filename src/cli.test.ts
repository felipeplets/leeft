import { Leeft } from "./leeft"
import { registerCommands } from "./cli"

describe("registerCommands", () => {
  const originalConsoleError = console.error

  beforeEach(() => {
    console.error = jest.fn()
  })

  afterEach(() => {
    console.error = originalConsoleError
  })

  it("should register commands from plugins and execute them", () => {
    const leeft = new Leeft()
    const testCommand = "test-command"
    const testPlugin = {
      command: testCommand,
      description: "Test command",
      execute: jest.fn(),
    }
    leeft.registerPlugin(testPlugin)

    const dynamicYargs = registerCommands(leeft)

    // Simulate running the test command
    dynamicYargs.parse(testCommand)

    expect(testPlugin.execute).toHaveBeenCalled()
  })

  it("should display an error message for invalid commands", () => {
    const leeft = new Leeft()
    const dynamicYargs = registerCommands(leeft)
    const invalidCommand = "invalid-command"

    // Simulate running the invalid command
    dynamicYargs.parse(invalidCommand)

    expect(console.error).toHaveBeenCalled()
  })
})