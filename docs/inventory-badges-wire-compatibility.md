# Inventory badges: deployed Polaris compatibility

## Evidence (2026-09-15)

`IncomingHeader.USER_BADGES` and Polaris `Outgoing.InventoryBadgesComposer` use header **717**. The deployed `polaris-local-polaris-1:/opt/polaris/polaris.jar` was copied read-only and inspected with `javap -c`; its `InventoryBadgesComposer.composeInternal` matches the legacy source at `Polaris-Emulator/Emulator/src/main/java/com/eu/habbo/messages/outgoing/inventory/InventoryBadgesComposer.java`. No server or session state was changed.

| Position | Legacy deployed Polaris | Current Renderer metadata schema |
| --- | --- | --- |
| 1 | owned count: int | owned count: int |
| repeated owned record | id: int, code: string | id: int, code: string, ownerCount: int, rarity: int |
| after owned records | equipped count: int | equipped count: int |
| repeated equipped record | slot: int, code: string | slot: int, code: string |

Strings use the existing two-byte length plus UTF-8 bytes. Both schemas end after the equipped records. Neither includes a version discriminator. Existing packet catalogs exempt header 717 from static field extraction because of its variable loops; this fix does not modify either manifest.

## Decoder behavior

EvaWire exposes an exact unread byte count. `BadgesParser` copies this one payload and validates the complete current metadata schema first, then the complete legacy schema against an independent cursor. Counts must fit the remaining payload, strings must stay within bounds, and the final cursor must equal the end of the payload. Failed attempts do not publish partial badge state. Legacy records receive ownerCount=0 and rarity=0; they do not manufacture rarity data.

The current metadata schema wins if an unversioned byte sequence happens to match both shapes. Transports that cannot provide replayable bytes retain the current metadata schema only. Future wire changes should negotiate a version instead of adding further heuristic variants. This is whole-message compatibility, never a bytes-available guess inside the record loop.

## AIR provenance boundary

WIN63-202609091217-117204808 `decompiled/scripts/package_194/class_3428.as` reads **totalFragments, fragmentNo, owned count**, then id/code/ownerCount/rarity records. It has no equipped tail. `com/sulake/habbo/inventory/class_1951.as:onBadges` assembles these fragments before updating the model. Thus the current Renderer 717 metadata schema is a project compatibility contract, not the exact September AIR transport. This fix preserves it; porting fragment transport requires a separate coordinated change.

## Verification

- Focused byte fixtures: modern/legacy multi-record inventory and equipped badges, UTF-8 code, empty inventory, every truncation offset of both populated payloads, trailing bytes and impossible/negative counts. Six tests pass.
- Focused ESLint passes for the parser and protocol fixtures.
- Full Renderer `tsgo --project ./tsconfig.json --noEmit` passes.
- Renderer `vite build` passes; log: `/tmp/inventory-badge-renderer-build.log`.
- Browser receipt and badge rendering belong to the parent inventory runtime check; these byte fixtures alone do not establish UI parity.
