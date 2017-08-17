import { toEmptyOrNumericString } from '../src/utils';

test('toEmptyOrNumericString', () => {
  let actual = toEmptyOrNumericString('123');
  expect(actual).toMatch(/^123$/);

  actual = toEmptyOrNumericString('1.5');
  expect(actual).toMatch(/^1.5$/);

  actual = toEmptyOrNumericString('1.2.3.');
  expect(actual).toMatch(/^1.2$/);

  actual = toEmptyOrNumericString('abc1.5def');
  expect(actual).toMatch(/^$/);

  actual = toEmptyOrNumericString('1.5def');
  expect(actual).toMatch(/^1.5$/);

  actual = toEmptyOrNumericString('001234');
  expect(actual).toMatch(/^1234$/);

  actual = toEmptyOrNumericString('01234');
  expect(actual).toMatch(/^1234$/);

  actual = toEmptyOrNumericString('0');
  expect(actual).toMatch(/^0$/);

  actual = toEmptyOrNumericString('0.5');
  expect(actual).toMatch(/^0.5$/);

  actual = toEmptyOrNumericString('.5');
  expect(actual).toMatch(/^.5$/);
});
