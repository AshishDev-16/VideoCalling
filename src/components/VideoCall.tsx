import { useState, useEffect } from 'react';
import AgoraRTC, { 
  IAgoraRTCClient, 
  ICameraVideoTrack, 
  IMicrophoneAudioTrack, 
  ILocalVideoTrack
} from 'agora-rtc-sdk-ng';
import { AGORA_CONFIG } from '../config';
import Controls from './Controls';
import { User } from '../types/agora';
import VideoGrid from './VideoGrid';

const VideoCall = () => {
  const [name, setName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);
  const [localTracks, setLocalTracks] = useState<{
    videoTrack?: ICameraVideoTrack | ILocalVideoTrack;
    audioTrack?: IMicrophoneAudioTrack;
  }>({});
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [screenTrack, setScreenTrack] = useState<ILocalVideoTrack | null>(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);

  useEffect(() => {
    console.log('Users updated:', users.map(u => ({
      uid: u.uid,
      name: u.name,
      hasVideo: !!u.videoTrack,
      hasAudio: !!u.audioTrack
    })));
  }, [users]);

  useEffect(() => {
    // Update participant count whenever users array changes
    setParticipantCount(users.length + (isJoined ? 1 : 0)); // Count local user + remote users
  }, [users, isJoined]);

  useEffect(() => {
    const init = async () => {
      try {
        console.log('Initializing Agora client...');
        const agoraClient = AgoraRTC.createClient({ 
          mode: 'rtc', 
          codec: 'vp8'
        });
        
        // Set up event handlers
        agoraClient.on('user-published', handleUserPublished);
        agoraClient.on('user-unpublished', handleUserUnpublished);
        agoraClient.on('user-left', handleUserLeft);
        agoraClient.on('user-joined', handleUserJoined);
        
        console.log('Client created:', agoraClient);
        setClient(agoraClient);
      } catch (error) {
        console.error('Error initializing client:', error);
      }
    };
    init();

    return () => {
      if (client) {
        client.removeAllListeners();
        if (isJoined) {
          client.leave();
        }
      }
      if (localTracks.audioTrack) {
        localTracks.audioTrack.close();
      }
      if (localTracks.videoTrack) {
        localTracks.videoTrack.close();
      }
      if (screenTrack) {
        screenTrack.close();
      }
    };
  }, []);

  const handleUserPublished = async (user: any, mediaType: 'audio' | 'video') => {
    if (!client) return;
    
    try {
      await client.subscribe(user, mediaType);
      
      if (mediaType === 'video') {
        console.log('Video track received:', {
          uid: user.uid,
          hasTrack: !!user.videoTrack,
          enabled: user.videoTrack?.enabled
        });

        if (user.videoTrack) {
          user.videoTrack.play(`video-${user.uid}`);
        }

        setUsers(prev => {
          const existingUser = prev.find(u => u.uid === user.uid);
          if (existingUser) {
            return prev.map(u => 
              u.uid === user.uid 
                ? { 
                    ...u, 
                    videoTrack: user.videoTrack,
                    isVideoOff: !user.videoTrack?.enabled 
                  }
                : u
            );
          }
          return [...prev, {
            uid: user.uid,
            name: `Guest ${prev.length + 1}`,
            videoTrack: user.videoTrack,
            audioTrack: undefined,
            isMuted: false,
            isVideoOff: !user.videoTrack?.enabled
          }];
        });
      }

      if (mediaType === 'audio') {
        console.log('Subscribed to audio track:', {
          uid: user.uid,
          hasAudioTrack: !!user.audioTrack
        });
        
        user.audioTrack?.play();
        setUsers(prev => {
          const existingUser = prev.find(u => u.uid === user.uid);
          if (existingUser) {
            return prev.map(u => 
              u.uid === user.uid 
                ? { ...u, audioTrack: user.audioTrack, isMuted: false }
                : u
            );
          }
          return prev;
        });
      }

    } catch (error) {
      console.error('Error in handleUserPublished:', error);
    }
  };

  const handleUserUnpublished = (user: any, mediaType: 'audio' | 'video') => {
    if (mediaType === 'video') {
      setUsers(prev => prev.map(u => 
        u.uid === user.uid ? { ...u, videoTrack: undefined, isVideoOff: true } : u
      ));
    }
  };

  const handleUserLeft = (user: any) => {
    console.log('User left:', user.uid);
    setUsers(prev => prev.filter(u => u.uid !== user.uid));
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !client) return;
    
    try {
      const uid = await client.join(
        AGORA_CONFIG.appId,
        AGORA_CONFIG.channelName,
        AGORA_CONFIG.token,
        null
      );

      console.log('Creating tracks...');
      
      // Create tracks with specific configurations
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
        {
          encoderConfig: "speech_standard",
          AEC: true,
          ANS: true
        },
        {
          encoderConfig: {
            width: 640,
            height: 360,
            frameRate: 30,
            bitrateMin: 400,
            bitrateMax: 1000
          },
          facingMode: "user"
        }
      );

      if (!videoTrack || !audioTrack) {
        throw new Error('Failed to create local tracks');
      }

      console.log('Publishing tracks...');
      await client.publish([audioTrack, videoTrack]);

      setLocalTracks({ audioTrack, videoTrack });
      setIsJoined(true);

      console.log('Join successful:', {
        uid,
        hasAudio: !!audioTrack,
        hasVideo: !!videoTrack
      });

    } catch (error) {
      console.error('Join failed:', error);
      alert('Failed to join call. Please check your camera and microphone permissions.');
    }
  };

  const handleLeave = async () => {
    try {
      if (client && isJoined) {
        // Unpublish and close local tracks
        if (localTracks.audioTrack) {
          await client.unpublish(localTracks.audioTrack);
          localTracks.audioTrack.close();
        }
        if (localTracks.videoTrack) {
          await client.unpublish(localTracks.videoTrack);
          localTracks.videoTrack.close();
        }
        
        // Leave the channel
        await client.leave();
        
        // Reset state
        setUsers([]);
        setLocalTracks({});
        setIsJoined(false);
      }
    } catch (error) {
      console.error('Error leaving channel:', error);
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!client || !isJoined) return;

      if (!isScreenSharing) {
        // Start screen sharing with optimized settings
        const screenTrack = await AgoraRTC.createScreenVideoTrack({
          encoderConfig: {
            width: 1920,
            height: 1080,
            frameRate: 15,
            bitrateMin: 600,
            bitrateMax: 1000
          }
        });
        
        // Store current video track to restore later
        const currentVideoTrack = localTracks.videoTrack;
        
        // Unpublish camera track
        if (currentVideoTrack) {
          await client.unpublish(currentVideoTrack);
        }
        
        // Publish screen track with optimized settings
        await client.publish(screenTrack);
        
        // Update local tracks
        setLocalTracks(prev => ({
          ...prev,
          videoTrack: Array.isArray(screenTrack) ? screenTrack[0] : screenTrack
        }));
        
        setScreenTrack(Array.isArray(screenTrack) ? screenTrack[0] : screenTrack);
        setIsScreenSharing(true);

        // Handle when user stops sharing via browser UI
        if ('on' in screenTrack) {
          screenTrack.on('track-ended', async () => {
            await stopScreenShare(currentVideoTrack as ICameraVideoTrack);
          });
        }

        console.log('Screen sharing started with optimized settings');
      } else {
        await stopScreenShare(localTracks.videoTrack as ICameraVideoTrack);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
      alert('Failed to share screen. Please try again.');
    }
  };

  const stopScreenShare = async (originalVideoTrack?: ICameraVideoTrack) => {
    try {
      if (!client || !screenTrack || !isJoined) {
        console.log('Cannot stop screen share: missing requirements', {
          hasClient: !!client,
          hasScreenTrack: !!screenTrack,
          isJoined
        });
        return;
      }

      console.log('Stopping screen share...');

      // First close the screen track
      screenTrack.close();
      setScreenTrack(null);
      setIsScreenSharing(false);

      try {
        // Then try to unpublish it
        await client.unpublish(screenTrack);
      } catch (err) {
        console.warn('Error unpublishing screen track:', err);
        // Continue anyway since we've already closed the track
      }

      // Switch back to camera
      try {
        if (originalVideoTrack) {
          console.log('Republishing original camera track');
          await client.publish(originalVideoTrack);
          setLocalTracks(prev => ({
            ...prev,
            videoTrack: originalVideoTrack
          }));
        } else {
          console.log('Creating new camera track');
          const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
            encoderConfig: {
              width: 640,
              height: 360,
              frameRate: 30,
              bitrateMin: 400,
              bitrateMax: 1000
            },
            facingMode: "user"
          });
          await client.publish(newVideoTrack);
          setLocalTracks(prev => ({
            ...prev,
            videoTrack: newVideoTrack
          }));
        }
      } catch (err) {
        console.error('Error republishing camera:', err);
        alert('Failed to restore camera. You may need to rejoin the call.');
      }

      console.log('Screen sharing stopped successfully');
    } catch (error) {
      console.error('Error in stopScreenShare:', error);
      // Reset state even if there was an error
      setScreenTrack(null);
      setIsScreenSharing(false);
    }
  };

  const handleUserJoined = (user: any) => {
    console.log('User joined:', user.uid);
    // Add user to the list even before they publish media
    setUsers(prev => {
      if (prev.find(u => u.uid === user.uid)) return prev;
      return [...prev, {
        uid: user.uid,
        name: user.uid === client?.uid ? name : `Guest ${prev.length + 1}`,
        isMuted: false,
        isVideoOff: false
      }];
    });
  };

  const toggleVideo = async () => {
    if (!localTracks.videoTrack) return;
    
    try {
      if (isVideoEnabled) {
        await localTracks.videoTrack.setEnabled(false);
      } else {
        await localTracks.videoTrack.setEnabled(true);
      }
      setIsVideoEnabled(!isVideoEnabled);
    } catch (error) {
      console.error('Error toggling video:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      {!isJoined ? (
        // Login/Join Screen
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Join Video Call</h2>
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                           text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium 
                         py-2 px-4 rounded-lg transition-all duration-200 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                         focus:ring-offset-gray-900"
              >
                Join Call
              </button>
            </form>
          </div>
        </div>
      ) : (
        // Video Call Screen
        <div className="relative min-h-screen">
          {/* Header */}
          <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-gray-900 p-4">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
              <h1 className="text-white font-medium">Video Call</h1>
              <div className="text-gray-300 text-sm">
                {participantCount} participant{participantCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Video Grid */}
          <VideoGrid 
            localTracks={localTracks} 
            users={users} 
            userName={name}
            client={client}
          />

          {/* Controls */}
          <Controls
            audioTrack={localTracks.audioTrack}
            videoTrack={localTracks.videoTrack}
            onLeave={handleLeave}
            onScreenShare={toggleScreenShare}
            isScreenSharing={isScreenSharing}
            onVideoToggle={toggleVideo}
            isVideoEnabled={isVideoEnabled}
          />
        </div>
      )}
    </div>
  );
};

export default VideoCall;