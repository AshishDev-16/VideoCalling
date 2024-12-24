import React, { useEffect } from 'react';
import { IAgoraRTCClient } from 'agora-rtc-sdk-ng';
import { User } from '../types/agora';

interface VideoGridProps {
  localTracks: {
    videoTrack?: any;
    audioTrack?: any;
  };
  users: User[];
  userName: string;
  client: IAgoraRTCClient | null;
}

const VideoGrid: React.FC<VideoGridProps> = ({ localTracks, users, userName}) => {
  useEffect(() => {
    // Log whenever tracks change
    console.log('Tracks updated:', {
      localVideo: !!localTracks.videoTrack,
      remoteUsers: users.map(u => ({
        uid: u.uid,
        hasVideo: !!u.videoTrack
      }))
    });
  }, [localTracks, users]);

  const playVideo = (track: any, element: HTMLElement) => {
    try {
      if (track.isPlaying) {
        track.stop();
      }
      track.play(element, { fit: 'cover' });
      console.log('Successfully playing video track');
    } catch (err) {
      console.error('Error playing video:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-16 pb-24 max-w-7xl mx-auto">
      {/* Local User */}
      <div className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg">
        <div
          ref={node => {
            if (node && localTracks.videoTrack) {
              playVideo(localTracks.videoTrack, node);
            }
          }}
          className="absolute inset-0 bg-gray-700"
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-white font-medium text-sm">
              {userName} (You)
            </span>
          </div>
        </div>
      </div>

      {/* Remote Users */}
      {users.map((user) => (
        <div key={user.uid} className="relative aspect-video bg-gray-800 rounded-xl overflow-hidden shadow-lg">
          <div
            ref={node => {
              if (node && user.videoTrack) {
                playVideo(user.videoTrack, node);
              }
            }}
            className="absolute inset-0 bg-gray-700"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white font-medium text-sm">
                {user.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="material-icons text-white text-sm">
                {user.isMuted ? 'mic_off' : 'mic'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoGrid;