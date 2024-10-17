'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, FaPhoneSlash, FaDesktop, FaStop } from 'react-icons/fa';
import { io } from 'socket.io-client';

interface VideoChatRoomComponentProps {
  passVideoStreamData: {
    localStream: MediaStream | null; // Adjust the type as needed
    remoteStream: MediaStream | null; // Adjust the type as needed
  };
}

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] }); // Update with your server URL


const VideoChatRoomComponent: React.FC<VideoChatRoomComponentProps> = ({ passVideoStreamData }) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true); // State to track camera status

  useEffect(() => {
    if (passVideoStreamData) {
      const { localStream, remoteStream } = passVideoStreamData;

      // Set local and remote streams
      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream; // Set local stream
      }

      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream; // Set remote stream
      }
    }

    // Cleanup function to stop streams when component unmounts
    return () => {
      if (passVideoStreamData?.localStream) {
        const tracks = passVideoStreamData.localStream.getTracks();
        tracks.forEach(track => track.stop());
      }
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [passVideoStreamData, screenStream]);

  // Handle muting/unmuting microphone
  const toggleMute = () => {
    if (passVideoStreamData?.localStream) {
      const audioTracks = passVideoStreamData.localStream.getAudioTracks();
      audioTracks.forEach(track => (track.enabled = !isMuted));
      setIsMuted(!isMuted);
    }
  };

  // Handle camera enable/disable
  const toggleCamera = () => {
    if (passVideoStreamData?.localStream) {
      const videoTracks = passVideoStreamData.localStream.getVideoTracks();
      videoTracks.forEach(track => (track.enabled = !isCameraEnabled));
      setIsCameraEnabled(!isCameraEnabled);
    }
  };

  // Handle leaving the chat
  const leaveChat = () => {

  };


  // Handle screen sharing
  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop screen sharing
      if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);
    } else {
      try {
        // Request screen sharing
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setScreenStream(stream);
        setIsScreenSharing(true);
      } catch (error) {
        console.error('Error sharing the screen:', error);
        alert('Could not share the screen. Please check your permissions.');
      }
    }
  };

  return (
    <>
      {passVideoStreamData && (
        <div className="flex-col flex items-center justify-center z-50 pointer-events-auto">
          <div className="flex flex-grow justify-center items-center">
            {isScreenSharing ? (
              <div className="flex justify-center items-center relative w-full h-full">
                <video
                  ref={remoteVideoRef}
                  muted
                  autoPlay
                  className="absolute right-4 w-[300px] h-[300px] border-2 border-black rounded"
                />
                <video
                  className="w-[300px] h-[300px] border-2 border-black rounded"
                  srcObject={screenStream}
                  autoPlay
                  style={{ objectFit: 'contain' }}
                />
              </div>
            ) : (
              <div className="flex space-x-4">
                <video
                  ref={localVideoRef}
                  muted
                  autoPlay
                  className="w-[300px] h-[300px] border-2 border-black rounded"
                />
                <video
                  ref={remoteVideoRef}
                  muted
                  autoPlay
                  className="w-[300px] h-[300px] border-2 border-black rounded"
                />
              </div>
            )}
          </div>
          <div className="flex gap-2  mt-4 space-x-2">
            <button
              onClick={toggleMute}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center space-x-2"
              aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            >
              {isMuted ? <FaMicrophoneSlash /> : <FaMicrophone />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            <button
              onClick={toggleCamera}
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 flex items-center space-x-2"
              aria-label={isCameraEnabled ? 'Disable camera' : 'Enable camera'}
            >
              {isCameraEnabled ? <FaVideoSlash /> : <FaVideo />}
              <span>{isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}</span>
            </button>

            <button
              onClick={leaveChat}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center space-x-2"
              aria-label="Leave chat"
            >
              <FaPhoneSlash />
              <span>Leave Chat</span>
            </button>

            <button
              onClick={toggleScreenShare}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center space-x-2"
              aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share screen'}
            >
              {isScreenSharing ? <FaStop /> : <FaDesktop />}
              <span>{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
            </button>
          </div>
        </div >
      )}
    </>
  );
};

export default VideoChatRoomComponent;
