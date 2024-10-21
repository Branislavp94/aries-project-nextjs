import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaDesktop, FaStop } from 'react-icons/fa';
import { io } from 'socket.io-client';

interface VideoChatRoomComponentProps {
  passVideoStreamData: {
    localStream: MediaStream | null; // Adjust the type as needed
    remoteStream: MediaStream | null; // Adjust the type as needed
  };
  groupId: string;
}

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] });

const VideoChatRoomComponent: React.FC<VideoChatRoomComponentProps> = ({ passVideoStreamData, groupId }) => {
  const { data: userData } = useSession();
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  useEffect(() => {
    if (passVideoStreamData) {
      const { localStream, remoteStream } = passVideoStreamData;

      // Set local and remote streams
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;
      }

      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    }

    return () => {
      if (passVideoStreamData?.localStream) {
        const tracks = passVideoStreamData.localStream.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, [passVideoStreamData]);

  const toggleMute = () => {
    if (passVideoStreamData?.localStream) {
      const audioTracks = passVideoStreamData.localStream.getAudioTracks();
      audioTracks.forEach(track => (track.enabled = !isMuted));
      setIsMuted(!isMuted);
    }
  };

  const toggleCamera = () => {
    if (passVideoStreamData?.localStream) {
      const videoTracks = passVideoStreamData.localStream.getVideoTracks();
      videoTracks.forEach(track => (track.enabled = !isCameraEnabled));
      setIsCameraEnabled(!isCameraEnabled);
    }
  };

  const leaveChat = () => {
    socket.emit('user-leave-call', { chatRoomId: groupId, user: userData?.user });
  };

  const toggleScreenShare = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true, // Optional, if you want to share audio
      });

      // Replace the local video stream with the screen stream
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream; // Set the local video to screen share stream
      }

      if (passVideoStreamData?.localStream) {
        const videoTracks = passVideoStreamData.localStream.getVideoTracks();
        videoTracks.forEach((track) => track.stop()); // Stop existing video tracks
      }

      passVideoStreamData?.localStream.addTrack(screenStream.getVideoTracks()[0]);

      // Notify others in the chat room that screen sharing has started
      socket.emit('start_screen_share', { groupId, userId: userData?.user?.id });
      setIsScreenSharing(true); // Update state

      screenStream.getTracks()[0].onended = () => {
        socket.emit('stop_screen_share', { groupId, userId: userData?.user?.id });
        passVideoStreamData.localStream.getVideoTracks()[0].enabled = true; // Re-enable the camera
        setIsScreenSharing(false); // Update state
      };

    } catch (error) {
      console.error('Error sharing screen:', error);
    }
  };

  useEffect(() => {
    // Listen for screen share events from the server
    socket.on('screen_share_started', ({ userId }) => {
      console.log(`${userId} started screen sharing.`);
      // Logic to handle displaying the shared screen could be added here
      // For example, you might set a state to indicate the screen share is active
      if (remoteVideoRef.current) {
        // Adjust the remote video element to show the shared screen
        remoteVideoRef.current.srcObject = passVideoStreamData?.remoteStream; // Assuming remoteStream gets updated
      }
    });

    socket.on('screen_share_stopped', ({ userId }) => {
      console.log(`${userId} stopped screen sharing.`);
      // Logic to handle stopping the shared screen could be added here
      if (remoteVideoRef.current && passVideoStreamData?.remoteStream) {
        remoteVideoRef.current.srcObject = passVideoStreamData.remoteStream; // Switch back to remote stream
      }
    });

    // Cleanup
    return () => {
      socket.off('screen_share_started');
      socket.off('screen_share_stopped');
    };
  }, [passVideoStreamData]);

  return (
    <>
      {passVideoStreamData && (
        <div className="flex-col flex items-center justify-center z-50 pointer-events-auto">
          <div className="flex flex-grow justify-center items-center">
            <div className="flex space-x-4">
              <video
                ref={localVideoRef}
                muted
                autoPlay
                className="w-auto h-[600px] border-2 border-black rounded"
              />
              <video
                ref={remoteVideoRef}
                muted
                autoPlay
                className="w-[300px] h-[300px] border-2 border-black rounded"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4 space-x-2">
            <button onClick={toggleMute} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2" aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}>
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button onClick={toggleCamera} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center space-x-2" aria-label={isCameraEnabled ? 'Disable camera' : 'Enable camera'}>
              {isCameraEnabled ? <FaVideoSlash /> : <FaVideo />}
              <span>{isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}</span>
            </button>

            <button onClick={leaveChat} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2" aria-label="Leave chat">
              <FaPhoneSlash />
              <span>Leave Chat</span>
            </button>

            <button onClick={toggleScreenShare} className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2 ${isScreenSharing ? 'bg-red-500' : ''}`} aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}>
              {isScreenSharing ? <FaStop /> : <FaDesktop />}
              <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default VideoChatRoomComponent;
