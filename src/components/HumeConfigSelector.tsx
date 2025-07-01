import React, { useState, useEffect, useCallback } from "react";

export interface PresetConfig {
  id: string;
  name: string;
  description: string;
}

export interface UserConfig {
  id: string;
  name: string;
  description?: string;
}

export interface HumeConfigSelectorProps {
  // Required: preset configurations available for this app
  presetConfigs: PresetConfig[];
  
  // Optional: callback when config is selected
  onConfigSelected?: (configId: string, authType: 'preset' | 'api-key', apiKey?: string) => void;
  
  // Optional: custom styling
  className?: string;
  style?: React.CSSProperties;
  
  // Optional: labels and text customization
  labels?: {
    title?: string;
    presetOption?: string;
    apiKeyOption?: string;
    selectPresetPlaceholder?: string;
    apiKeyPlaceholder?: string;
    loginButton?: string;
    selectConfigPlaceholder?: string;
    createNewConfig?: string;
    creatingConfigMessage?: string;
    editConfigLink?: string;
    noConfigSelectedMessage?: string;
  };
  
  // Optional: auto-create config settings
  autoCreateConfig?: {
    enabled: boolean;
    createConfig: (apiKey: string) => Promise<{ id: string; name: string; description?: string }>;
    configName?: string;
  };
  
  // Optional: initial values
  initialMode?: 'preset' | 'api-key';
  initialPresetId?: string;
  initialApiKey?: string;
  initialConfigId?: string;
  
  // Optional: persistence key for localStorage
  persistenceKey?: string;
}

export interface HumeConfigSelectorReturn {
  selectedConfigId: string | null;
  authType: 'preset' | 'api-key';
  apiKey: string | null;
  isReady: boolean;
}

export function useHumeConfigSelector(props: HumeConfigSelectorProps): HumeConfigSelectorReturn {
  const persistKey = props.persistenceKey || 'humeConfig';
  
  const [configMode, setConfigMode] = useState<'preset' | 'api-key'>(() => 
    props.initialMode || 
    (localStorage.getItem(`${persistKey}_mode`) as 'preset' | 'api-key') || 
    'preset'
  );
  
  const [selectedPresetId, setSelectedPresetId] = useState(() => 
    props.initialPresetId || 
    localStorage.getItem(`${persistKey}_presetId`) || 
    props.presetConfigs[0]?.id || 
    ''
  );
  
  const [apiKey, setApiKey] = useState(() => 
    props.initialApiKey || 
    localStorage.getItem(`${persistKey}_apiKey`) || 
    ''
  );
  
  const [selectedConfigId, setSelectedConfigId] = useState(() => 
    props.initialConfigId || 
    localStorage.getItem(`${persistKey}_configId`) || 
    ''
  );

  // Persistence
  useEffect(() => {
    if (props.persistenceKey) {
      localStorage.setItem(`${persistKey}_mode`, configMode);
      localStorage.setItem(`${persistKey}_presetId`, selectedPresetId);
      localStorage.setItem(`${persistKey}_apiKey`, apiKey);
      localStorage.setItem(`${persistKey}_configId`, selectedConfigId);
    }
  }, [configMode, selectedPresetId, apiKey, selectedConfigId, persistKey, props.persistenceKey]);

  const isReady = configMode === 'preset' 
    ? !!selectedPresetId 
    : !!apiKey && !!selectedConfigId;

  return {
    selectedConfigId: configMode === 'preset' ? selectedPresetId : selectedConfigId,
    authType: configMode,
    apiKey: configMode === 'api-key' ? apiKey : null,
    isReady
  };
}

