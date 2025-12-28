import type { EnumController } from './EnumController'

/**
 * Central registry for enum controllers
 * Enables discovery and enumeration of all registered enums
 */
class EnumRegistry {
  private controllers = new Map<string, EnumController<number>>()

  /**
   * Register an enum controller
   */
  register<T extends number>(name: string, controller: EnumController<T>): void {
    this.controllers.set(name, controller as EnumController<number>)
  }

  /**
   * Get a controller by name
   */
  get<T extends number>(name: string): EnumController<T> | undefined {
    return this.controllers.get(name) as EnumController<T> | undefined
  }

  /**
   * Get all registered controllers (for discovery/debugging)
   */
  getAll(): Array<EnumController<number>> {
    return Array.from(this.controllers.values())
  }

  /**
   * Check if a controller is registered
   */
  has(name: string): boolean {
    return this.controllers.has(name)
  }
}

export const enumRegistry = new EnumRegistry()

/**
 * Debug utility: Log all registered enum controllers
 * Useful for development/debugging
 */
export function debugEnums(): void {
  const controllers = enumRegistry.getAll()
  if (import.meta.env.DEV) {
    console.group('📋 Registered Enum Controllers')
    for (const [index, controller] of controllers.entries()) {
      console.log(`${index + 1}. ${controller.constructor.name}`, {
        choices: controller.choices.length,
        values: controller.choices.map((c) => `${c.id}:${c.name}`),
      })
    }

    console.groupEnd()
  }
}
