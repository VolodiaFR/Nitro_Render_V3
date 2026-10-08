<div align="center">

# Octane Renderer

**The rendering and networking engine behind the [Octane](https://github.com/duckietm/Octane) client: rooms, avatars,
furniture and the WebSocket protocol, built on PixiJS 8.**

[![License: GPL-3.0](https://img.shields.io/badge/license-GPL--3.0-blue.svg)](LICENSE)
![PixiJS 8](https://img.shields.io/badge/PixiJS-8-e72264.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6.svg)
[![Discord](https://img.shields.io/badge/Discord-join%20us-5865F2.svg)](https://discord.gg/aJ46cd3F9g)

[Octane](https://github.com/duckietm/Octane) ·
[Octane Renderer](https://github.com/duckietm/Octane-Renderer) ·
[Polaris Emulator](https://github.com/duckietm/Polaris-Emulator) ·
[Confurter](https://github.com/duckietm/all-in-1-converter) ·
[Discord](https://discord.gg/aJ46cd3F9g)

</div>

---

The Octane Renderer is a pure TypeScript library (no React). It draws the hotel with PixiJS 8, loads assets and
gamedata, and speaks the client–server protocol with the
[Polaris Emulator](https://github.com/duckietm/Polaris-Emulator). The [Octane](https://github.com/duckietm/Octane)
React client is built on top of it.

It started as a fork of [Nitro Renderer](https://github.com/billsonnn/nitro-renderer) and is developed independently,
with no ties to Billsonnn / Nitro.

## ✨ Highlights

- **PixiJS 8** rendering for rooms, avatars, pets, furniture and effects
- **`.hab` and `.nitro` asset bundles**, including Habbo's own `.hab` files as downloaded
- **WebP, PNG, GIF and animated sheets** through one image loader
- **JSON / JSONC parser** for every config and gamedata file
- **Split-aware gamedata loader**: single files or folders of small files with `core` / `custom` / `seasonal` tiers
- **React-friendly APIs**: `subscribe()`-style events and stable snapshot getters for `useSyncExternalStore`

## 📦 Getting started

The renderer is not published on npm. Clone it **next to** the Octane client; Octane's Vite config resolves
`@octane/renderer` from the sibling folder:

```bash
git clone https://github.com/duckietm/Octane-Renderer.git
git clone https://github.com/duckietm/Octane.git

cd Octane-Renderer && yarn install
```

```
your-folder/
├── Octane/
└── Octane-Renderer/
```

Requirements: [Node.js](https://nodejs.org/) 22.12 or newer and [Yarn](https://yarnpkg.com/) 4 (run `corepack enable`
once). Octane's installer (`install.bat` / `install.sh`) clones and installs the renderer for you.

## 🧩 Packages

Everything is re-exported from `@octane/renderer`, so the client imports from one place.

| Package | Contents |
|---|---|
| `api` | Shared interfaces (`IEventDispatcher`, `ISessionDataManager`, …) |
| `assets` | Asset and bundle loading, image decoding, graphic asset collections |
| `avatar` | Avatar rendering and figure resolution |
| `camera` | In-room camera |
| `communication` | WebSocket connection, message composers and parsers |
| `configuration` | Runtime configuration loader |
| `events` | Event dispatcher and event types |
| `localization` | Texts and localization |
| `room` | Room engine, visualizations and the room content loader |
| `session` | Session data, room sessions and their handlers |
| `sound` | Sound and music |
| `utils` | Shared utilities: binary reader, JSON parser, gamedata loader, asset bundles |

## 📦 Asset bundles: `.hab` and `.nitro`

`AssetManager.downloadAsset(url)` picks the reader from the URL's extension. A bundle holds one asset JSON (assets,
visualizations, spritesheet) and its sheet image, and **both formats load into the same collection**.

| | `.nitro` | `.hab` |
|---|---|---|
| Header | big-endian file count | `HAB\0`, version, flags and three little-endian lengths |
| Index | per-file name and length | zlib-compressed JSON (`name`, `mimeType`, `offset`, `storedLength`, `originalLength`, `compression`) |
| Entries | zlib or gzip | `deflate` or `none` |

Notes on Habbo's `.hab` files:

- Clothes and effects name the library only in `documentClass`; the renderer uses that, then the bundle name, when the
  JSON has no `name`
- Pets carry raw palette entries next to the JSON; the colours are already in the JSON as `rgb`
- A bundle with XML and loose images (Flash-style) is refused with a clear message
- Every length is checked, so a damaged file fails loudly instead of half-loading

The reader is exported if you need it directly:

```ts
import { isHabBundle, readHabBundle, OctaneBundle } from '@octane/utils';

if(isHabBundle(buffer))
{
    const { name, entries } = readHabBundle(buffer); // [{ name, mimeType, bytes }]
}

const bundle = await OctaneBundle.from(buffer); // .hab or .nitro → bundle.jsonFile + bundle.texture
```

The room content loader also no longer stops when one start-up library (such as `landscape`) fails to load: the error
is logged and the rest of the room still loads.

## 🧾 JSON / JSONC parser

Every configuration and gamedata file goes through `@octane/utils` → `JsonParser.ts`. The mode is set at the host's
build time through the constant `__OCTANE_JSON_MODE__`:

| Mode | Behaviour |
|---|---|
| `legacy` | Strict `JSON.parse` only; comments or trailing commas raise a clear error |
| `jsonc` | Strips comments and trailing commas, then uses `JSON.parse` |
| `auto` | Strict JSON first, JSONC as a fallback (default when the constant is not set) |

Files ending in `.jsonc`, or served as `application/jsonc`, always go through JSONC. The host defines the constant in
its bundler; Octane does this for you:

```js
// vite.config in the host
export default defineConfig({
    define: { __OCTANE_JSON_MODE__: JSON.stringify('jsonc') }
});
```

```ts
import { fetchConfigJson, parseConfigJson } from '@octane/utils';

const config = await fetchConfigJson<MyConfig>('/configuration/ui-config.jsonc');
const data = parseConfigJson<MyConfig>(rawText, '/configuration/ui-config.json');
```

Errors include the source URL and, in `legacy` mode, a hint to switch to JSONC.

## 🗂️ Split-aware gamedata loader

`loadGamedata(url)` backs every gamedata consumer (furniture data, product data, effects, avatars, localization). A URL
ending in `/` is read as a folder of tiers, anything else as a single file:

```
<gamedata-dir>/
├── manifest.jsonc     optional: { "tiers": ["core", "custom", "seasonal"] }
├── core/
│   ├── manifest.jsonc required: { "files": ["a.jsonc", "b.jsonc"] }
│   └── …
├── custom/            optional
└── seasonal/          optional
```

Tiers and files merge in order, later ones winning:

| Combination | Result |
|---|---|
| Two plain objects | Merged key by key |
| Two arrays of objects with an id key (`id`, `classname`, `name`) | Merged by id |
| Two arrays without an id key | Concatenated |
| Anything else | The later value wins |

```ts
import { loadGamedata, mergeGamedata } from '@octane/utils';

const furnidata = await loadGamedata('https://example.com/gamedata/furnidata/');
const merged = mergeGamedata(coreData, customData);
```

The CLI that splits a single gamedata file into tiers lives in the Octane repo: `scripts/split-gamedata.mjs`.

## 💻 Development

| Goal | Command |
|---|---|
| Type-check (fast) | `yarn compile:fast` |
| Type-check (TypeScript 6) | `yarn compile` |
| Lint | `yarn eslint` |
| Tests | `yarn test` |
| Library build | `yarn build` |
| Check packet registration | `node scripts/packet-coverage.mjs` |

## 🤝 Related projects

| Project | What it does |
|---|---|
| [Octane](https://github.com/duckietm/Octane) | The React 19 client built on this renderer |
| [Polaris Emulator](https://github.com/duckietm/Polaris-Emulator) | The game server |
| [Confurter](https://github.com/duckietm/all-in-1-converter) | Downloads Habbo's assets and converts SWF / Nitro / HAB bundles |

Questions, bugs or ideas? Join us on [Discord](https://discord.gg/aJ46cd3F9g).

## 📄 License

The Octane Renderer is licensed under the [GNU General Public License v3.0](LICENSE).
