"use client"
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import LoadingIndicator from '../LoadingIndicator';
import Image from 'next/image';
import LogoImage from '@/public/images/413031207_6745980488864413_7674386761553248927_n.jpg'
import CreateChatMsgIcon from '@/public/new_message_icon.png'
import EnterChatMsgIcon from '@/public/chat-code.svg'
import { useSession } from 'next-auth/react';
import LoadingOverlay from '../LoadingOverlay';
import { useRouter } from 'next/navigation';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const ActivChatSection = () => {
  const { data: userData } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newChatLoading, setNewChatLoading] = useState(false);
  const [roomName, setRoomName] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (roomName !== '') {
      setNewChatLoading(true);
      const handleChatReponse = (data: { roomName: string }) => {
        setNewChatLoading(false);
        router.replace(`/dashboard?groupId=${data.roomName}`)
        router.refresh();
      }

      socket.on('chat_room_response', handleChatReponse);
      socket.emit('create_new_room', { roomName });

      return () => {
        // Cleanup: Remove the event listener when the component unmounts
        socket.off('chat_room_response', handleChatReponse);
      };
    }
  }, [roomName, router]);

  useEffect(() => {
    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setLoading(false);
      setUsers(users);
    };

    socket.on('active_users', handleActiveUsers);
    // socket.on('user_conversation', handleUserConversation);

    socket.emit('users', {
      email: userData?.user?.email,
      roomName
    });

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      socket.off('active_users', handleActiveUsers);
      // socket.off('user_conversation', handleUserConversation);
    };

  }, [roomName, userData?.user?.email]);

  const handleStartNewConversation = (user: { email: string, hasActiveConversation: boolean }) => {
    const username = user.email.split('@')[0].trim();
    // @ts-ignore
    const userEmail = userData?.user?.email.split('@')[0].trim();
    const roomName = `${userEmail}-${username}`

    if (user?.hasActiveConversation) {
      router.replace(`/dashboard?groupId=${roomName}`)
    } else {
      setRoomName(roomName);
      socket.emit('set_user_active_status', { roomName, email: user.email });
    }
  }

  return (
    <>
      {newChatLoading && <LoadingOverlay />}
      <div className="flex flex-col mt-8">
        <div onClick={() => router.push('/dashboard?groupId=main')} className="flex flex-row items-center text-xs cursor-pointer">
          <span className="font-bold">Main Group</span>
        </div>
      </div>
      <div className="flex flex-col mt-8">
        <div className="flex flex-row items-center justify-between text-xs">
          <span className="font-bold">All Users</span>
          <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">{users.length}</span>
        </div>
        <div className="max-w-2xl mx-auto mt-5">
          {loading ?
            <div className="m-auto">
              <LoadingIndicator />
            </div> :
            <>
              {users && users.map((user: { email: string, id: number, isActive: boolean, hasActiveConversation: boolean }) => (
                <>
                  <div className="flex items-center justify-evenly gap-4">
                    <div className="relative">
                      <div className="w-10 h-10 rounded mt-3">
                        <Image
                          width={50}
                          height={50}
                          src={LogoImage}
                          alt='image'
                        />
                      </div>
                      <span className={`absolute top-3 left-8 transform -translate-y-1/2 w-3.5 h-3.5 ${user.isActive ? 'bg-green-400' : 'bg-red-400'} border-2 border-white dark:border-gray-800 rounded-full`}></span>
                    </div>
                    <div>{user.email.split('@')[0]}</div>
                    <div className="ml-auto cursor-pointer" onClick={() => handleStartNewConversation(user)}>
                      <Image
                        width={40}
                        height={40}
                        src={user.hasActiveConversation ? EnterChatMsgIcon : CreateChatMsgIcon}
                        alt='image'
                      />
                    </div>
                  </div>
                </>
              ))}
            </>}
        </div>
      </div>
    </>
  )
}

export default ActivChatSection