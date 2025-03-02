export class DomAssertionError {
  message: string

  constructor(message: string) {
    this.message = message
  }
}

class AssertionResult {
  name: string
  error: DomAssertionError | null = null

  assertions: Array<AssertionResult> = []

  get isGroup() {
    return this.assertions.length > 0
  }

  constructor(name: string) {
    this.name = name
  }
}

type TestHandlerFnResult<T> = T | DomAssertionError

async function tAssert<T>(
  this: { assertions: Array<any> },
  name: string,
  fn: (
    child: TestHandler,
  ) => Promise<TestHandlerFnResult<T>> | TestHandlerFnResult<T>,
): Promise<TestHandlerFnResult<T>> {
  const assertion = new AssertionResult(name)
  this.assertions.push(assertion)
  try {
    const childAssert = tAssert.bind({
      assertions: assertion.assertions,
    }) as TestHandler
    const result = await fn(childAssert)
    if (result instanceof DomAssertionError) {
      assertion.error = result
    }
    return result
  } catch (e) {
    if (e instanceof DomAssertionError) {
      assertion.error = e
      return e
    }
    throw e
  }
}

export function isAssertionError(value: unknown): value is DomAssertionError {
  return value instanceof DomAssertionError
}

type TestHandler = (<T>(
  name: string,
  fn: (
    child: TestHandler,
  ) => TestHandlerFnResult<T> | Promise<TestHandlerFnResult<T>>,
) => Promise<TestHandlerFnResult<T>>) & {
  collect: () => void
}

export function suite(name: string): TestHandler & { collect: () => void } {
  const assertions = [] as Array<AssertionResult>

  return Object.assign(
    function <T>(
      name: string,
      fn: (
        child: TestHandler,
      ) => TestHandlerFnResult<T> | Promise<TestHandlerFnResult<T>>,
    ): Promise<TestHandlerFnResult<T>> {
      return tAssert.call({ assertions }, name, fn) as any
    },
    {
      collect: () => {
        console.group(`Test suite - ${name}`)
        for (const assertion of assertions) {
          log(assertion, 0)
        }
        console.groupEnd()
      },
    },
  )
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
}

function log(assertion: AssertionResult, depth: number = 0) {
  if (assertion.isGroup) {
    console.group(`${assertion.name}`)
    for (const nestedAssertion of assertion.assertions) {
      log(nestedAssertion, depth + 1)
    }
    console.groupEnd()
  } else {
    if (assertion.error) {
      logError(assertion.name, assertion.error)
    } else {
      logPass(assertion.name)
    }
  }
}

function logError(name: string, result: DomAssertionError, depth: number = 0) {
  console.log(
    `${logDepth(depth)}${COLORS.red}✗ ${name}: ${COLORS.reset}${result.message}`,
  )
}

function logPass(name: string, depth: number = 0) {
  console.log(`${logDepth(depth)}${COLORS.green}✓ ${name}`)
}

function logDepth(depth: number) {
  if (depth === 0) return ''
  return ' '.repeat(depth * 2)
}
