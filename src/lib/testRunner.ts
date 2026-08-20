import { File } from '@/types/index';

export interface TestCaseResult {
  id: string;
  name: string;
  suiteName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number; // in ms
  error?: {
    message: string;
    expected?: any;
    received?: any;
    stack?: string;
  };
}

export interface TestSuiteResult {
  fileId: string;
  fileName: string;
  suiteName: string;
  status: 'passed' | 'failed' | 'running';
  duration: number;
  tests: TestCaseResult[];
}

export interface TestSummary {
  totalSuites: number;
  passedSuites: number;
  failedSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  timestamp: number;
}

// Deep equality helper
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object') {
    if (typeof a === 'number' && typeof b === 'number' && isNaN(a) && isNaN(b)) return true;
    return false;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key) || !deepEqual(a[key], b[key])) {
      return false;
    }
  }
  return true;
}

function stringifyVal(val: any): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'function') return `[Function: ${val.name || 'anonymous'}]`;
  if (typeof val === 'symbol') return val.toString();
  try {
    return JSON.stringify(val, null, 2);
  } catch {
    return String(val);
  }
}

class Expectation {
  private received: any;
  private isNot: boolean;

  constructor(received: any, isNot = false) {
    this.received = received;
    this.isNot = isNot;
  }

  get not(): Expectation {
    return new Expectation(this.received, !this.isNot);
  }

  private assert(condition: boolean, message: string, expected?: any) {
    const passed = this.isNot ? !condition : condition;
    if (!passed) {
      const err: any = new Error(
        this.isNot
          ? `Expected value NOT to match: ${message}`
          : message
      );
      err.expected = expected;
      err.received = this.received;
      throw err;
    }
  }

  toBe(expected: any) {
    const pass = Object.is(this.received, expected);
    this.assert(
      pass,
      `Expected: ${stringifyVal(expected)}\nReceived: ${stringifyVal(this.received)}`,
      expected
    );
  }

  toEqual(expected: any) {
    const pass = deepEqual(this.received, expected);
    this.assert(
      pass,
      `Expected deeply equal to:\n${stringifyVal(expected)}\n\nReceived:\n${stringifyVal(this.received)}`,
      expected
    );
  }

  toBeDefined() {
    this.assert(
      this.received !== undefined,
      `Expected value to be defined, but received: ${stringifyVal(this.received)}`
    );
  }

  toBeUndefined() {
    this.assert(
      this.received === undefined,
      `Expected undefined, but received: ${stringifyVal(this.received)}`
    );
  }

  toBeNull() {
    this.assert(
      this.received === null,
      `Expected null, but received: ${stringifyVal(this.received)}`
    );
  }

  toBeTruthy() {
    this.assert(
      Boolean(this.received),
      `Expected truthy value, but received falsy: ${stringifyVal(this.received)}`
    );
  }

  toBeFalsy() {
    this.assert(
      !this.received,
      `Expected falsy value, but received truthy: ${stringifyVal(this.received)}`
    );
  }

  toBeNaN() {
    this.assert(
      Number.isNaN(this.received),
      `Expected NaN, but received: ${stringifyVal(this.received)}`
    );
  }

  toBeGreaterThan(expected: number) {
    this.assert(
      this.received > expected,
      `Expected > ${expected}, but received: ${this.received}`,
      `> ${expected}`
    );
  }

  toBeGreaterThanOrEqual(expected: number) {
    this.assert(
      this.received >= expected,
      `Expected >= ${expected}, but received: ${this.received}`,
      `>= ${expected}`
    );
  }

  toBeLessThan(expected: number) {
    this.assert(
      this.received < expected,
      `Expected < ${expected}, but received: ${this.received}`,
      `< ${expected}`
    );
  }

  toBeLessThanOrEqual(expected: number) {
    this.assert(
      this.received <= expected,
      `Expected <= ${expected}, but received: ${this.received}`,
      `<= ${expected}`
    );
  }

  toContain(item: any) {
    let pass = false;
    if (typeof this.received === 'string') {
      pass = this.received.includes(String(item));
    } else if (Array.isArray(this.received)) {
      pass = this.received.some((el) => deepEqual(el, item));
    } else if (this.received instanceof Set) {
      pass = this.received.has(item);
    }
    this.assert(
      pass,
      `Expected container:\n${stringifyVal(this.received)}\n\nto contain:\n${stringifyVal(item)}`,
      item
    );
  }

  toHaveLength(expectedLength: number) {
    const len = this.received?.length;
    this.assert(
      len === expectedLength,
      `Expected length ${expectedLength}, but received: ${len}`,
      expectedLength
    );
  }

  toMatch(regexOrString: RegExp | string) {
    const regex = typeof regexOrString === 'string' ? new RegExp(regexOrString) : regexOrString;
    this.assert(
      regex.test(String(this.received)),
      `Expected "${this.received}" to match pattern ${regex.toString()}`
    );
  }

