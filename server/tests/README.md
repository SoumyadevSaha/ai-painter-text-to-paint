Server tests use Node's built-in test runner.

Available commands:

- `npm test`
- `npm run test:unit`
- `npm run test:integration`
- `npm run test:mongo`

`npm run test:mongo` requires `MONGODB_TEST_URI` to be set. If it is not set, the optional Mongo integration test is skipped.
