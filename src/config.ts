import { AgoraConfig } from './types/agora';

const appId = import.meta.env.VITE_AGORA_APP_ID;
const token = import.meta.env.VITE_AGORA_TOKEN;
const channelName = import.meta.env.VITE_AGORA_CHANNEL_NAME;

// Debug log to check environment variables
console.log('Agora Config Details:', {
  appId: appId ? `${appId.substring(0, 8)}...` : 'missing',
  tokenLength: token ? token.length : 0,
  channelName,
});

export const AGORA_CONFIG: AgoraConfig = {
  appId,
  token,
  channelName
};

// Validate config
if (!appId) {
  console.error('Agora App ID is missing');
}
if (!token) {
  console.warn('Agora Token is missing');
}
if (!channelName) {
  console.warn('Channel name is missing, using default');
}