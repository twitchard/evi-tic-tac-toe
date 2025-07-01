# HumeConfigSelector Component

A reusable React component for selecting Hume EVI configurations, supporting both preset configurations and user API key authentication.

## Features

- **Dual Authentication Modes**: Support for both preset configurations (with access tokens) and user-provided API keys
- **Auto-Config Creation**: Optional ability to automatically create new configurations
- **Persistent State**: Remembers user selections via localStorage
- **Customizable UI**: Flexible labels and styling options
- **TypeScript Support**: Fully typed for better developer experience

## Installation

Copy the `HumeConfigSelector.tsx` component to your project's components directory.

## Basic Usage

```tsx
import { HumeConfigSelector } from './components/HumeConfigSelector';
import type { PresetConfig } from './components/HumeConfigSelector';

const PRESET_CONFIGS: PresetConfig[] = [
  {
    id: "config-id-1",
    name: "My Config",
    description: "Description of the config"
  }
];

function App() {
  const [selectedConfig, setSelectedConfig] = useState(null);

  return (
    <HumeConfigSelector
      presetConfigs={PRESET_CONFIGS}
      onConfigSelected={(configId, authType, apiKey) => {
        setSelectedConfig({ configId, authType, apiKey });
      }}
    />
  );
}
```

## Props

### Required Props

- `presetConfigs: PresetConfig[]` - Array of preset configurations available for selection

### Optional Props

- `onConfigSelected?: (configId: string, authType: 'preset' | 'api-key', apiKey?: string) => void`
  - Callback when a configuration is selected
  
- `autoCreateConfig?: { enabled: boolean; createConfig: (apiKey: string) => Promise<ConfigData>; configName?: string }`
  - Enable automatic configuration creation with custom logic
  
- `labels?: object`
  - Customize UI text labels
  
- `persistenceKey?: string`
  - Key for localStorage persistence (default: 'humeConfig')
  
- `initialMode?: 'preset' | 'api-key'`
  - Initial authentication mode
  
- `className?: string`
  - CSS class name for styling
  
- `style?: React.CSSProperties`
  - Inline styles

## Advanced Example with Auto-Config Creation

```tsx
import { HumeConfigSelector } from './components/HumeConfigSelector';
import { createTicTacToeConfig } from './utils/ticTacToeConfig';

function App() {
  return (
    <HumeConfigSelector
      presetConfigs={PRESET_CONFIGS}
      onConfigSelected={(configId, authType, apiKey) => {
        // Handle config selection
      }}
      autoCreateConfig={{
        enabled: true,
        createConfig: createTicTacToeConfig,
        configName: 'tic-tac-toe config'
      }}
      labels={{
        presetOption: 'Use Demo Configuration',
        apiKeyOption: 'Use My Own API Key',
        createNewConfig: '➕ Create new game config'
      }}
      persistenceKey="ticTacToeConfig"
    />
  );
}
```

## Using with VoiceProvider

```tsx
const App = () => {
  const [selectedConfig, setSelectedConfig] = useState(null);
  const { accessToken } = useAccessToken(selectedConfig?.authType === 'preset');

  const auth = selectedConfig
    ? selectedConfig.authType === 'preset'
      ? { type: 'accessToken', value: accessToken }
      : { type: 'apiKey', value: selectedConfig.apiKey }
    : null;

  return (
    <>
      <HumeConfigSelector
        presetConfigs={PRESET_CONFIGS}
        onConfigSelected={(configId, authType, apiKey) => {
          setSelectedConfig({ configId, authType, apiKey });
        }}
      />
      
      {selectedConfig && auth && (
        <VoiceProvider configId={selectedConfig.configId} auth={auth}>
          {/* Your voice app components */}
        </VoiceProvider>
      )}
    </>
  );
};
```

## Custom Hook

The component also exports a `useHumeConfigSelector` hook for programmatic access:

```tsx
const config = useHumeConfigSelector({
  presetConfigs: PRESET_CONFIGS,
  persistenceKey: 'myApp'
});

// Returns:
// {
//   selectedConfigId: string | null;
//   authType: 'preset' | 'api-key';
//   apiKey: string | null;
//   isReady: boolean;
// }
```