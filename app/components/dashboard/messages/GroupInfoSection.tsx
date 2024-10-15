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
    const [callAccepted, setCallAccepted] = useState(false); // New state to track if call is accepted

    useEffect(() => {
        socket.emit('join-group', groupId);

        socket.on('incoming_call', ({ from }) => {
            setIncomingCall(true);
            setCallerId(from);
        });

        socket.on('video-offer', async ({ offer, sender }) => {
            console.log('Received video offer from:', sender);
            await handleVideoOffer(offer);
        });

        socket.on('video-answer', async ({ answer }) => {
            console.log('Received video answer');
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            }
        });

        socket.on('ice-candidate', ({ candidate }) => {
            console.log('ice-candidate', candidate);
            if (peerConnectionRef.current) {
                peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        });

        return () => {
            socket.off('incoming_call');
            socket.off('video-offer');
            socket.off('video-answer');
            socket.off('ice-candidate');
        };
    }, [groupId]);

    const startCall = async () => {
        console.log('Starting call');
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        socket.emit('call_user', { groupId, from: socket.id });
    };

    // Effect to handle localStream changes
    useEffect(() => {
        if (localStream && localVideoRef.current) {
            console.log('Setting local video stream');
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    const initiateWebRTC = async () => {
        const peerConnection = new RTCPeerConnection();
        const localStreamNew = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

        if (localStreamNew) {
            localStreamNew.getTracks().forEach(track => peerConnection.addTrack(track, localStreamNew));
        }

        console.log('localVideoRef', localVideoRef);
        console.log('localStreamNew', localStreamNew);

        if (localStreamNew && localVideoRef.current) {
            localVideoRef.current.srcObject = localStreamNew;
        }

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, groupId });
            }
        };

        peerConnection.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peerConnectionRef.current = peerConnection;

        peerConnection.createOffer().then((offer) => {
            peerConnection.setLocalDescription(offer);
            socket.emit('video-offer', { offer, groupId });
        });
    };

    const handleVideoOffer = async (offer: RTCSessionDescriptionInit) => {
        const peerConnection = new RTCPeerConnection();

        await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', { candidate: event.candidate, groupId });
            }
        };

        peerConnection.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        peerConnectionRef.current = peerConnection;

        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit('video-answer', { answer, groupId });
    };

    useEffect(() => {
        if (remoteStream && remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    // Accept call handler
    const acceptCall = async () => {
        setIncomingCall(false); // Hide incoming call prompt
        setCallAccepted(true); // Set call as accepted
        initiateWebRTC(); // Start the WebRTC connection
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
                        onClick={startCall}
                    />
                    <FaInfoCircle size={25} className="text-indigo-500 cursor-pointer hover:text-indigo-700 transition-transform transform hover:scale-105" />
                </div>
            </div>

            <div className="flex space-x-4">
                {/* Local Video */}
                <video
                    ref={localVideoRef}
                    muted
                    autoPlay
                    style={{ width: '300px', height: 'auto', border: '1px solid black' }}
                />

                {/* Remote Video */}
                <video
                    ref={remoteVideoRef}
                    autoPlay
                    style={{ width: '300px', height: 'auto', border: '1px solid black' }}
                />
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
