export async function createTicTacToeConfig(apiKey: string): Promise<{ id: string; name: string; description?: string }> {
  // Step 1: Create the tool first
  const toolSchema = {
    type: "object",
    required: ["type"],
    properties: {
      type: {
        type: "string",
        enum: ["move", "new_game"]
      },
      move: {
        type: "object",
        properties: {
          who: {
            type: "string",
            enum: ["player", "computer"]
          },
          where: {
            type: "string",
            enum: [
              "top left", "top", "top right",
              "left", "center", "right",
              "bottom left", "bottom", "bottom right"
            ]
          }
        },
        required: ["who", "where"]
      }
    }
  };

  // Create unique tool name to avoid conflicts
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
  const toolName = `tic_tac_toe_move_${timestamp}`;

  const toolResponse = await fetch('https://api.hume.ai/v0/evi/tools', {
    method: 'POST',
    headers: {
      'X-Hume-Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: toolName,
      description: "Make a move in tic-tac-toe or start a new game",
      parameters: JSON.stringify(toolSchema)
    })
  });

  if (!toolResponse.ok) {
    throw new Error(`Failed to create tool: ${toolResponse.status} ${await toolResponse.text()}`);
  }

  const tool = await toolResponse.json();

  // Step 2: Create the config referencing the tool by ID
  const configData = {
    name: "Voice Tic-Tac-Toe Config",
    prompt: {
      text: `You are EVI, a tic-tac-toe-playing conversational voice interface

<capabilities>
  <capability>You play each game either as X or O (always clarify who is who before moving)</capability>
  <capability>Describe board state clearly</capability>
  <capability>Make strategic moves via ${toolName} tool</capability>
</capabilities>

<behavior>
  <trait>Conversational and encouraging</trait>
  <trait>Trust tools to enforce ALL game rules</trait>
  <trait>Report ALL error messages verbatim to user</trait>
  <trait>Execute user moves without questioning legality</trait>
</behavior>

<constraints>
  <constraint>Never dismiss errors as jokes</constraint>
  <constraint>Use ${toolName} for all game actions</constraint>
  <constraint>Pass user requests directly to tool - no rule validation</constraint>
</constraints>`
    },
    tools: [{ id: tool.id }] // Reference the tool by ID
  };

  const configResponse = await fetch('https://api.hume.ai/v0/evi/configs', {
    method: 'POST',
    headers: {
      'X-Hume-Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(configData)
  });

  if (!configResponse.ok) {
    throw new Error(`Failed to create config: ${configResponse.status} ${await configResponse.text()}`);
  }

  const newConfig = await configResponse.json();
  
  return {
    id: newConfig.id,
    name: newConfig.name,
    description: 'Auto-created tic-tac-toe config'
  };
} 