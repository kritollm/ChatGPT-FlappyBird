declare function require(name: string): any;
declare const console: any;
const assert = require('assert');
import { Action, Step, Task, MockPage } from './automation';

const dom = {
  '.product-card': [
    {
      '.title': 'Product 1',
      '.price': '$10',
    },
    {
      '.title': 'Product 2',
      '.price': '$20',
    },
  ],
};

const actions: Action[] = [
  { type: 'navigate', url: 'https://example.com' },
  { type: 'click', selector: '#open' },
  { type: 'fill', selector: '#search', value: 'shoes' },
  {
    type: 'extract',
    container: '.product-card',
    fields: [
      { key: 'title', selector: '.title' },
      { key: 'price', selector: '.price' },
    ],
  },
];

const step = new Step(actions);
const task = new Task([step]);
const page = new MockPage(dom);

(async () => {
  await task.run(page);
  assert.deepStrictEqual(page.logs, [
    'navigate:https://example.com',
    'click:#open',
    'fill:#search=shoes',
    'extract:.product-card',
  ]);
  assert.deepStrictEqual(page.filled, { '#search': 'shoes' });
  assert.deepStrictEqual(page.lastExtract, [
    { title: 'Product 1', price: '$10' },
    { title: 'Product 2', price: '$20' },
  ]);
  console.log('All tests passed');
})();
