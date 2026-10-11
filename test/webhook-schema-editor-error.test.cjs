'use strict';

/**
 * The webhook body format editor shows the owner plain words when the JSON does
 * not parse, and logs the parser's own message (which says where the mistake
 * is) to the console, so whoever is helping the owner can find it. The error
 * state is only a flag: nothing on screen reads the raw message.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const src = fs.readFileSync(
  path.join(__dirname, '..', 'src/renderer/src/components/triggers/WebhookSchemaEditor.tsx'),
  'utf8'
);

test('a body format that does not parse is logged with the parser message', () => {
  assert.match(
    src,
    /catch \(e\) \{[\s\S]*console\.error\('\[webhooks\] body format is not valid JSON:', e instanceof Error \? e\.message : String\(e\)\);[\s\S]*setError\(true\);[\s\S]*return;/,
    'the catch block logs the parse error, flags it and stops before saving'
  );
});

test('the error state is a flag, not a message', () => {
  assert.match(src, /useState\(false\)/);
  assert.doesNotMatch(src, /useState<string \| null>/);
  assert.doesNotMatch(src, /setError\((null|e instanceof Error \? e\.message)/, 'no code path stores a message in the error state');
});

test('nothing is saved while the JSON does not parse', () => {
  const start = src.indexOf('const save = () => {');
  const end = src.indexOf('if (!open) {');
  assert.ok(start !== -1 && end > start, 'found the save handler');
  const save = src.slice(start, end);
  assert.ok(save.includes('JSON.parse(text)') && save.includes('onSave(text)'), 'save parses, then saves');
  assert.ok(save.indexOf('JSON.parse(text)') < save.indexOf('onSave(text)'), 'the parse check comes before onSave');
});
