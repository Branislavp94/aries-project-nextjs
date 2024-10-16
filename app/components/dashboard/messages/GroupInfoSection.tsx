import React, { useEffect, useRef, useState } from 'react';
import { FaVideo, FaInfoCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';

type Props = {
    groupName: string;
    users: Array<{ id: number; email: string }>;
    groupId: string;
};

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] });

const GroupInfoSection = ({ groupName, users, groupId }: Props) => {
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerId, setCallerId] = useState('');

    const configuration = {
        iceServers: [
            {
                urls: [
                    "stun:stun1.l.google.com:19302",
                    "stun:stun2.l.google.com:19302",
                    "stun:stun3.l.google.com:19302",
                    "stun:stun4.l.google.com:19302",
                    "stun:stunserver.org",
                    "stun:stun.voipstunt.com",
                ],
            },
        ],
    };

    useEffect(() => {
        socket.emit('join-group', groupId);

        socket.on('incoming_call', ({ from }) => {
            setIncomingCall(true);
            setCallerId(from);
        });

        return () => {
            socket.off('incoming_call');
        };
    }, [groupId]);

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            socket.emit('call_user', { groupId, from: socket.id });
            peerConnectionRef.current = setupPeerConnection(stream);
        } catch (error) {
            console.error('Error starting call:', error);
        }
    };

    useEffect(() => {
        if (localStream && localVideoRef.current) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const setupPeerConnection = (stream: MediaStream) => {
        const peerConnection = new RTCPeerConnection(configuration);

        // Add local tracks to peer connection
        stream.getTracks().forEach((track) => {
            peerConnection.addTrack(track, stream);
        });

        // Listen for ICE candidates and send them to the signaling server
        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, groupId });
            }
        };

        // Handle incoming ICE candidates from the remote peer
        socket.on('ice-candidate', async ({ candidate }) => {
            if (candidate) {
                try {
                    await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (error) {
                    console.error('Error adding received ICE candidate:', error);
                }
            }
        });

        // Handle negotiation needed for new offer/answer exchange
        peerConnection.onnegotiationneeded = async () => {
            try {
                const offer = await peerConnection.createOffer();
                await peerConnection.setLocalDescription(offer);
                socket.emit('video-offer', { offer, groupId });
            } catch (error) {
                console.error('Error during negotiation (createOffer):', error);
            }
        };

        // Handle incoming video offer
        socket.on('video-offer', async ({ offer }) => {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit('video-answer', { answer, groupId });
            } catch (error) {
                console.error('Error handling incoming video offer:', error);
            }
        });

        // Handle incoming video answer
        socket.on('video-answer', async ({ answer }) => {
            try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
                console.log('Set remote description with answer');
            } catch (error) {
                console.error('Error handling incoming video answer:', error);
            }
        });

        // Handle incoming tracks from the remote peer
        peerConnection.ontrack = (event) => {
            const [remoteStream] = event.streams;

            if (remoteStream) {
                setRemoteStream(remoteStream); // Update state with remote stream
            }
        };

        return peerConnection;
    };

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const acceptCall = async () => {
        setIncomingCall(false);

        // Get user media stream (video/audio) before starting the WebRTC connection
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        peerConnectionRef.current = setupPeerConnection(stream);
    };

    // Clean up WebRTC on unmount
    useEffect(() => {
        return () => {
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
                peerConnectionRef.current = null;
            }
        };
    }, []);

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
                        onClick={startCall}
                    />
                    <FaInfoCircle
                        size={25}
                        className="text-indigo-500 cursor-pointer hover:text-indigo-700 transition-transform transform hover:scale-105"
                    />
                </div>
            </div>

            <div className="flex space-x-4">
                <video ref={localVideoRef} muted autoPlay style={{ width: '300px', height: 'auto', border: '1px solid black' }} />
                <video ref={remoteVideoRef} muted autoPlay style={{ width: '300px', height: 'auto', border: '1px solid black' }} />
            </div>

            {incomingCall && (
                <div className="flex flex-col gap-3 justify-center">
                    <span>Incoming call from: {callerId}</span>
                    <button onClick={acceptCall}>Accept</button>
                    <button onClick={() => setIncomingCall(false)}>Decline</button>
                </div>
            )}
        </div>
    );
};

export default GroupInfoSection;
