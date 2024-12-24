import { useState } from 'react';
import { ICameraVideoTrack, IMicrophoneAudioTrack, ILocalVideoTrack } from 'agora-rtc-sdk-ng';

interface ControlsProps {
  audioTrack?: IMicrophoneAudioTrack;
  videoTrack?: ICameraVideoTrack | ILocalVideoTrack;
  onLeave: () => void;
  onScreenShare: () => void;
  isScreenSharing: boolean;
  onVideoToggle: () => void;
  isVideoEnabled: boolean;
}

const Controls = ({ 
  audioTrack,  
  onLeave,
  onScreenShare,
  isScreenSharing,
  onVideoToggle,
  isVideoEnabled 
}: ControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = async () => {
    if (audioTrack) {
      await audioTrack.setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4 bg-gray-900/90 backdrop-blur p-4 rounded-lg shadow-lg">
      <button
        onClick={toggleMute}
        className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
          isMuted 
            ? 'bg-red-500 hover:bg-red-600' 
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        <span className="material-icons text-white text-2xl">
          {isMuted ? 'mic_off' : 'mic'}
        </span>
        <span className="text-white text-sm font-medium">
          {isMuted ? 'Unmute' : 'Mute'}
        </span>
      </button>

      <button
        onClick={onVideoToggle}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
      >
        <span className="material-icons">
          {isVideoEnabled ? 'videocam' : 'videocam_off'}
        </span>
        <span>Stop Video</span>
      </button>

      {onScreenShare && (
        <button
          onClick={onScreenShare}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            isScreenSharing 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
          title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
        >
          <span className="material-icons text-white text-2xl">
            {isScreenSharing ? 'stop_screen_share' : 'screen_share'}
          </span>
          <span className="text-white text-sm font-medium">
            {isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
          </span>
        </button>
      )}

      {onLeave && (
        <button
          onClick={onLeave}
          className="px-4 py-2 rounded-lg flex items-center gap-2 bg-red-500 hover:bg-red-600 transition-all"
          title="Leave Call"
        >
          <span className="material-icons text-white text-2xl">
            call_end
          </span>
          <span className="text-white text-sm font-medium">
            Leave
          </span>
        </button>
      )}
    </div>
  );
};

export default Controls;