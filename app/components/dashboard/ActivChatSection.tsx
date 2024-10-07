"use client"
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import LoadingIndicator from '../LoadingIndicator';
import Image from 'next/image';
import LogoImage from '@/public/images/413031207_6745980488864413_7674386761553248927_n.jpg'
import CreateChatMsgIcon from '@/public/new_message_icon.png'
import EnterChatMsgIcon from '@/public/chat-code.svg'
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const ActivChatSection = () => {
  const { data: userData } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    socket.emit('users', { email: userData?.user?.email });

    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setLoading(false);
      setUsers(users);
    };

    socket.on('active_users', handleActiveUsers);

  }, [userData?.user?.email]);


  useEffect(() => {
    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setLoading(false);
      setUsers(users);
    };

    socket.on('set_user_data_after_deactivate', handleActiveUsers);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      socket.off('set_user_data_after_deactivate', handleActiveUsers);
    };

  }, []);

  useEffect(() => {
    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setLoading(false);
      setUsers(users);
    };

    socket.on('new_added_users', handleActiveUsers);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      socket.off('new_added_users', handleActiveUsers);
    };

  }, []);

  const handleStartNewConversation = (user: { email: string, hasActiveConversation: boolean }) => {

  }

  return (
    <>
      <div className="flex flex-col mt-8">
        <div onClick={() => router.push('/dashboard?groupId=main')} className="flex flex-row items-center text-xs cursor-pointer">
          <span className="font-bold">Main Group</span>
        </div>
      </div>
      <div className="flex flex-col mt-8">
        <div className="flex flex-row items-center justify-between text-xs">
          <span className="font-bold">All Users</span>
          <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full p-3">{users.length}</span>
        </div>
        <div className="max-w-2xl mx-auto mt-5">
          {loading ?
            <div className="m-auto">
              <LoadingIndicator />
            </div> :
            <>
              {users && users.map((user: { email: string, id: number, isActive: boolean, hasActiveConversation: boolean, recive_msg_count: number, last_msg_text: string }) => (
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
                    <div className='flex flex-col  justify-center align-middle mt-2'>
                      {user.email.split('@')[0]}
                      {user.hasActiveConversation && (
                        <div className='flex gap-2'>
                          <span className='text-sm'>
                            {user.last_msg_text.slice(0, 5)}...
                          </span>
                          <span className='text-sm'>
                            {new Date().toDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="relative ml-auto cursor-pointer" onClick={() => handleStartNewConversation(user)}>
                      <Image
                        width={40}
                        height={40}
                        src={user.hasActiveConversation ? EnterChatMsgIcon : CreateChatMsgIcon}
                        alt='image'
                      />
                      {user.hasActiveConversation && (
                        <span className={`absolute top-2 left-8 transform -translate-y-1/2 w-8 h-5.5 flex justify-center items-center bg-indigo-500 border-2 border-white rounded-full text-lg`}>
                          {user.recive_msg_count}
                        </span>
                      )}
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