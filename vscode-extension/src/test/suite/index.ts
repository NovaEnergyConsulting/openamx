import * as path from 'path';
import Mocha from 'mocha';

export function run(): Promise<void> {
  const mocha = new Mocha({ ui: 'tdd', timeout: 10000 });
  mocha.addFile(path.resolve(__dirname, '../providers.host.js'));

  return new Promise((resolve, reject) => {
    mocha.run(failures => failures > 0 ? reject(new Error(`${failures} test(s) failed`)) : resolve());
  });
}