# `morality`

Morality.js is a library for building autonomous agents that comply with ethical theories.

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

## Citation

Please cite the following paper if you use Morality.js in your own research.

* Ethically Compliant Sequential Decision Making
* Justin Svegliato — Samer B. Nashed — Shlomo Zilberstein
* Proceedings of the 35th Conference on Artificial Intelligence (AAAI)
* March 2021