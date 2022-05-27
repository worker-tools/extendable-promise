# Extendable Promise

A promise that can be delayed (extended) via repeated calls to `waitUntil`.

"Extendable" here refers to the ability to extend the duration of the promise, not inheritance/subtypes/etc. 
The name and API are modelled after the
[`ExtendableEvent`](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent)
interface that was introduced to the web part of the Service Worker API. As
such, it provides a `waitUntil` method that takes a promise as argument that
extends settlement of the parent promise until all promises that were
added in this way have settled. You can think about it like
`Promise.allSettled`, except you can add promises to the list after the fact. Example:

```js
const p = new ExtendablePromise(timeout(200).then(() => 1));
await timeout(100)
p.waitUntil(timeout(300).then(() => Promise.reject(Error('2'))));

const res = await p; // total duration ~400ms (100 + 300)

assertEquals(res, [
  { status: "fulfilled", value: 1 },
  { status: "rejected", reason: Error('2') },
]);
```

After all promises have settled, further calls to `waitUntil` become no-ops.

The constructor takes a promise as argument, which sets the minimum duration for the extendable promise. 

If an extendable promise is created without supplying an initial promise, it is "idle" (`await`ing it pauses execution) until the first call to `waitUntil` "primes" it. 

Initializing it with a synchronous value or a settled promise immediately settles the extendable promise with that value and all calls to `waitUntil` are no-ops.

--------

<p align="center"><a href="https://workers.tools"><img src="https://workers.tools/assets/img/logo.svg" width="100" height="100" /></a>
<p align="center">This module is part of the Worker Tools collection<br/>⁕

[Worker Tools](https://workers.tools) are a collection of TypeScript libraries for writing web servers in [Worker Runtimes](https://workers.js.org) such as Cloudflare Workers, Deno Deploy and Service Workers in the browser. 

If you liked this module, you might also like:

- 🧭 [__Worker Router__][router] --- Complete routing solution that works across CF Workers, Deno and Service Workers
- 🔋 [__Worker Middleware__][middleware] --- A suite of standalone HTTP server-side middleware with TypeScript support
- 📄 [__Worker HTML__][html] --- HTML templating and streaming response library
- 📦 [__Storage Area__][kv-storage] --- Key-value store abstraction across [Cloudflare KV][cloudflare-kv-storage], [Deno][deno-kv-storage] and browsers.
- 🆗 [__Response Creators__][response-creators] --- Factory functions for responses with pre-filled status and status text
- 🎏 [__Stream Response__][stream-response] --- Use async generators to build streaming responses for SSE, etc...
- 🥏 [__JSON Fetch__][json-fetch] --- Drop-in replacements for Fetch API classes with first class support for JSON.
- 🦑 [__JSON Stream__][json-stream] --- Streaming JSON parser/stingifier with first class support for web streams.

Worker Tools also includes a number of polyfills that help bridge the gap between Worker Runtimes:
- ✏️ [__HTML Rewriter__][html-rewriter] --- Cloudflare's HTML Rewriter for use in Deno, browsers, etc...
- 📍 [__Location Polyfill__][location-polyfill] --- A `Location` polyfill for Cloudflare Workers.
- 🦕 [__Deno Fetch Event Adapter__][deno-fetch-event-adapter] --- Dispatches global `fetch` events using Deno’s native HTTP server.

[router]: https://workers.tools/router
[middleware]: https://workers.tools/middleware
[html]: https://workers.tools/html
[kv-storage]: https://workers.tools/kv-storage
[cloudflare-kv-storage]: https://workers.tools/cloudflare-kv-storage
[deno-kv-storage]: https://workers.tools/deno-kv-storage
[kv-storage-polyfill]: https://workers.tools/kv-storage-polyfill
[response-creators]: https://workers.tools/response-creators
[stream-response]: https://workers.tools/stream-response
[json-fetch]: https://workers.tools/json-fetch
[json-stream]: https://workers.tools/json-stream
[request-cookie-store]: https://workers.tools/request-cookie-store
[extendable-promise]: https://workers.tools/extendable-promise
[html-rewriter]: https://workers.tools/html-rewriter
[location-polyfill]: https://workers.tools/location-polyfill
[deno-fetch-event-adapter]: https://workers.tools/deno-fetch-event-adapter

Fore more visit [workers.tools](https://workers.tools).
