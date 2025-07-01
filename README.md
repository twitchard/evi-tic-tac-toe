# Voice Tic-Tac-Toe

A React-based voice-controlled tic-tac-toe game using Hume's Empathic Voice Interface (EVI).

## Features

- **Voice Interaction**: Play tic-tac-toe using voice commands through EVI
- **Chat UI**: Modern chat interface with message bubbles
- **Mute Controls**: Toggle microphone on/off during gameplay
- **Flexible Authentication**: Use Richard's config or provide your own API keys
- **Visual Game Board**: See the current game state with a 3x3 grid

## Setup

1. Install dependencies:
```bash
bun install
```

2. Run the development server:
```bash
bun run dev
```

3. Open http://localhost:3000 in your browser

## Environment Variables

### Access Token URL

To use "preset" EVI configs, you must provide the `HUME_ACCESS_TOKEN_URL` environment variable at build time, pointing to a GET endpoint that returns `{"access_token":"..."}`. I currently have this set to a [val.town](https://val.town) endpoint that uses my Hume API key.

**For local development:**
```bash
export ACCESS_TOKEN_URL=https://your-custom-endpoint.com/api/token
bun run build
```

**For Vercel deployment:**
Set the `ACCESS_TOKEN_URL` environment variable in your Vercel project settings.

## Game Instructions

1. Choose your authentication method (Richard's config or manual)
2. Click "Start EVI Chat" to begin
3. Say things like:
   - "Let's play tic-tac-toe"
   - "I want to place my X in the center"
   - "Put my piece in the top left corner"
   - "Start a new game"

The AI will respond with moves and game updates!
