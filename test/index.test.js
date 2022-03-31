import { jest } from '@jest/globals'

import { ExtendablePromise } from '../index.js';

test('exists', () => {
  expect(ExtendablePromise).toBeDefined()
})

const timeout = n => new Promise(r => setTimeout(r, n))

describe('ExtendablePromise', () => {
  test('should be instantiable as a class', () => {
    expect(new ExtendablePromise()).toBeDefined()
  });

  test('initialize it with a value', async () => {
    await expect(new ExtendablePromise(true)).resolves.toBeDefined()
  })

  test('promise settled result', async () => {
    await expect(new ExtendablePromise(true)).resolves.toEqual([{ status: 'fulfilled', value: true }])
  })

  test('promise settled result failure', async () => {
    const err = Error()
    await expect(new ExtendablePromise(Promise.reject(err))).resolves.toEqual([{ status: 'rejected', reason: err }])
  })

  test('extending the promise', async () => {
    const start = Date.now()
    const t1 = timeout(1)
    const p = new ExtendablePromise(t1)
    p.waitUntil(timeout(10))
    await t1;
    expect(Date.now() - start).toBeLessThan(5)
    expect(p.settled).toBe(false)
    await p
    expect(Date.now() - start).toBeGreaterThanOrEqual(10)
  })

  test('settled property', async () => {
    const t1 = timeout(1)
    const p = new ExtendablePromise(t1)
    p.waitUntil(timeout(5))
    await t1
    expect(p.settled).toBe(false)
    await p
    expect(p.settled).toBe(true)
  })

  test('not extending the promise after settlement', async () => {
    const p = new ExtendablePromise(timeout(1))
    p.waitUntil(timeout(5))
    await p
    expect(p.settled).toBe(true)
    expect(() => p.waitUntil(timeout(1))).not.toThrow()
    expect(p.settled).toBe(true)
  })

  test('multiple with ordering', async () => {
    const p = new ExtendablePromise(timeout(3).then(() => 1))
    p.waitUntil(timeout(4).then(() => 2))
    p.waitUntil(timeout(2).then(() => 3))
    await expect(p).resolves.toStrictEqual([{ status: 'fulfilled', value: 1 }, { status: 'fulfilled', value: 2 }, { status: 'fulfilled', value: 3 }])
  })

  test('multiple with rejections', async () => {
    const p = new ExtendablePromise(timeout(3).then(() => 1))
    p.waitUntil(timeout(4).then(() => Promise.reject(2)))
    p.waitUntil(timeout(2).then(() => 3))
    await expect(p).resolves.toStrictEqual([{ status: 'fulfilled', value: 1 }, { status: 'rejected', reason: 2 }, { status: 'fulfilled', value: 3 }])
  })
})
