import React, { useState, useEffect, useCallback } from "react";

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
}

interface UserConfig {
  id: string;
  name: string;
  description?: string;
}

interface HumeConfigSelectorProps {
  presetConfigs: PresetConfig[];
  onConfigSelected: (configId: string, authType: 'preset' | 'api-key', apiKey?: string) => void;
  createTicTacToeConfig: (apiKey: string) => Promise<{ id: string; name: string; description?: string }>;
}

export const HumeConfigSelector: React.FC<HumeConfigSelectorProps> = ({ 
  presetConfigs, 
  onConfigSelected,
  createTicTacToeConfig
}) => {
  const [configMode, setConfigMode] = useState<'preset' | 'api-key'>(() => 
    (localStorage.getItem('configMode') as 'preset' | 'api-key') || 'preset'
  );
  
  const [selectedPresetId, setSelectedPresetId] = useState(() => 
    localStorage.getItem('selectedPresetId') || presetConfigs[0]?.id || ''
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

  // Save to localStorage
  useEffect(() => { localStorage.setItem('configMode', configMode); }, [configMode]);
  useEffect(() => { localStorage.setItem('selectedPresetId', selectedPresetId); }, [selectedPresetId]);
  useEffect(() => { localStorage.setItem('userApiKey', apiKey); }, [apiKey]);
  useEffect(() => { localStorage.setItem('selectedConfigId', selectedConfigId); }, [selectedConfigId]);

  // Notify parent when config changes
  useEffect(() => {
    if (configMode === 'preset' && selectedPresetId) {
      onConfigSelected(selectedPresetId, 'preset');
    } else if (configMode === 'api-key' && selectedConfigId && apiKey) {
      onConfigSelected(selectedConfigId, 'api-key', apiKey);
    }
  }, [configMode, selectedPresetId, selectedConfigId, apiKey]); // Removed onConfigSelected to prevent infinite loop

  const fetchUserConfigs = useCallback(async () => {
    if (!apiKey.trim()) return;
    
    try {
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
      const newConfig = await createTicTacToeConfig(apiKey);
      const configToAdd = {
        id: newConfig.id,
        name: newConfig.name,
        description: newConfig.description || 'Auto-created tic-tac-toe config'
      };
      
      setUserConfigs(prev => [configToAdd, ...prev]);
      setSelectedConfigId(newConfig.id);
      
    } catch (error) {
      console.error('Failed to create config:', error);
      alert(`Failed to create config: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsCreatingConfig(false);
    }
  }, [apiKey, createTicTacToeConfig]);

  return (
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
            {presetConfigs.map(config => (
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
                onClick={fetchUserConfigs}
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
                      autoCreateConfig();
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
};