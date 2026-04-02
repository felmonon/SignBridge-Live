# Troubleshooting

## `ModuleNotFoundError: No module named 'uvicorn'`

Run the backend from the project virtual environment:

```sh
cd /Users/felmonfekadu/Developer/SignLanguage
source .venv/bin/activate
python run.py
```

If needed:

```sh
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Frontend build is missing

Build the in-repo frontend:

```sh
cd /Users/felmonfekadu/Developer/SignLanguage/frontend
npm install
npm run build
```

If you intentionally serve a different build directory, set:

```sh
export FRONTEND_DIST_DIR="/absolute/path/to/dist"
```

## Camera works but translation does not

Check:

- browser camera permission is granted
- `GEMINI_API_KEY` is set
- `GET /api/health` shows `gemini: true`
- the signer is visible with good lighting
- clip timing is long enough for the utterance

## Translation works but voice output does not

Check:

- `OPENAI_API_KEY` is set
- `GET /api/health` shows `openai_tts: true`
- browser audio is enabled
- the page has received a user gesture so browser playback is allowed

## Browser loads but assets 404

This usually means:

- `frontend/dist` was not rebuilt
- `FRONTEND_DIST_DIR` is wrong
- the backend is pointing at a stale build

## GitHub push fails

Check:

```sh
gh auth status
```

If auth is invalid:

```sh
gh auth login -h github.com
```

## API keys were exposed

Rotate them immediately:

- regenerate the Gemini key
- regenerate the OpenAI key
- update `.env`
- do not commit `.env`
