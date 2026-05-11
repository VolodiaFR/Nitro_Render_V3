# Nitro_Render_V3 — Claude project context

Pure-TypeScript renderer library for the Nitro retro Habbo client.
Wraps **PixiJS v8** for room/avatar rendering and provides the WebSocket
+ event-bus infrastructure that the React client (`../Nitro-V3`) sits on
top of.

## Stack

- **TypeScript 6.0** (root) + **tsgo** (`@typescript/native-preview`,
  TS 7 preview compiler — used by `yarn compile:fast`, ~7× faster on
  this codebase)
- **PixiJS v8** (`pixi.js@8.18`)
- **Vite 8** for build + bundling
- **Vitest 4** for unit tests
- **Yarn 1.22 workspaces** (`packages/*`) — note: yarn 1, NOT yarn 4 like
  the client. The two repos use different package managers on purpose.
- **No React** — this is a pure TS library; React lives in `../Nitro-V3`.

## Workspace layout

Twelve internal packages under `packages/*/src/`, each pinning
`typescript: ^6.0.3` in its own `devDependencies`:

```
packages/
  api              public interfaces (IEventDispatcher, ISessionDataManager, ...)
  assets           asset loading + caching
  avatar           avatar rendering / figure resolution
  camera           in-room camera widget
  communication    WebSocket + composer/parser pipeline
  configuration    runtime config loader
  events           EventDispatcher + NitroEventType + per-domain events
  localization     LocalizationManager
  room             RoomEngine + RoomVisualization
  session          SessionDataManager + RoomSessionManager + handlers
  sound            SoundManager (howler-based)
  utils            shared utilities (BinaryReader, Logger, …)
```

Root `index.ts` re-exports everything from `@nitrots/*` so the React
client gets a flat `import { … } from '@nitrots/nitro-renderer'`.

## React-friendly API additions (v2.1.0)

Three additions matter for the React client integration. Keep these
backwards-compatible:

### `EventDispatcher.subscribe(type, callback): () => void`

Signature matches what `useSyncExternalStore` expects — returns an
unsubscriber, no need to juggle callback identity. Implemented in
`packages/events/src/EventDispatcher.ts`. The legacy
`addEventListener` / `removeEventListener` still work.

### `CommunicationManager.subscribeMessage(eventCtor, handler): () => void`

Equivalent for packet streams. Implemented in
`packages/communication/src/CommunicationManager.ts`.

### Snapshot getters on `SessionDataManager` + `RoomSessionManager`

```ts
getUserDataSnapshot(): Readonly<IUserDataSnapshot>
getActiveRoomSessionSnapshot(): Readonly<IRoomSessionSnapshot> | null
```

Returns **referentially-stable** values: the same object reference is
returned across reads until invalidated. Invalidation happens via the
new event types `NitroEventType.SESSION_DATA_UPDATED` and
`NitroEventType.ROOM_SESSION_UPDATED`.

When you mutate any field that the snapshot exposes, call the private
`invalidateUserDataSnapshot()` / `invalidateRoomSessionSnapshot()` —
that drops the cached snapshot and dispatches the invalidation event.
The React side rebuilds via `useSyncExternalStore`.

The interface contracts live in:
- `packages/api/src/nitro/session/IUserDataSnapshot.ts`
- `packages/api/src/nitro/session/IRoomSessionSnapshot.ts`

## Recent renderer changes (`feat/react19-event-bus`)

Tracked separately from the v2.1.0 batch above; all are
non-breaking additions or align-with-Arcturus fixes:

### RoomEnterComposer: optional `spawnX` / `spawnY`

`new RoomEnterComposer(roomId, password?, spawnX?, spawnY?)`. The
Arcturus `RequestRoomLoadEvent` handler reads the two extra ints only
when `packet.remaining >= 8`, so the same composer header serves both
the legacy 2-arg form (door spawn) and the 4-arg form (reconnect /
respawn at a specific tile). RoomSession + RoomSessionManager use the
4-arg variant in their `enterRoom` / reconnect paths.

### RoomSettingsData: `allowUnderpass` field

`RoomSettingsData` (and its parser) now exposes `allowUnderpass:
boolean`. Arcturus' `RoomSettingsComposer` already appends one
trailing int for this flag, and the new parser reads it via
`if(wrapper.bytesAvailable) … readInt() === 1` so older servers that
don't emit the field still parse cleanly. `SaveRoomSettingsComposer`
accepts an optional `allowUnderpass` arg at the end of its parameter
list; the server-side `RoomSettingsSaveEvent` reads it under
`packet.bytesAvailable() > 0`.

### Dropped dead code: `sendWhisperGroupMessage`

`IRoomSession.sendWhisperGroupMessage(userId)` referenced a
`ChatWhisperGroupComposer` that never existed in the codebase and had
zero call sites in the React client. Both the interface declaration
and the broken impl are removed. The real whisper path is
`RoomUnitChatWhisperComposer(recipientName, message, styleId)` —
unchanged.

