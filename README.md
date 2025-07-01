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

## EVI Configuration

To create or update the EVI configuration with the tic-tac-toe tool:

```bash
# Set your Hume API key (required)
export HUME_API_KEY=your_actual_api_key_here

# Optionally set a specific config ID to update
export HUME_CONFIG_ID=your_config_id_here

# Run the upsert script
bun run upsert-config
```

The script will:
- Create a tic-tac-toe tool with proper schema
- Create or update an EVI config with:
  - System prompt for tic-tac-toe gameplay
  - Anthropic Claude 3.5 Haiku model
  - Hume ITO voice
  - Tool integration

## Game Instructions

1. Choose your authentication method (Richard's config or manual)
2. Click "Start EVI Chat" to begin
3. Say things like:
   - "Let's play tic-tac-toe"
   - "I want to place my X in the center"
   - "Put my piece in the top left corner"
   - "Start a new game"

The AI will respond with moves and game updates!
