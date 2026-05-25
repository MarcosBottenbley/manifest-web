# manifest-web

React PWA frontend for [Manifest](https://github.com/MarcosBottenbley/manifest-api) — a self-hosted home inventory app.

**Stack:** React 19 · TypeScript · Vite · Tailwind CSS · PWA

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Requires `manifest-api` to be running on `localhost:3000` (the Vite dev server proxies `/api` there automatically).

## Features

- Item list with search and filters (category, room, status)
- Add / edit items with full metadata
- Photo and document attachment management
- QR label generation — print a label for any item
- QR scanner — scan a printed label to jump directly to that item
- Barcode scan to prefill product details at add-time (requires `ENABLE_UPC_LOOKUP=true` on the API)
- PWA — installable to your phone's home screen

## License

MIT
