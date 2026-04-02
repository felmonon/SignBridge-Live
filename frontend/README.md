# SignBridge Live Frontend

This is the in-repo React + Vite frontend for SignBridge Live.

## Commands

Install dependencies:

```sh
npm install
```

Start the frontend dev server:

```sh
npm run dev
```

Build the production bundle served by the FastAPI backend:

```sh
npm run build
```

## Notes

- The production build is emitted to `frontend/dist`.
- The backend serves that build by default.
- The frontend uses relative `/api` requests and is designed to run behind the FastAPI backend.
