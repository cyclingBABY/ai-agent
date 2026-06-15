# SQLite persistence refactor - TODO

## Plan checklist
- [x] Inspect current `server.ts` mutation endpoints for where state changes.

- [x] Load `systemState`, `fileSystem`, `tasksHistory`, `workflowList` from SQLite KV store on server startup.

- [x] Seed SQLite with existing simulated defaults when DB keys are missing.

- [x] Persist updated objects after each mutating endpoint:

  - [ ] POST `/api/state/update` -> `systemState`
  - [ ] POST `/api/file/create-folder`, POST `/api/file/delete` -> `fileSystem`
  - [x] POST `/api/agent/simulate-step` -> `systemState`, `fileSystem`, `tasksHistory` (as applicable)
  - [ ] POST `/api/state/screenshot` -> `systemState`
  - [x] POST `/api/workflows/save` -> `workflowList`
- [ ] Keep all existing response shapes unchanged.
- [ ] Update `TODO.md` checkboxes for completed steps.
- [ ] Smoke test by restarting and verifying persistence.

