import { successMesasge } from '@/lib/reactTostifyMessage';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { FaVideo, FaInfoCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import callingAnimation from '../../../lottie Animation/calling_animation.json'
import Lottie from "lottie-react";

type Props = {
    groupName: string;
    users: Array<{ id: number; email: string }>;
    groupId: string;
    videoRefCallback: (ref: { remoteStream: MediaStream | null; localStream: MediaStream | null; localVideoRef: React.RefObject<HTMLVideoElement>; remoteVideoRef: React.RefObject<HTMLVideoElement>; }) => void;
};

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] });

const GroupInfoSection = ({ groupName, users, groupId, videoRefCallback }: Props) => {
    const { data: userData } = useSession();
    const localVideoRef = useRef<HTMLVideoElement | null>(null);
    const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [incomingCall, setIncomingCall] = useState(false);
    const [callerName, setCallerName] = useState('');

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
        socket.emit('join_room', groupId);

        socket.on('incoming_call', ({ user }) => {
            setIncomingCall(true);
            setCallerName(user?.email);
        });

        const handleUserLeft = (data: any) => {
            cleanUpStreams();

            videoRefCallback({ remoteStream: null, localStream: null, localVideoRef: null, remoteVideoRef: null });

            setIncomingCall(false);

            if (data) {
                const userEmail = data.user.email;

                if (userEmail !== userData?.user?.email) {
                    successMesasge(`${userEmail} left the call`)
                }
            }
        };

        socket.on('user-left', handleUserLeft);

        return () => {
            socket.off('incoming_call');
            socket.off('user-left', handleUserLeft); // Properly remove the specific handler
        };
    }, [groupId]);

    const startCall = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            socket.emit('call_user', { groupId, from: socket.id, user: userData.user });
            peerConnectionRef.current = setupPeerConnection(stream);
        } catch (error) {
            console.error('Error starting call:', error);
        }
    };

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

    const acceptCall = async () => {
        setIncomingCall(false);
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        peerConnectionRef.current = setupPeerConnection(stream);
    };

    const cleanUpStreams = () => {
        // Stop local stream tracks (video and audio)
        if (localStream) {
            localStream.getTracks().forEach((track) => {
                if (track.readyState === 'live') {
                    track.stop(); // Explicitly stop the track
                }
            });

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null; // Stop the local video playback
            }
        }

        if (remoteStream) {
            remoteStream.getTracks().forEach((track) => {
                if (track.readyState === 'live') {
                    track.stop(); // Stop remote tracks
                }
            });

            if (remoteVideoRef.current) {
                remoteVideoRef.current.srcObject = null; // Stop the remote video playback
            }
        }

        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }

        // Reset state
        setLocalStream(null);
        setRemoteStream(null);
    };

    useEffect(() => {
        if (remoteStream && localStream) {
            videoRefCallback({ remoteStream, localStream, localVideoRef, remoteVideoRef });
        }
    }, [remoteStream, localStream]);


    const declineCall = () => {
        //  TO DO: LATER
    }


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

            {incomingCall && (
                <div className="flex flex-col gap-3 justify-center items-center  p-4 rounded-lg shadow-lg fixed inset-0 bg-black opacity-80 z-10">
                    <div className="w-48 h-48 z-50">
                        {/* Lottie animation */}
                        <Lottie loop={true} animationData={callingAnimation} />
                    </div>
                    <span className="text-lg z-50 font-bold text-white">Incoming call from: {callerName}</span>
                    <div className="flex gap-4 mt-4 z-50">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-200 font-bold"
                            onClick={acceptCall}
                        >
                            Accept
                        </button>
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200 font-bold"
                            onClick={declineCall}>
                            Decline
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupInfoSection;