### TS 5.7+ and Pixi v8 alignment

- `ArrayBufferLike` drift handled with explicit casts in `BinaryReader`
  / `BinaryWriter` / `WsSessionCrypto.randomNonce()` /
  `ArrayBufferToBase64`. The renderer never uses SharedArrayBuffer, so
  these are type-level narrowings only.
- `Container.filters` in Pixi v8 is `Filter[] | readonly Filter[] | null`;
  the AvatarImage filter-stack mutation always goes through the
  spread-array branch now (no single-Filter fallback). `Filter` is
  imported explicitly from pixi.js.
- `ExtendedSprite` casts the renderer to `WebGLRenderer` inside the
  `RendererType.WEBGL` branch so `renderer.gl` /
  `glRenderTarget.resolveTargetFramebuffer` resolve.
- `FurnitureBadgeDisplayVisualization.updateSprite` signature realigned
  to the parent's 2-arg `(scale, layerId)` shape (was a custom 4-arg
  override that broke base-class assignability).
- `TextureUtils.generateImage` casts the extractor's `ImageLike`
  union return to `HTMLImageElement` (the default backend produces
  one).
- `Window.NitroConfig` declaration in `NitroConfig.ts` realigned to
  the client's `Record<string, unknown>` type so the merged decls
  agree.
- Empty-tuple composers (`WiredRoomSettingsRequestComposer`,
  `WiredUserVariablesRequestComposer`) annotate the return type
  `(): []` explicitly so `IMessageComposer<[]>` lines up.

### Bug fix: `PetBreedingMessageParser.bytesAvailable < 12`

`bytesAvailable` is a boolean (the wrapper just answers "is there
anything left?"). The pet-breeding parser used to compare it against
`12` as if it were a byte count, which TS 6 caught and which was
also semantically wrong. Replaced with the standard
`if(!wrapper || !wrapper.bytesAvailable) return false;` guard.

## Scripts

```
yarn build              # vite build
yarn compile            # tsc --project ./tsconfig.json --noEmit false
yarn compile:fast       # tsgo (~7× faster, TS 7 preview)
yarn eslint             # lint src + packages/*/src
yarn test               # vitest run
yarn test:watch         # vitest watch
yarn test:coverage      # vitest with v8 coverage
```

## Consumed by

`../Nitro-V3` consumes this library via `link:../Nitro_Render_V3`
(yarn 4 node-modules linker). DO NOT use `yarn link` — it confuses
vite's asset resolution. The client's `vite.config.js` then maps each
`@nitrots/*` package directly to its source `index.ts` so there's no
build step needed for development.

When making changes to renderer APIs the React client uses, the
client's `feat/react19-*` branches contain consumers — check
`Nitro-V3/src/hooks/events/` and `Nitro-V3/src/hooks/{session,rooms}/`
for the React-side bridge code.

## Gotchas

- **`SessionDataManager.getUserData(id)` does NOT exist.** Some legacy
  code in the React client used it under a `getUserData ?` truthy guard;
  the branch was always dead. Only `getUserDataSnapshot()` exists.
- **`bytesAvailable` is a boolean.** The codebase historically had one
  parser (`PetBreedingMessageParser`) that compared it against a
  number — fixed. The wrapper returns "any bytes left?", not a count.
  Use it as a truthy guard or follow with `try {} catch` if you need
  optional reads.
- **Composer `getMessageArray()` return type must match the type
  argument.** `IMessageComposer<[]>` means the function returns `[]`,
  not `any[]`. The two `Wired*RequestComposer`s that ship empty
  payloads each annotate `getMessageArray(): []` explicitly.
- `IRoomSession.sendChatMessage` / `sendShoutMessage` accept an optional
  `chatColour` 3rd arg (was required pre-2.1.1, now optional to match
  the historical call sites in the React client). The implementation
  forwards `undefined` to the composer just fine; pass a value only when
  you need a specific bubble colour.
- `IRoomSession.password` and `IRoomSession.sendBackgroundMessage` are
  now part of the public interface (they always existed on the
  implementation class — interface caught up).
- The renderer is **synchronous**: `EventDispatcher.dispatchEvent` is a
  synchronous loop over listeners. Don't add `await` inside the
  `processEvent` loop — it would change ordering guarantees that
  consumers rely on.
- Workspace package devDeps pin TS at `^6.0.3` so `yarn compile` inside
  any single package keeps working. The root TS 6 is the source of
  truth.

## Sister projects in the same DEV folder

- `../Nitro-V3` — React 19 client (consumes this lib via link)
- `../Arcturus-Morningstar-Extended` — Java emulator (server side)
- `../NitroV3-Housekeeping` — Next.js + Prisma admin CMS
