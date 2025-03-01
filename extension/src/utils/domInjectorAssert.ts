/*
 * Copyright 2025 Riccardo Perra
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

declare const tag: unique symbol

export const FAILED = Symbol('failed') as unknown as {
  message: string
  [tag]: '__failed__'
}

export class DomAssertionError {
  message: string
  constructor(message: string) {
    this.message = message
  }
}

export type DomAssertionFailed = typeof FAILED

type AssertFn = <T>(
  name: string,
  check: (_: {
    fail: (_: string | Error) => typeof FAILED
    assert: AssertFn
    step: (message: string) => void
  }) => T,
) => T | typeof FAILED

export class InjectDomAssertion {
  readonly id: string

  constructor(id: string) {
    this.id = id
  }

  isFailed(data: unknown): data is typeof FAILED {
    return data === FAILED
  }

  assert: AssertFn = (name, check) => {
    const fail = (message: string | Error) => message as never
    const assertFactory: (depth: number) => AssertFn =
      (depth) => (name, check) => {
        const step = (step: string) =>
          console.info(
            `[${this.id}] ${depth ? ' '.repeat(depth * 2) : ''} ℹ️ ${step}`,
          )

        try {
          const data = check({ fail, assert: assertFactory(depth + 1), step })
          console.log(
            '\x1b[32m%s\x1b[0m',
            `[${this.id}] ${depth ? ' '.repeat(depth * 2) : ''} ✅ ${name}`,
          )
          return data
        } catch (e) {
          console.log(
            '\x1b[31m%s\x1b[0m',
            `[${this.id}] ${depth ? ' '.repeat(depth * 2) : ''} ❌ Assertion failed: ${String(e)}`,
          )
        }
        return FAILED
      }

    return assertFactory(0)(name, check)
  }
}

export function createSuite(id: string, name: string) {
  return new DescribeExecutor(id, name, 0)
}

class DescribeExecutor {
  readonly id: string
  readonly name: string
  readonly depth: number = 0

  readonly entries: Array<DescribeExecutor | TestExecutor<unknown>> = []

  constructor(id: string, name: string, depth = 0) {
    this.id = id
    this.name = name
    this.depth = depth
  }

  isFailed(value: unknown): value is DomAssertionError {
    return value instanceof DomAssertionError
  }

  test<T>(
    name: string,
    condition: (_: { fail: (_: string | Error) => DomAssertionFailed }) => T,
  ): DomAssertionFailed | T {
    const fail = (message: string | Error): any =>
      typeof message === 'string'
        ? new DomAssertionError(message)
        : new DomAssertionError(String(message))
    const test = new TestExecutor(this.id, name, this, () =>
      condition({
        fail,
      }),
    )
    this.entries.push(test)
    return test.run()
  }

  collect(): void {
    console.group(`Test result for ${this.id}`)
    for (const entry of this.entries) {
      if (entry instanceof DescribeExecutor) {
        entry.collect()
      } else {
        entry.log()
      }
    }
    console.groupEnd()
  }
}

class TestExecutor<T> {
  readonly id: string
  readonly name: string
  readonly describe: DescribeExecutor
  readonly condition: () => T

  result: T | DomAssertionFailed | null = null

  constructor(
    id: string,
    name: string,
    describe: DescribeExecutor,
    condition: () => T,
  ) {
    this.id = id
    this.name = name
    this.describe = describe
    this.condition = condition
  }

  log(): void {
    if (this.result === FAILED) {
      console.log('\x1b[31m%s\x1b[0m', `[${this.name}] ❌ Failed`)
    } else {
      console.log('\x1b[32m%s\x1b[0m', `[${this.name}] ✅ Ok`)
    }
  }

  run(): DomAssertionFailed | T {
    try {
      this.result = this.condition()
      return this.result
    } catch (e) {
      this.result = e as DomAssertionFailed
      return this.result
    }
  }
}

function t() {}
