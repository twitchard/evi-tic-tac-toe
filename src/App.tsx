import React, { useState, useEffect, useCallback } from "react";
import { VoiceProvider, useVoice, VoiceReadyState } from "@humeai/voice-react";

// Hardcoded preset configurations
const PRESET_CONFIGS = [
  {
    id: "180d4963-746d-4411-a7b3-94408c1ea1c1",
    name: "Voice Tic-Tac-Toe 4o-mini",
    description: "EVI3 - gpt-4o-mini"
  },
  {
    id: "81d03945-407e-44e9-b771-211700c597d0",
    name: "Voice Tic-Tac-Toe EVI 2",
    description: "EVI2 - claude-3-7-sonnet-latest"
  },
  {
    id: "9e88321b-4c71-4189-a7d2-9855e7c6a891",
    name: "Voice Tic-Tac-Toe Sonnet",
    description: "EVI3 - claude-3-7-sonnet-latest"
  },
  {
    id: "af48e97e-7027-47e4-9ba3-e83b70647576",
    name: "Voice Tic-Tac-Toe Gemini 2.0 flash",
    description: "EVI3 - gemini-2.0-flash"
  },
  {
    id: "4cefd3dd-70c4-44c6-9579-4e95a9077de6",
    name: "storytelling genre switcher",
    description: "EVI2 - claude-3-7-sonnet-latest"
  }
];

interface UserConfig {
  id: string;
  name: string;
  description?: string;
}

interface ConfigSelectorProps {
  configMode: 'preset' | 'api-key';
  setConfigMode: (mode: 'preset' | 'api-key') => void;
  selectedPresetId: string;
  setSelectedPresetId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  selectedConfigId: string;
  setSelectedConfigId: (id: string) => void;
  userConfigs: UserConfig[];
  isLoggedIn: boolean;
  onLogin: () => void;
  onAutoCreateConfig: () => void;
  isCreatingConfig: boolean;
}

