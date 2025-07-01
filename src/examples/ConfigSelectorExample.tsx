import React, { useState } from "react";
import { VoiceProvider } from "@humeai/voice-react";
import { HumeConfigSelector } from "../components/HumeConfigSelector";
import type { PresetConfig } from "../components/HumeConfigSelector";

// Example preset configurations for a different use case
const EXAMPLE_PRESETS: PresetConfig[] = [
  {
    id: "example-config-1",
    name: "Customer Service Bot",
    description: "Helpful and professional assistant"
  },
  {
    id: "example-config-2", 
    name: "Creative Writing Partner",
    description: "Imaginative storytelling companion"
  }
];

// Example auto-create function for a custom config
async function createCustomConfig(apiKey: string) {
  // This is where you'd implement your own config creation logic
  // For example, creating a config with specific tools and prompts
  const response = await fetch('https://api.hume.ai/v0/evi/configs', {
    method: 'POST',
    headers: {
      'X-Hume-Api-Key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: "My Custom Config",
      prompt: {
        text: "You are a helpful assistant..."
      }
    })
  });
  
  const config = await response.json();
  return {
    id: config.id,
    name: config.name,
    description: 'Auto-created custom config'
  };
}

export const ConfigSelectorExample: React.FC = () => {
  const [selectedConfig, setSelectedConfig] = useState<{
    configId: string;
    authType: 'preset' | 'api-key';
    apiKey?: string;
  } | null>(null);

  // For preset configs, you'd need to fetch an access token
  const accessToken = "your-access-token-here"; // In real app, fetch this

  return (
    <div style={{ padding: '2em' }}>
      <h1>My Voice Application</h1>
      
      {/* Basic usage */}
      <HumeConfigSelector
        presetConfigs={EXAMPLE_PRESETS}
        onConfigSelected={(configId, authType, apiKey) => {
          setSelectedConfig({ configId, authType, apiKey });
        }}
      />
      
      {/* Advanced usage with all options */}
      <HumeConfigSelector
        presetConfigs={EXAMPLE_PRESETS}
        onConfigSelected={(configId, authType, apiKey) => {
          setSelectedConfig({ configId, authType, apiKey });
        }}
        autoCreateConfig={{
          enabled: true,
          createConfig: createCustomConfig,
          configName: 'custom assistant'
        }}
        labels={{
          presetOption: 'Use Demo Configuration',
          apiKeyOption: 'Use My Own API Key',
          createNewConfig: '➕ Create custom assistant',
          creatingConfigMessage: '🔄 Setting up your assistant...'
        }}
        persistenceKey="myAppConfig"
        style={{ maxWidth: '600px' }}
      />
      
      {/* Using the selected config */}
      {selectedConfig && (
        <VoiceProvider
          configId={selectedConfig.configId}
          auth={
            selectedConfig.authType === 'preset'
              ? { type: 'accessToken', value: accessToken }
              : { type: 'apiKey', value: selectedConfig.apiKey! }
          }
        >
          {/* Your voice app components here */}
          <div>Voice interface ready!</div>
        </VoiceProvider>
      )}
    </div>
  );
};