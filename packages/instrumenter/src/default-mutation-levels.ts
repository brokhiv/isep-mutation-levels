import fs from 'fs';

import { MutationLevel } from './mutators/mutation-level-options.js';

export const defaultMutationLevels: MutationLevel[] = JSON.parse(
  fs.readFileSync(new URL('../src/default-mutation-levels.json', import.meta.url), 'utf-8'),
);