  toThrow(expectedError?: string | RegExp | Error) {
    let threw = false;
    let actualError: any = null;

    if (typeof this.received !== 'function') {
      throw new Error('toThrow expectation requires a function target');
    }

    try {
      this.received();
    } catch (e: any) {
      threw = true;
      actualError = e;
    }

    if (!threw) {
      this.assert(false, 'Expected function to throw an error, but it returned without throwing');
      return;
    }

    if (expectedError) {
      const msg = actualError?.message || String(actualError);
      if (typeof expectedError === 'string') {
        this.assert(
          msg.includes(expectedError),
          `Expected error containing "${expectedError}", but got: "${msg}"`
        );
      } else if (expectedError instanceof RegExp) {
        this.assert(
          expectedError.test(msg),
          `Expected error to match ${expectedError.toString()}, but got: "${msg}"`
        );
      }
    } else {
      this.assert(true, '');
    }
  }

  toBeCloseTo(expected: number, numDigits = 2) {
    const pass = Math.abs(this.received - expected) < Math.pow(10, -numDigits) / 2;
    this.assert(
      pass,
      `Expected ${this.received} to be close to ${expected} (precision: ${numDigits})`,
      expected
    );
  }

  toBeInstanceOf(cls: any) {
    const pass = this.received instanceof cls;
    this.assert(
      pass,
      `Expected instance of ${cls?.name || 'Class'}, but received: ${stringifyVal(this.received)}`
    );
  }
}

/**
 * Execute tests from a single or multiple files
 */
