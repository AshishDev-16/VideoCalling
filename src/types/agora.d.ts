import { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack, IRemoteVideoTrack, IRemoteAudioTrack } from 'agora-rtc-sdk-ng';

export interface User {
  uid: string | number;
  name: string;
  videoTrack?: ICameraVideoTrack | IRemoteVideoTrack;
  audioTrack?: IMicrophoneAudioTrack | IRemoteAudioTrack;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface LocalTracks {
  videoTrack?: ICameraVideoTrack;
  audioTrack?: IMicrophoneAudioTrack;
  screenTrack?: IScreenVideoTrack;
}

export interface AgoraConfig {
  appId: string;
  token: string | null;
  channelName: string;

}