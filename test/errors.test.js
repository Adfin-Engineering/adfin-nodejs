import {test} from 'node:test';
import assert from 'node:assert';
import Adfin from '../index.js';

test('errors are exposed and instantiable', () => {
  const adfin = new Adfin('sk');
  const err = new adfin.errors.AdfinUnknownError({message: 'boom'});
  assert(err instanceof adfin.errors.AdfinUnknownError);
  assert.strictEqual(err.message, 'boom');
});
