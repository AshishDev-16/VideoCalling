import { useState, useEffect } from 'react';
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, UID } from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '../config';

export interface User {
  uid: UID;
  name: string;
}

export interface AgoraError {
  message: string;
  isError: boolean;
}

export const useAgora = (userName: string) => {
  const [users, setUsers] = useState<User[]>([]);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localTracks, setLocalTracks] = useState<[IMicrophoneAudioTrack, ICameraVideoTrack] | null>(null);
  const [error, setError] = useState<AgoraError>({ message: '', isError: false });

  useEffect(() => {
    if (!AGORA_CONFIG.appId) {
      setError({
        message: 'Agora App ID is not configured. Please add VITE_AGORA_APP_ID to your environment variables.',
        isError: true
      });
      return;
    }

    const initAgora = async () => {
      try {
        const agoraClient = AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' });
        setClient(agoraClient);

        agoraClient.on('user-published', async (user, mediaType) => {
          await agoraClient.subscribe(user, mediaType);
          if (mediaType === 'video') {
            setUsers((prevUsers) => {
              if (!prevUsers.find((u) => u.uid === user.uid)) {
                return [...prevUsers, { uid: user.uid, name: user.uid.toString() }];
              }
              return prevUsers;
            });
          }
        });

        agoraClient.on('user-unpublished', (user, mediaType) => {
          if (mediaType === 'video') {
            setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
          }
        });

        agoraClient.on('user-left', (user) => {
          setUsers((prevUsers) => prevUsers.filter((u) => u.uid !== user.uid));
        });

        await agoraClient.join(AGORA_CONFIG.appId, AGORA_CONFIG.channelName, AGORA_CONFIG.token || null);
        const [microphoneTrack, cameraTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks([microphoneTrack, cameraTrack]);
        await agoraClient.publish([microphoneTrack, cameraTrack]);
        setError({ message: '', isError: false });
      } catch (error: any) {
        setError({
          message: `Failed to initialize video call: ${error.message}`,
          isError: true
        });
        console.error('Error joining channel:', error);
      }
    };

    if (userName) {
      initAgora();
    }

    return () => {
      if (client) {
        client.leave();
        localTracks?.[0].close();
        localTracks?.[1].close();
      }
    };
  }, [userName]);

  return { client, localTracks, users, error };
};