export const HumeConfigSelector: React.FC<HumeConfigSelectorProps> = (props) => {
  const {
    presetConfigs,
    onConfigSelected,
    className,
    style,
    labels = {},
    autoCreateConfig,
    initialMode,
    initialPresetId,
    initialApiKey,
    initialConfigId,
    persistenceKey = 'humeConfig'
  } = props;

  const [configMode, setConfigMode] = useState<'preset' | 'api-key'>(() => 
    initialMode || 
    (localStorage.getItem(`${persistenceKey}_mode`) as 'preset' | 'api-key') || 
    'preset'
  );
  
  const [selectedPresetId, setSelectedPresetId] = useState(() => 
    initialPresetId || 
    localStorage.getItem(`${persistenceKey}_presetId`) || 
    presetConfigs[0]?.id || 
    ''
  );
  
  const [apiKey, setApiKey] = useState(() => 
    initialApiKey || 
    localStorage.getItem(`${persistenceKey}_apiKey`) || 
    ''
  );
  
  const [selectedConfigId, setSelectedConfigId] = useState(() => 
    initialConfigId || 
    localStorage.getItem(`${persistenceKey}_configId`) || 
    ''
  );
  
  const [userConfigs, setUserConfigs] = useState<UserConfig[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreatingConfig, setIsCreatingConfig] = useState(false);

  // Persistence
  useEffect(() => {
    localStorage.setItem(`${persistenceKey}_mode`, configMode);
    localStorage.setItem(`${persistenceKey}_presetId`, selectedPresetId);
    localStorage.setItem(`${persistenceKey}_apiKey`, apiKey);
    localStorage.setItem(`${persistenceKey}_configId`, selectedConfigId);
  }, [configMode, selectedPresetId, apiKey, selectedConfigId, persistenceKey]);

  // Notify parent when config changes
  useEffect(() => {
    if (onConfigSelected) {
      if (configMode === 'preset' && selectedPresetId) {
        onConfigSelected(selectedPresetId, 'preset');
      } else if (configMode === 'api-key' && selectedConfigId && apiKey) {
        onConfigSelected(selectedConfigId, 'api-key', apiKey);
      }
    }
  }, [configMode, selectedPresetId, selectedConfigId, apiKey, onConfigSelected]);

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

  const handleAutoCreateConfig = useCallback(async () => {
    if (!autoCreateConfig?.enabled || !autoCreateConfig.createConfig || !apiKey.trim()) return;
    
    setIsCreatingConfig(true);
    setSelectedConfigId('');
    
    try {
      const newConfig = await autoCreateConfig.createConfig(apiKey);
      setUserConfigs(prev => [newConfig, ...prev]);
      setSelectedConfigId(newConfig.id);
    } catch (error) {
      console.error('Failed to create config:', error);
      alert(`Failed to create config: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIsCreatingConfig(false);
    }
  }, [apiKey, autoCreateConfig]);

  const defaultLabels = {
    presetOption: 'Use Preset Configuration',
    apiKeyOption: 'Provide Your API Key',
    selectPresetPlaceholder: 'Select a preset configuration...',
    apiKeyPlaceholder: 'Enter your Hume API Key',
    loginButton: 'Login',
    selectConfigPlaceholder: 'Select a configuration...',
    createNewConfig: `➕ Create new ${autoCreateConfig?.configName || 'config'}`,
    creatingConfigMessage: `🔄 Creating your ${autoCreateConfig?.configName || 'configuration'}...`,
    editConfigLink: '📝 Edit this config in the playground →',
    ...labels
  };

  return (
    <div className={className} style={{ margin: '1em 0', display: 'flex', flexDirection: 'column', gap: 16, ...style }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <label>
          <input 
            type="radio" 
            checked={configMode === 'preset'} 
            onChange={() => setConfigMode('preset')} 
          />
          {defaultLabels.presetOption}
        </label>
        <label>
          <input 
            type="radio" 
            checked={configMode === 'api-key'} 
            onChange={() => setConfigMode('api-key')} 
          />
          {defaultLabels.apiKeyOption}
        </label>
      </div>

      {configMode === 'preset' && (
        <div style={{ marginLeft: '1em' }}>
          <select 
            value={selectedPresetId} 
            onChange={e => setSelectedPresetId(e.target.value)}
            style={{ padding: '0.5em', minWidth: '300px' }}
          >
            <option value="">{defaultLabels.selectPresetPlaceholder}</option>
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
              placeholder={defaultLabels.apiKeyPlaceholder}
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
                {defaultLabels.loginButton}
              </button>
            )}
          </div>

          {isLoggedIn && (
            <>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <select 
                  value={selectedConfigId} 
                  onChange={e => {
                    if (e.target.value === '__CREATE_NEW__' && autoCreateConfig?.enabled) {
                      handleAutoCreateConfig();
                    } else {
                      setSelectedConfigId(e.target.value);
                    }
                  }}
                  style={{ padding: '0.5em', minWidth: '300px' }}
                  disabled={isCreatingConfig}
                >
                  <option value="">{defaultLabels.selectConfigPlaceholder}</option>
                  {autoCreateConfig?.enabled && (
                    <option value="__CREATE_NEW__" style={{ fontWeight: 'bold', color: '#007bff' }}>
                      {defaultLabels.createNewConfig}
                    </option>
                  )}
                  {userConfigs.map(config => (
                    <option key={config.id} value={config.id}>
                      {config.name} {config.description && `- ${config.description}`}
                    </option>
                  ))}
                </select>
              </div>

              {isCreatingConfig && (
                <div style={{ marginTop: '0.5em', padding: '0.5em', backgroundColor: '#f8f9fa', borderRadius: '4px', fontSize: '0.9em' }}>
                  {defaultLabels.creatingConfigMessage}
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
                    {defaultLabels.editConfigLink}
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