const ConfigSelector: React.FC<ConfigSelectorProps> = ({ 
  configMode, 
  setConfigMode, 
  selectedPresetId, 
  setSelectedPresetId,
  apiKey, 
  setApiKey,
  selectedConfigId,
  setSelectedConfigId,
  userConfigs,
  isLoggedIn,
  onLogin,
  onAutoCreateConfig,
  isCreatingConfig
}) => (
  <div style={{ margin: '1em 0', display: 'flex', flexDirection: 'column', gap: 16 }}>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <label>
        <input 
          type="radio" 
          checked={configMode === 'preset'} 
          onChange={() => setConfigMode('preset')} 
        />
        Use Preset Configuration
      </label>
      <label>
        <input 
          type="radio" 
          checked={configMode === 'api-key'} 
          onChange={() => setConfigMode('api-key')} 
        />
        Provide Your API Key
      </label>
    </div>

    {configMode === 'preset' && (
      <div style={{ marginLeft: '1em' }}>
        <select 
          value={selectedPresetId} 
          onChange={e => setSelectedPresetId(e.target.value)}
          style={{ padding: '0.5em', minWidth: '300px' }}
        >
          <option value="">Select a preset configuration...</option>
          {PRESET_CONFIGS.map(config => (
            <option key={config.id} value={config.id}>
              {config.name} - {config.description}
            </option>
          ))}
        </select>
      </div>
    )}

    {configMode === 'api-key' && (
      <div style={{ marginLeft: '1em', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="password"
            placeholder="Enter your Hume API Key"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            style={{ padding: '0.5em', minWidth: '300px' }}
            disabled={isLoggedIn}
          />
          {!isLoggedIn && (
            <button 
              onClick={onLogin}
              disabled={!apiKey.trim()}
              style={{ padding: '0.5em 1em' }}
            >
              Login
            </button>
          )}
        </div>

        {isLoggedIn && (
          <>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <select 
                value={selectedConfigId} 
                onChange={e => {
                  if (e.target.value === '__CREATE_NEW__') {
                    onAutoCreateConfig();
                  } else {
                    setSelectedConfigId(e.target.value);
                  }
                }}
                style={{ padding: '0.5em', minWidth: '300px' }}
                disabled={isCreatingConfig}
              >
                <option value="">Select a configuration...</option>
                <option value="__CREATE_NEW__" style={{ fontWeight: 'bold', color: '#007bff' }}>
                  ➕ Create new tic-tac-toe config
                </option>
                {userConfigs.map(config => (
                  <option key={config.id} value={config.id}>
                    {config.name} {config.description && `- ${config.description}`}
                  </option>
                ))}
              </select>
            </div>

            {isCreatingConfig && (
              <div style={{ marginTop: '0.5em', padding: '0.5em', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.9em' }}>
                🔄 Creating your tic-tac-toe configuration...
              </div>
            )}

            {selectedConfigId && selectedConfigId !== '__CREATE_NEW__' && (
              <div style={{ marginTop: '0.5em' }}>
                <a 
                  href={`https://platform.hume.ai/evi/playground?configId=${selectedConfigId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#007bff', textDecoration: 'none' }}
                >
                  📝 Edit this config in the playground →
                </a>
              </div>
            )}
          </>
        )}
      </div>
    )}
  </div>
);

const Controls = ({ userName, onUserNameChange }: { userName: string; onUserNameChange: (name: string) => void }) => {
  const { connect, disconnect, readyState, mute, unmute, isMuted } = useVoice();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label htmlFor="userName" style={{ fontWeight: 'bold' }}>Your Name:</label>
        <input
          id="userName"
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => onUserNameChange(e.target.value)}
          style={{ 
            padding: '0.5em', 
            minWidth: '200px',
            border: '1px solid #ccc',
            borderRadius: '4px'
          }}
          disabled={readyState === VoiceReadyState.OPEN}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {readyState === VoiceReadyState.OPEN ? (
          <>
            <button onClick={disconnect}>End Session</button>
            {isMuted ? (
              <button onClick={unmute}>Unmute</button>
            ) : (
              <button onClick={mute}>Mute</button>
            )}
          </>
        ) : (
          <button onClick={() => connect()}>Start EVI Chat</button>
        )}
      </div>
    </div>
  );
};

const Messages = () => {
  const { messages } = useVoice();
  return (
    <div style={{ margin: '1em 0' }}>
      {messages.map((msg: any, i: number) => {
        if (msg.type === "user_message" || msg.type === "assistant_message") {
          return (
            <div
              key={msg.type + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.message.role === "assistant" ? 'flex-start' : 'flex-end',
                marginBottom: '0.5em',
              }}
            >
              <div
                style={{
                  background: msg.message.role === "assistant" ? '#e3eafc' : '#d1f7c4',
                  color: '#222',
                  borderRadius: '1em',
                  padding: '0.5em 1em',
                  maxWidth: '70%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                }}
              >
                <strong style={{ fontSize: '0.9em', marginRight: 8 }}>
                  {msg.message.role === "assistant" ? "EVI" : "You"}
                </strong>
                <span>{msg.message.content}</span>
              </div>
            </div>
          );
        } else if (msg.type === "tool_call") {
          return (
            <div
              key={msg.type + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                marginBottom: '0.5em',
              }}
            >
              <div
                style={{
                  background: '#fff3cd',
                  color: '#856404',
                  borderRadius: '0.5em',
                  padding: '0.5em 1em',
                  maxWidth: '70%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #ffeaa7',
                }}
              >
                <strong style={{ fontSize: '0.9em', marginRight: 8 }}>
                  Tool Call
                </strong>
                <div style={{ fontSize: '0.85em', marginTop: '0.25em' }}>
                  <div><strong>Function:</strong> {msg.name}</div>
                  <div><strong>Parameters:</strong> {msg.parameters}</div>
                </div>
              </div>
            </div>
          );
        } else if (msg.type === "tool_response") {
          return (
            <div
              key={msg.type + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginBottom: '0.5em',
              }}
            >
              <div
                style={{
                  background: '#d4edda',
                  color: '#155724',
                  borderRadius: '0.5em',
                  padding: '0.5em 1em',
                  maxWidth: '70%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #c3e6cb',
                }}
              >
                <strong style={{ fontSize: '0.9em', marginRight: 8 }}>
                  Tool Response
                </strong>
                <div style={{ fontSize: '0.85em', marginTop: '0.25em' }}>
                  {msg.content}
                </div>
              </div>
            </div>
          );
        } else if (msg.type === "tool_error") {
          return (
            <div
              key={msg.type + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                marginBottom: '0.5em',
              }}
            >
              <div
                style={{
                  background: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '0.5em',
                  padding: '0.5em 1em',
                  maxWidth: '70%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #f5c6cb',
                }}
              >
                <strong style={{ fontSize: '0.9em', marginRight: 8 }}>
                  Tool Error
                </strong>
                <div style={{ fontSize: '0.85em', marginTop: '0.25em' }}>
                  {msg.content || msg.error}
                </div>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
};



function useNewConfigSystem() {
  const [configMode, setConfigMode] = useState<'preset' | 'api-key'>(() => 
    localStorage.getItem('configMode') as 'preset' | 'api-key' || 'preset'
  );
  const [selectedPresetId, setSelectedPresetId] = useState(() => 
    localStorage.getItem('selectedPresetId') || PRESET_CONFIGS[0]?.id || ''
  );
  const [apiKey, setApiKey] = useState(() => 
    localStorage.getItem('userApiKey') || ''
  );
  const [selectedConfigId, setSelectedConfigId] = useState(() => 
    localStorage.getItem('selectedConfigId') || ''
  );
  const [userConfigs, setUserConfigs] = useState<UserConfig[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreatingConfig, setIsCreatingConfig] = useState(false);

  useEffect(() => { localStorage.setItem('configMode', configMode); }, [configMode]);
  useEffect(() => { localStorage.setItem('selectedPresetId', selectedPresetId); }, [selectedPresetId]);
  useEffect(() => { localStorage.setItem('userApiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('selectedConfigId', selectedConfigId); }, [selectedConfigId]);

  const fetchUserConfigs = useCallback(async () => {
    if (!apiKey.trim()) return;
    
    try {
      // Using Hume API to fetch user configs
      const response = await fetch('https://api.hume.ai/v0/evi/configs', {
        headers: {
          'X-Hume-Api-Key': apiKey,
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch configs: ${response.status}`);
      }
      
      const data = await response.json();
      const configs = data.configs_page?.map((config: any) => ({
        id: config.id,
        name: config.name || `Config ${config.id}`,
        description: `EVI${config.evi_version || 'Unknown'} - ${config.language_model?.model_resource || 'Default Model'}`
      })) || [];
      
      setUserConfigs(configs);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Failed to fetch user configs:', error);
      alert('Failed to login. Please check your API key.');
      setIsLoggedIn(false);
    }
  }, [apiKey]);

  const autoCreateConfig = useCallback(async () => {
    if (!apiKey.trim()) return;
    
    setIsCreatingConfig(true);
    setSelectedConfigId('');
    try {
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
      const configToAdd = {
        id: newConfig.id,
        name: newConfig.name,
        description: 'Auto-created tic-tac-toe config'
      };
      
      setUserConfigs(prev => [configToAdd, ...prev]);
      setSelectedConfigId(newConfig.id);
      
    } catch (error) {
      console.error('Failed to create config:', error);
      alert(`Failed to create config: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsCreatingConfig(false);
    }
  }, [apiKey]);

  return {
    configMode,
    setConfigMode,
    selectedPresetId,
    setSelectedPresetId,
    apiKey,
    setApiKey,
    selectedConfigId,
    setSelectedConfigId,
    userConfigs,
    isLoggedIn,
    fetchUserConfigs,
    autoCreateConfig,
    isCreatingConfig
  };
}

function useAccessToken(enabled: boolean) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    fetch("https://twitchard--9ab36d7231c711f08203569c3dd06744.web.val.run/")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => setAccessToken(data.access_token))
      .catch(e => setError(e.message || 'Failed to fetch access token'))
      .finally(() => setLoading(false));
  }, [enabled]);
  return { accessToken, loading, error };
}

type Square = 'top left' | 'top' | 'top right' | 'left' | 'center' | 'right' | 'bottom left' | 'bottom' | 'bottom right';
type Piece = 'x' | 'o';
type Move = {
  piece: Piece;
  square: Square;
};
type Action =
  | {
    type: "move";
    move: {
      who: "player" | "computer";
      where: Square;
    };
  }
  | {
    type: "new_game";
  };
type GameResult = 'success' | 'failure' | 'x wins' | 'o wins' | 'draw' 

const squareToIndex = (square: Square): [number, number] => {
  return {
    'top left': [0, 0],
    'top': [0, 1],
    'top right': [0, 2],
    'left': [1, 0],
    'center': [1, 1],
    'right': [1, 2],
    'bottom left': [2, 0],
    'bottom': [2, 1],
    'bottom right': [2, 2],
  }[square] as [number, number];
};

const isSquareFree = (board: string[][], square: Square): boolean => {
  const [x, y] = squareToIndex(square);
  return board[x][y] === '.';
};

const applyMove = (board: string[][], move: Move): string[][] => {
  const [x, y] = squareToIndex(move.square);
  const newBoard = board.map(row => [...row]);
  newBoard[x][y] = move.piece;
  return newBoard;
};

const tictactoes = [
  [[0, 0], [0, 1], [0, 2]],
  [[1, 0], [1, 1], [1, 2]],
  [[2, 0], [2, 1], [2, 2]],
  [[0, 0], [1, 0], [2, 0]],
  [[0, 1], [1, 1], [2, 1]],
  [[0, 2], [1, 2], [2, 2]],
  [[0, 0], [1, 1], [2, 2]],
  [[0, 2], [1, 1], [2, 0]],
];

const checkBoard = (board: string[][]): GameResult => {
  for (const tictactoe of tictactoes) {
    const [a, b, c] = tictactoe;
    if (board[a[0]][a[1]] === 'x' && board[b[0]][b[1]] === 'x' && board[c[0]][c[1]] === 'x') {
      return 'x wins';
    }
    if (board[a[0]][a[1]] === 'o' && board[b[0]][b[1]] === 'o' && board[c[0]][c[1]] === 'o') {
      return 'o wins';
    }
  }
  if (board.flat().every(cell => cell !== '.')) {
    return 'draw';
  }
  return 'success';
};

const makeMove = (board: string[][], move: Move): [string[][], GameResult] => {
  if (!isSquareFree(board, move.square)) {
    return [board, 'failure'];
  }
  const newBoard = applyMove(board, move);
  
  if (!validatePieceCounts(newBoard)) {
    return [board, 'failure'];
  }
  
  const result = checkBoard(newBoard);
  return [newBoard, result];
};

const other = (who: Piece): Piece => who === 'x' ? 'o' : 'x';

const validatePieceCounts = (board: string[][]): boolean => {
  const flat = board.flat();
  const xCount = flat.filter(cell => cell === 'x').length;
  const oCount = flat.filter(cell => cell === 'o').length;
  
  // X should have either equal pieces to O, or exactly 1 more than O
  // O should never have more pieces than X
  return oCount <= xCount && xCount <= oCount + 1;
};

const emptyBoard = (): string[][] => ['...', '...', '...'].map(row => row.split(''));

const TicTacToeBoard: React.FC<{ board: string[][] }> = ({ board }) => {
  const cellStyle = {
    width: '60px',
    height: '60px',
    border: '2px solid #333',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 'bold',
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 60px)', 
      gap: '4px',
      margin: '1em 0',
      justifyContent: 'center'
    }}>
      {board.map((row, i) =>
        row.map((cell, j) => (
          <div key={`${i}-${j}`} style={cellStyle}>
            {cell === '.' ? '' : cell.toUpperCase()}
          </div>
        ))
      )}
    </div>
  );
};

const NameContextManager: React.FC<{ userName: string }> = ({ userName }) => {
  const { sendSessionSettings, readyState } = useVoice();
  
  useEffect(() => {
    if (readyState === VoiceReadyState.OPEN && userName.trim()) {
      sendSessionSettings({
        type: "session_settings",
        context: {
          text: `The user's name is ${userName.trim()}. Please address them by their name when appropriate and remember this throughout our conversation.`,
          type: "persistent"
        }
      });
    }
  }, [userName, readyState, sendSessionSettings]);

  return null; // This component doesn't render anything
};

const GameManager: React.FC = () => {
  const { sendToolMessage } = useVoice();
  const [board, setBoard] = useState<string[][]>(() => emptyBoard());
  const [computerPiece, setComputerPiece] = useState<Piece>('o');
  const [whoseMove, setWhoseMove] = useState<Piece>('x');
  const [processedToolCalls, setProcessedToolCalls] = useState<Set<string>>(new Set());

  const handleToolCall = useCallback((toolCall: any) => {
    if (!toolCall.name.startsWith('tic_tac_toe_move')) {
      return;
    }

    const params = JSON.parse(toolCall.parameters) as Action;
    
    if (params.type === 'move') {
      const piece: Piece = params.move.who === 'computer' ? computerPiece : other(computerPiece);
      const move = { piece, square: params.move.where };
      const [newBoard, result] = makeMove(board, move);
      
      if (result === 'failure') {
        console.log("Illegal move attempted:", {
          board,
          move,
          piece,
          whoseMove,
          computerPiece
        });
        sendToolMessage({
          type: "tool_error",
          toolCallId: toolCall.toolCallId,
          error: "Illegal move",
          content: "You have attempted to make an illegal move. Law enforcement has been contacted and is on route to your location."
        });
        return;
      }
      
      if (result === 'success') {
        setBoard(newBoard);
        sendToolMessage({
          type: "tool_response",
          toolCallId: toolCall.toolCallId,
          content: JSON.stringify({
            newBoard,
            result
          })
        });
      }
      
      if (result === 'success') {
        setWhoseMove(other(whoseMove));
      }
      
      if (result === 'x wins' || result === 'o wins' || result === 'draw') {
        const newEmptyBoard = emptyBoard();
        const newComputerPiece = other(computerPiece);
        setBoard(newEmptyBoard);
        setComputerPiece(newComputerPiece);
        setWhoseMove('x');
        sendToolMessage({
          type: "tool_response",
          toolCallId: toolCall.toolCallId,
          content: JSON.stringify({
            board: newEmptyBoard,
            result,
            computerPiece: newComputerPiece
          })
        });
      }
    }
    
    if (params.type === 'new_game') {
      const newEmptyBoard = emptyBoard();
      const newComputerPiece = other(computerPiece);
      setBoard(newEmptyBoard);
      setComputerPiece(newComputerPiece);
      setWhoseMove('x');
      sendToolMessage({
        type: "tool_response",
        toolCallId: toolCall.toolCallId,
        content: JSON.stringify({
          board: newEmptyBoard,
          computerPiece: newComputerPiece,
          whoseMove: 'x'
        })
      });
    }
  }, [board, computerPiece, whoseMove, sendToolMessage]);

  const { messages } = useVoice();
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.type === 'tool_call' && !processedToolCalls.has(lastMessage.toolCallId)) {
      setProcessedToolCalls(prev => new Set([...prev, lastMessage.toolCallId]));
      handleToolCall(lastMessage);
    }
  }, [messages, handleToolCall, processedToolCalls]);

  return <TicTacToeBoard board={board} />;
};

const App: React.FC = () => {
  const config = useNewConfigSystem();
  const { accessToken, loading: tokenLoading, error: tokenError } = useAccessToken(config.configMode === 'preset');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');

  // Save userName to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  if (config.configMode === 'preset' && tokenLoading) return <div>Loading voice access...</div>;
  if (config.configMode === 'preset' && tokenError) return <div>Error: {tokenError}</div>;

  // Determine the config ID to use
  const configId = config.configMode === 'preset' 
    ? config.selectedPresetId 
    : config.selectedConfigId;

  // Determine the auth method
  const auth = config.configMode === 'preset' 
    ? { type: 'accessToken' as const, value: accessToken! }
    : { type: 'apiKey' as const, value: config.apiKey };

  return (
    <div style={{ padding: '2em', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Voice Tic-Tac-Toe</h1>
      <ConfigSelector 
        configMode={config.configMode}
        setConfigMode={config.setConfigMode}
        selectedPresetId={config.selectedPresetId}
        setSelectedPresetId={config.setSelectedPresetId}
        apiKey={config.apiKey}
        setApiKey={config.setApiKey}
        selectedConfigId={config.selectedConfigId}
        setSelectedConfigId={config.setSelectedConfigId}
        userConfigs={config.userConfigs}
        isLoggedIn={config.isLoggedIn}
        onLogin={config.fetchUserConfigs}
        onAutoCreateConfig={config.autoCreateConfig}
        isCreatingConfig={config.isCreatingConfig}
      />
      {configId && (
        <VoiceProvider
          configId={configId}
          auth={auth}
        >
          <Controls userName={userName} onUserNameChange={setUserName} />
          <NameContextManager userName={userName} />
          <Messages />
          <GameManager />
        </VoiceProvider>
      )}
      {!configId && (
        <div style={{ padding: '1em', textAlign: 'center', color: '#666' }}>
          Please select a configuration to start playing.
        </div>
      )}
    </div>
  );
};

export default App;
