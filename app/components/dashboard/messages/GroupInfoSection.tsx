import React, { useEffect, useRef, useState } from 'react';
import { FaVideo, FaInfoCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';

type Props = {
  groupName: string;
  users: Array<{ id: number; email: string }>;
};

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] }); // Update with your server URL

const GroupInfoSection = ({ groupName, users }: Props) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [callStarted, setCallStarted] = useState(false);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (callStarted) {
      const peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: 'stun:stun.l.google.com:19302', // Public Google STUN server
          },
        ],
      });

      console.log('peer', peer)

      setPeerConnection(peer);

      // Capture local media stream (audio + video)
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((stream) => {
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
          // Add the local stream to the peer connection
          stream.getTracks().forEach((track) => peer.addTrack(track, stream));

          // Emit event to initiate the call
          socket.emit('start_video_call', { groupName });
        })
        .catch((err) => console.error('Error accessing media devices.', err));

      // Handle ICE candidates
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit('ice-candidate', event.candidate);
        }
      };

      // Handle receiving remote stream
      peer.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Listen for remote ICE candidates
      socket.on('receive_ice_candidate', (candidate) => {
        peer.addIceCandidate(new RTCIceCandidate(candidate));
      });

      // Listen for remote offer
      socket.on('receive_offer', async (offer) => {
        await peer.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        socket.emit('send_answer', answer);
      });

      // Listen for remote answer
      socket.on('receive_answer', async (answer) => {
        await peer.setRemoteDescription(new RTCSessionDescription(answer));
      });
    }
  }, [callStarted, groupName]);

  const handleVideoCallClick = async () => {
    setCallStarted(true);

    if (peerConnection) {
      // Create offer and set local description
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer to the remote peer via Socket.io
      socket.emit('send_offer', offer);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 mb-4 rounded-xl shadow-md">
        <div className="flex flex-col space-y-1">
          <span className="text-lg font-semibold text-gray-800">{groupName}</span>
          <span className="text-sm text-gray-500">{users?.length} Members</span>
        </div>
        <div className="flex space-x-4">
          <FaVideo
            size={25}
            className="text-indigo-500 cursor-pointer hover:text-indigo-700 transition-transform transform hover:scale-105"
            onClick={handleVideoCallClick}
          />
          <FaInfoCircle size={25} className="text-indigo-500 cursor-pointer hover:text-indigo-700 transition-transform transform hover:scale-105" />
        </div>
      </div>

      {/* Video Call Section */}
      <div className="flex space-x-4">
        {/* Local Video */}
        <video ref={localVideoRef} autoPlay muted className={callStarted ? 'block' : 'hidden'} style={{ width: '300px', height: 'auto' }} />

        {/* Remote Video */}
        <video ref={remoteVideoRef} autoPlay className={callStarted ? 'block' : 'block'} style={{ width: '300px', height: 'auto' }} />
      </div>
    </div>
  );
};

export default GroupInfoSection;
