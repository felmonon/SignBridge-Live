# Troubleshooting

## `ModuleNotFoundError: No module named 'uvicorn'`

Use the project virtual environment:

```sh
cd /Users/felmonfekadu/Developer/SignLanguage
./SignLanguage/bin/python run.py
```

If needed:

```sh
source SignLanguage/bin/activate
pip install -r requirements.txt
```

## The backend says the frontend build is missing

Build the companion frontend:

```sh
cd "/Users/felmonfekadu/Desktop/SignBridge Live Web App Design"
npm install
npm run build
```

If the frontend build lives somewhere else, set:

```sh
export FRONTEND_DIST_DIR="/absolute/path/to/dist"
```

## Camera works but translation does not

Check:

- browser camera permission is granted
- `GEMINI_API_KEY` is set
- `GET /api/health` shows `gemini: true`
- the signer is clearly visible with good lighting
- clip timing is long enough for the signed utterance

## Translation works but voice output does not

Check:

- `OPENAI_API_KEY` is set
- `GET /api/health` shows `openai_tts: true`
- browser audio is enabled
- the page has received a user gesture so playback is allowed

## The browser loads but assets 404

This usually means:

- the frontend was not rebuilt
- `FRONTEND_DIST_DIR` is wrong
- the backend is pointing at an old or missing `dist/`

## GitHub push fails

If `gh auth status` reports an invalid token, re-authenticate:

```sh
gh auth login -h github.com
```

Then create or connect the remote repository and push again.

## API keys were exposed

Rotate them immediately:

- regenerate the Gemini key
- regenerate the OpenAI key
- update `.env`
- do not commit `.env`