export async function runUnitTests(
  files: File[],
  targetFileId?: string
): Promise<{ suites: TestSuiteResult[]; summary: TestSummary }> {
  const startTime = performance.now();

  // Find candidate test files
  let testFiles: File[] = [];
  if (targetFileId) {
    const target = files.find((f) => f.id === targetFileId);
    if (target) testFiles = [target];
  } else {
    // Look for *.test.js, *.spec.js, or files containing describe() / test()
    testFiles = files.filter(
      (f) =>
        f.name.includes('.test.') ||
        f.name.includes('.spec.') ||
        f.content.includes('describe(') ||
        f.content.includes('test(') ||
        f.content.includes('it(')
    );

    // If no dedicated test files found, default to any JS/TS files
    if (testFiles.length === 0) {
      testFiles = files.filter((f) => f.language === 'javascript' || f.language === 'typescript');
    }
  }

  // Non-test source files to evaluate as shared context
  const nonTestCode = files
    .filter(
      (f) =>
        !f.name.includes('.test.') &&
        !f.name.includes('.spec.') &&
        (f.language === 'javascript' || f.language === 'typescript')
    )
    .map((f) => f.content)
    .join('\n\n');

  const allSuites: TestSuiteResult[] = [];

  for (const file of testFiles) {
    const suiteStartTime = performance.now();
    const suiteTests: TestCaseResult[] = [];

    // Registered test declarations
    interface RegisteredBlock {
      type: 'suite' | 'test';
      name: string;
      fn: () => void | Promise<void>;
      beforeEachList: (() => void | Promise<void>)[];
      afterEachList: (() => void | Promise<void>)[];
    }

    const currentSuiteName = file.name;
    const testQueue: {
      suite: string;
      name: string;
      fn: () => void | Promise<void>;
      beforeEachList: (() => void | Promise<void>)[];
      afterEachList: (() => void | Promise<void>)[];
    }[] = [];

    let currentSuitePrefix = '';
    const activeBeforeEach: (() => void | Promise<void>)[] = [];
    const activeAfterEach: (() => void | Promise<void>)[] = [];
    const activeBeforeAll: (() => void | Promise<void>)[] = [];
    const activeAfterAll: (() => void | Promise<void>)[] = [];

    const customDescribe = (name: string, fn: () => void) => {
      const prevPrefix = currentSuitePrefix;
      currentSuitePrefix = prevPrefix ? `${prevPrefix} > ${name}` : name;
      try {
        fn();
      } catch (err: any) {
        suiteTests.push({
          id: Math.random().toString(36).substring(2, 9),
          name: `Suite declaration [${name}]`,
          suiteName: currentSuitePrefix,
          status: 'failed',
          duration: 0,
          error: {
            message: err.message || String(err),
            stack: err.stack,
          },
        });
      } finally {
        currentSuitePrefix = prevPrefix;
      }
    };

    const customTest = (name: string, fn: () => void | Promise<void>) => {
      testQueue.push({
        suite: currentSuitePrefix || file.name,
        name,
        fn,
        beforeEachList: [...activeBeforeEach],
        afterEachList: [...activeAfterEach],
      });
    };

    const customBeforeEach = (fn: () => void | Promise<void>) => {
      activeBeforeEach.push(fn);
    };

    const customAfterEach = (fn: () => void | Promise<void>) => {
      activeAfterEach.push(fn);
    };

    const customBeforeAll = (fn: () => void | Promise<void>) => {
      activeBeforeAll.push(fn);
    };

    const customAfterAll = (fn: () => void | Promise<void>) => {
      activeAfterAll.push(fn);
    };

    const customExpect = (val: any) => new Expectation(val);

    // Build execution sandbox
    const sandboxScope: Record<string, any> = {
      describe: customDescribe,
      test: customTest,
      it: customTest,
      expect: customExpect,
      beforeEach: customBeforeEach,
      afterEach: customAfterEach,
      beforeAll: customBeforeAll,
      afterAll: customAfterAll,
      console: {
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {},
      },
      require: (mod: string) => {
        // Find workspace file
        const cleanName = mod.replace(/^\.\//, '');
        const target = files.find((f) => f.name === cleanName || f.name.startsWith(cleanName));
        if (target) {
          try {
            const exportsObj: any = {};
            const moduleObj = { exports: exportsObj };
            const runMod = new Function('module', 'exports', target.content);
            runMod(moduleObj, exportsObj);
            return moduleObj.exports;
          } catch (e) {
            return {};
          }
        }
        return {};
      },
    };

    // Execute definition phase
    try {
      // Execute non-test dependencies first into global scope if needed
      const combinedCode = `
        ${nonTestCode}
        \n\n
        ${file.content}
      `;

      const runnerFn = new Function(
        'describe',
        'test',
        'it',
        'expect',
        'beforeEach',
        'afterEach',
        'beforeAll',
        'afterAll',
        'require',
        combinedCode
      );

      runnerFn(
        customDescribe,
        customTest,
        customTest,
        customExpect,
        customBeforeEach,
        customAfterEach,
        customBeforeAll,
        customAfterAll,
        sandboxScope.require
      );
    } catch (parseError: any) {
      allSuites.push({
        fileId: file.id,
        fileName: file.name,
        suiteName: file.name,
        status: 'failed',
        duration: Math.round(performance.now() - suiteStartTime),
        tests: [
          {
            id: Math.random().toString(36).substring(2, 9),
            name: 'Syntax / Compilation Error',
            suiteName: file.name,
            status: 'failed',
            duration: 0,
            error: {
              message: parseError.message || String(parseError),
              stack: parseError.stack,
            },
          },
        ],
      });
      continue;
    }

    // Run beforeAll hooks
    for (const bAll of activeBeforeAll) {
      try {
        await bAll();
      } catch (err) {}
    }

    // Run individual queued tests
    for (const item of testQueue) {
      const tStart = performance.now();
      let testStatus: 'passed' | 'failed' = 'passed';
      let testError: any = undefined;

      try {
        // Run beforeEach
        for (const bEach of item.beforeEachList) {
          await bEach();
        }

        // Run test function
        const res = item.fn();
        if (res && typeof res.then === 'function') {
          // Timeout after 4000ms
          await Promise.race([
            res,
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('Async test timeout exceeded (4000ms)')), 4000)
            ),
          ]);
        }

        // Run afterEach
        for (const aEach of item.afterEachList) {
          await aEach();
        }
      } catch (err: any) {
        testStatus = 'failed';
        testError = {
          message: err?.message || String(err),
          expected: err?.expected,
          received: err?.received,
          stack: err?.stack,
        };
      }

      const tDuration = Math.max(1, Math.round((performance.now() - tStart) * 10) / 10);
      suiteTests.push({
        id: Math.random().toString(36).substring(2, 9),
        name: item.name,
        suiteName: item.suite,
        status: testStatus,
        duration: tDuration,
        error: testError,
      });
    }

    // Run afterAll hooks
    for (const aAll of activeAfterAll) {
      try {
        await aAll();
      } catch (err) {}
    }

    const suiteDuration = Math.round(performance.now() - suiteStartTime);
    const hasFailures = suiteTests.some((t) => t.status === 'failed');

    allSuites.push({
      fileId: file.id,
      fileName: file.name,
      suiteName: file.name,
      status: hasFailures ? 'failed' : 'passed',
      duration: suiteDuration,
      tests: suiteTests,
    });
  }

  // Calculate summary
  const totalSuites = allSuites.length;
  const passedSuites = allSuites.filter((s) => s.status === 'passed').length;
  const failedSuites = allSuites.filter((s) => s.status === 'failed').length;

  const allTests = allSuites.flatMap((s) => s.tests);
  const totalTests = allTests.length;
  const passedTests = allTests.filter((t) => t.status === 'passed').length;
  const failedTests = allTests.filter((t) => t.status === 'failed').length;
  const skippedTests = allTests.filter((t) => t.status === 'skipped').length;

  const totalDuration = Math.round(performance.now() - startTime);

  return {
    suites: allSuites,
    summary: {
      totalSuites,
      passedSuites,
      failedSuites,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      duration: totalDuration,
      timestamp: Date.now(),
    },
  };
}
