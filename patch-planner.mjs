// Run from gym2.0 root: node patch-planner.mjs
import { readFileSync, writeFileSync } from 'fs';

const file = 'src/pages/Planner.jsx';
let src = readFileSync(file, 'utf8');

// Patch: filter empty splits & add purple for custom pills
src = src.replace(
  `{planSplits.map(s => (
                        <div key={s} className={\`inline-block px-3 py-1 rounded-full text-xs font-bold self-start \${
                          s === 'Rest' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'
                        }\`}>
                          {s}
                        </div>
                     ))}`,
  `{planSplits.filter(s => s && s.trim()).map(s => (
                        <div key={s} className={\`inline-block px-3 py-1 rounded-full text-xs font-bold self-start \${
                          s === 'Rest' ? 'bg-green-500/10 text-green-500'
                          : isCustomSplit(s) ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                          : 'bg-blue-500/10 text-blue-500'
                        }\`}>
                          {s}
                        </div>
                     ))}`
);

writeFileSync(file, src, 'utf8');
console.log('✅ Planner.jsx patched successfully');
