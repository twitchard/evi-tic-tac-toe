import React, { useState, useEffect, useCallback, useRef } from "react";
import { VoiceProvider, useVoice, VoiceReadyState } from "@humeai/voice-react";
import { HumeConfigSelector } from "./components/HumeConfigSelector";
import type { PresetConfig } from "./components/HumeConfigSelector";
import { createTicTacToeConfig } from "./utils/ticTacToeConfig";

// Hardcoded preset configurations for tic-tac-toe
const PRESET_CONFIGS: PresetConfig[] = [
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
  }
];

const Controls = ({ userName, onUserNameChange }: { userName: string; onUserNameChange: (name: string) => void }) => {
  const { connect, disconnect, readyState, mute, unmute, isMuted } = useVoice();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label htmlFor="userName" style={{ fontWeight: 'bold' }}>
          Your Name (sent via session_settings context when you edit):
        </label>
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div style={{ 
      margin: '1em 0',
      height: '400px',
      overflowY: 'auto',
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '1em',
      backgroundColor: '#fafafa'
    }}>
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
        } else if (msg.type === "session_settings") {
          return (
            <div
              key={msg.type + i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '0.5em',
              }}
            >
              <div
                style={{
                  background: '#e7f3ff',
                  color: '#004085',
                  borderRadius: '0.5em',
                  padding: '0.75em',
                  maxWidth: '90%',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  border: '1px solid #b3d7ff',
                  fontSize: '0.9em',
                }}
              >
                <div style={{ marginBottom: '0.5em' }}>
                  <strong style={{ fontSize: '1em', color: '#0056b3' }}>
                    🔧 Session Settings Sent
                  </strong>
                </div>
                <pre style={{ 
                  margin: 0,
                  padding: '0.5em',
                  backgroundColor: '#f8f9fa',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.8em',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  color: '#495057'
                }}>
                  {JSON.stringify(msg, null, 2)}
                </pre>
              </div>
            </div>
          );
        } else {
          // Fallback for unknown message types (excluding audio messages)
          if (msg.type && !msg.type.includes('audio') && msg.type !== 'audio_input' && msg.type !== 'audio_output') {
            return (
              <div
                key={msg.type + i}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '0.5em',
                }}
              >
                <div
                  style={{
                    background: '#f8f9fa',
                    color: '#495057',
                    borderRadius: '0.5em',
                    padding: '0.5em 1em',
                    maxWidth: '80%',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: '1px solid #dee2e6',
                    fontSize: '0.85em',
                  }}
                >
                  <strong style={{ fontSize: '0.9em', marginRight: 8 }}>
                    {msg.type}
                  </strong>
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    fontFamily: 'monospace', 
                    fontSize: '0.8em',
                    marginTop: '0.25em'
                  }}>
                    {JSON.stringify(msg, null, 2)}
                  </pre>
                </div>
              </div>
            );
          }
        }
        return null;
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

function useAccessToken(enabled: boolean) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  useEffect(() => {
    if (!enabled) return;
    setLoading(true);
    setError('');
    // Environment variable ACCESS_TOKEN_URL can be set to override the default endpoint
    // For local development: export ACCESS_TOKEN_URL=https://your-endpoint.com/api/token
    // For Vercel deployment: set ACCESS_TOKEN_URL in the environment variables
    if (!process.env.HUME_ACCESS_TOKEN_URL) {
      throw new Error('HUME_ACCESS_TOKEN_URL is not set');
    }
    fetch(process.env.HUME_ACCESS_TOKEN_URL)
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
  const [debouncedUserName, setDebouncedUserName] = useState(userName);
  const [lastSentName, setLastSentName] = useState('');

  // Debounce the userName to avoid sending context updates on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedUserName(userName);
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [userName]);
  
  useEffect(() => {
    console.log(`NameContextManager: readyState=${readyState}, name="${debouncedUserName}", lastSent="${lastSentName}"`);
    
    if (readyState === VoiceReadyState.OPEN && debouncedUserName.trim() && debouncedUserName !== lastSentName) {
      console.log(`✅ Sending context for name: "${debouncedUserName}"`);
      try {
        sendSessionSettings({
          context: {
            text: `The user's name is ${debouncedUserName.trim()}. Please address them by their name when appropriate and remember this throughout our conversation.`,
            type: "persistent"
          }
        });
        setLastSentName(debouncedUserName);
      } catch (error) {
        console.error('❌ Failed to send session settings:', error);
      }
    }
  }, [debouncedUserName, readyState, sendSessionSettings, lastSentName]);

  // Reset lastSentName when session closes so context gets sent again on reconnect
  useEffect(() => {
    if (readyState !== VoiceReadyState.OPEN) {
      setLastSentName('');
    }
  }, [readyState]);

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
  const [selectedConfig, setSelectedConfig] = useState<{
    configId: string;
    authType: 'preset' | 'api-key';
    apiKey?: string;
  } | null>(null);
  
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || '');

  // Save userName to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('userName', userName);
  }, [userName]);

  // Fetch access token for preset configs
  const { accessToken, loading: tokenLoading, error: tokenError } = useAccessToken(
    selectedConfig?.authType === 'preset'
  );

  // Show loading state for preset configs
  if (selectedConfig?.authType === 'preset' && tokenLoading) {
    return <div>Loading voice access...</div>;
  }
  
  if (selectedConfig?.authType === 'preset' && tokenError) {
    return <div>Error: {tokenError}</div>;
  }

  // Determine the auth method
  const auth = selectedConfig
    ? selectedConfig.authType === 'preset'
      ? { type: 'accessToken' as const, value: accessToken! }
      : { type: 'apiKey' as const, value: selectedConfig.apiKey! }
    : null;

  return (
    <div style={{ padding: '2em', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Voice Tic-Tac-Toe</h1>
      
             <HumeConfigSelector
         presetConfigs={PRESET_CONFIGS}
         onConfigSelected={(configId, authType, apiKey) => {
           setSelectedConfig({ configId, authType, apiKey });
         }}
         createTicTacToeConfig={createTicTacToeConfig}
       />
      
      {selectedConfig && auth && (
        <VoiceProvider
          configId={selectedConfig.configId}
          auth={auth}
        >
          <Controls userName={userName} onUserNameChange={setUserName} />
          <NameContextManager userName={userName} />
          <Messages />
          <GameManager />
        </VoiceProvider>
      )}
      
      {!selectedConfig && (
        <div style={{ padding: '1em', textAlign: 'center', color: '#666' }}>
          Please select a configuration to start playing.
        </div>
      )}
    </div>
  );
};

export default App;
