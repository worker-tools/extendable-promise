import 'https://gist.githubusercontent.com/qwtel/b14f0f81e3a96189f7771f83ee113f64/raw/TestRequest.ts'
import {
  assert,
  assertExists,
  assertEquals,
  assertStrictEquals,
  assertStringIncludes,
  assertThrows,
  assertRejects,
} from 'https://deno.land/std@0.133.0/testing/asserts.ts'
const { test } = Deno;

import { ExtendablePromise } from '../index.ts';

test('exists', () => {
  assertExists(ExtendablePromise)
})

test('should be instantiable as a class', () => {
  assertExists(new ExtendablePromise())
});

test('initialize it with a value', async () => {
  assertExists(await new ExtendablePromise(true))
})

test('promise settled result', async () => {
  assertEquals(await new ExtendablePromise(true), [{ status: 'fulfilled', value: true }])
})

test('promise settled result failure', async () => {
  assertEquals(await new ExtendablePromise(Promise.reject(Error())), [{ status: 'rejected', reason: Error() }])
})

const timeout = (n: number) => new Promise(r => setTimeout(r, n))

test('extending the promise', async () => {
  const start = Date.now()
  const t1 = timeout(1)
  const p = new ExtendablePromise(t1)
  p.waitUntil(timeout(10))
  await t1;
  assertEquals(p.settled, false)
  await p
  assert(Date.now() - start >= 9)
  assertEquals(p.settled, true)
})

test('not extending the promise after settlement', async () => {
  const p = new ExtendablePromise(timeout(1))
  p.waitUntil(timeout(5))
  await p
  assertEquals(p.settled, true)
  const t1 = timeout(1);
  assertEquals(p.waitUntil(t1), undefined)
  await t1
  assertEquals(p.settled, true)
})

test('multiple with ordering', async () => {
  const p = new ExtendablePromise(timeout(3).then(() => 1))
  p.waitUntil(timeout(4).then(() => 2))
  p.waitUntil(timeout(2).then(() => 3))
  assertEquals(await p, [{ status: 'fulfilled', value: 1 }, { status: 'fulfilled', value: 2 }, { status: 'fulfilled', value: 3 }])
})

test('multiple with rejections', async () => {
  const p = new ExtendablePromise(timeout(3).then(() => 1))
  p.waitUntil(timeout(4).then(() => Promise.reject(2)))
  p.waitUntil(timeout(2).then(() => 3))
  assertEquals(await p, [{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 2 }, { status: 'fulfilled', value: 3 }])
})
