# `morality`

Morality is a library for building autonomous agents that reason ethically.

## Example

```js
import morality from 'morality';
import agents from 'morality/agents';
import ethics from 'morality/ethics';

const agent = new agents.GridWorldAgent([
  ['O', 'O', 'W', 'W', 'O'],
  ['O', 'O', 'W', 'W', 'O'],
  ['O', 'O', 'O', 'O', 'G']
]);

const ethics = new ethics.DivineCommandTheory([0, 4, 10]);

const solution = morality.solve(agent, ethics);
```