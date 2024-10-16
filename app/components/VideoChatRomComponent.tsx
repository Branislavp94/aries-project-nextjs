'use client'

import React, { useEffect, useRef } from 'react';

interface VideoChatRoomComponentProps {
  passVideoStreamData: {
    localStream: MediaStream | null; // Adjust the type as needed
    remoteStream: MediaStream | null; // Adjust the type as needed
  };
}

const VideoChatRoomComponent: React.FC<VideoChatRoomComponentProps> = ({ passVideoStreamData }) => {
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (passVideoStreamData) {
      const { localStream, remoteStream } = passVideoStreamData;

      if (localVideoRef.current && localStream) {
        localVideoRef.current.srcObject = localStream;  // Set local stream
      }

      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;  // Set remote stream
      }
    }
  }, [passVideoStreamData]);

  return (
    <div className="flex space-x-4">
      <video
        ref={localVideoRef}
        muted
        autoPlay
        style={{ width: '300px', height: 'auto', border: '1px solid black' }}
      />
      <video
        ref={remoteVideoRef}
        muted
        autoPlay
        style={{ width: '300px', height: 'auto', border: '1px solid black' }}
      />
    </div>
  );
};

export default VideoChatRoomComponent;
