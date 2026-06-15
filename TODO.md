# TODO - Desktop app with embedded DB

- [x] Add Electron main process + preload (implemented)

- [ ] Add SQLite dependency + DB helper layer

- [x] Refactor `server.ts` to use SQLite-backed persistence for state/history/workflows/files
- [x] Seed SQLite with existing simulated defaults when DB is empty

- [ ] Update `package.json` scripts for Electron dev/build
- [ ] Verify endpoints work with unchanged frontend contract
- [ ] Smoke test: restart app and confirm data persists

