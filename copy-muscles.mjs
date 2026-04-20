import { mkdirSync, copyFileSync } from 'fs';
import { join } from 'path';

const src = 'C:\\Users\\souvi\\.gemini\\antigravity\\brain\\91cdf7eb-2113-4634-929c-a8f8874628dd';
const dest = 'src\\assets\\muscles';

mkdirSync(dest, { recursive: true });

const files = [
  ['muscle_chest_1776696516330.png', 'chest.png'],
  ['muscle_back_1776696534832.png', 'back.png'],
  ['muscle_shoulders_1776696549962.png', 'shoulders.png'],
  ['muscle_arms_1776696566531.png', 'arms.png'],
  ['muscle_core_1776696583593.png', 'core.png'],
];

files.forEach(([from, to]) => {
  copyFileSync(join(src, from), join(dest, to));
  console.log(`✓ Copied ${to}`);
});
console.log('All muscle images copied!');
