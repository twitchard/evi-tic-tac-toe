import { HumeClient } from 'hume';

// Get API key from environment variable or use default (with 'x' appended for safety)
const API_KEY = process.env.HUME_API_KEY!;
const CONFIG_ID = process.env.HUME_CONFIG_ID!;

if (!process.env.HUME_API_KEY) {
  console.warn('⚠️  Using default API key (with safety suffix). Set HUME_API_KEY environment variable for actual usage.');
}

const hume = new HumeClient({
  apiKey: API_KEY
});

const TOOL_SCHEMA = {
  type: "object" as const,
  required: ["type"],
  properties: {
    type: {
      type: "string" as const,
      enum: ["move", "new_game"],
    },
    move: {
      type: "object" as const,
      properties: {
        who: {
          type: "string" as const,
          enum: ["player", "computer"],
        },
        where: {
          type: "string" as const,
          enum: [
            "top left", "top", "top right",
            "left", "center", "right",
            "bottom left", "bottom", "bottom right"
          ],
        }
      },
      required: ["who", "where"]
    }
  }
};

const SYSTEM_PROMPT = `
You are EVI, a tic-tac-toe-playing conversational voice interface
  
<capabilities>
  <capability>You play each game either as X or O (always who is who before moving)</capability>
  <capability>Describe board state clearly</capability>
  <capability>Make strategic moves via tic_tac_toe_move tool</capability>
</capabilities>

<behavior>
  <trait>Conversational and encouraging</trait>
  <trait>Trust tools to enforce ALL game rules</trait>
  <trait>Report ALL error messages verbatim to user</trait>
  <trait>Execute user moves without questioning legality</trait>
</behavior>

<constraints>
  <constraint>Never dismiss errors as jokes</constraint>
  <constraint>Use tic_tac_toe_move for all game actions</constraint>
  <constraint>Pass user requests directly to tool - no rule validation</constraint>
</constraints>
`;

async function createOrUseTool() {
  try {
    console.log('Creating tic-tac-toe tool...');

    const tool = await hume.empathicVoice.tools.createTool({
      name: "tic_tac_toe_move",
      description: "Make a move in tic-tac-toe or start a new game",
      parameters: JSON.stringify(TOOL_SCHEMA)
    });

    console.log('Tool created:', tool);
    return tool!.id;
  } catch (error: any) {
    if (error.statusCode === 409 && error.body?.message?.includes('tic_tac_toe_move')) {
      // Tool name exists, create with a versioned name instead
      console.log('Tool name exists, creating with version suffix...');
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[-:]/g, '');
      const versionedName = `tic_tac_toe_move_${timestamp}`;

      const tool = await hume.empathicVoice.tools.createTool({
        name: versionedName,
        description: "Make a move in tic-tac-toe or start a new game",
        parameters: JSON.stringify(TOOL_SCHEMA)
      });

      console.log('Versioned tool created:', tool);
      return tool.id;
    }
    console.error('Error creating tool:', error);
    throw error;
  }
}

async function upsertConfig(toolId: string) {
  console.log('Upserting EVI config...');

  const updatedConfig = await hume.empathicVoice.configs.createConfigVersion(CONFIG_ID, {
    prompt: {
      text: SYSTEM_PROMPT
    },
    voice: {
      provider: "HUME_AI",
      name: "Unserious Movie Trailer Narrator"
    },
    languageModel: {},
    eviVersion: "3",
    context_injection: { enabled: true },
    tools: [{ id: toolId }]
  });

  console.log('Config updated:', updatedConfig);
  return updatedConfig;
}

async function main() {
  console.log('Starting EVI config upsert process...');

  const toolId = await createOrUseTool();
  const config = await upsertConfig(toolId);

  console.log('✅ Success!');
  console.log('Config ID:', config.id);
  console.log('Tool ID:', toolId);
  console.log('Use this config ID in your application:', config.id);

}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
