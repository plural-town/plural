import { db } from './Db';

describe('db', () => {
  it('should work', () => {
    expect(db()).toEqual('db');
  });
});
