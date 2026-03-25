const tests = [];
const afterEachHandlers = [];

export const test = (name, fn) => {
  tests.push({ name, fn });
};

test.afterEach = (fn) => {
  afterEachHandlers.push(fn);
};

export const run = async () => {
  let passed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();

      for (const handler of afterEachHandlers) {
        await handler();
      }

      passed += 1;
      console.log(`PASS ${name}`);
    } catch (error) {
      console.error(`FAIL ${name}`);
      console.error(error);
      process.exitCode = 1;
      return;
    }
  }

  console.log(`\n${passed}/${tests.length} tests passed`);
};
