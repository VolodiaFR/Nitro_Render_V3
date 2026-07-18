import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { verifyRendererCi } from './verify-ci-contract.mjs';

test('renderer CI requires the complete pull-request gate', async () =>
{
    const workflow = await readFile(new URL('../.github/workflows/ci.yml', import.meta.url), 'utf8');

    assert.doesNotThrow(() => verifyRendererCi(workflow));
});

test('renderer CI contract rejects incomplete workflows', () =>
{
    assert.throws(
        () => verifyRendererCi('on: pull_request\njobs: {}\n'),
        /missing required CI contract/);
});
