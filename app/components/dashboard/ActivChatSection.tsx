'use client'

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

const ActivChatSection = ({ users }) => {
  const { data: userData } = useSession();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const handleStartNewConversation = (user: { email: string }) => {
    if (userData && user) {
      socket.emit('chat_room_users', { userOne: userData.user.id, userTwo: user.id });
    }
  };

  return (
    <>
      <div className="flex flex-col mt-8">
        <div className="max-w-2xl mx-auto mt-5">
          {users.length === 0 ? (
            <p>No active users</p>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between gap-4 p-4 mb-3 rounded-lg shadow-md ${user.hasActiveConversation
                  ? 'bg-blue-100 border-l-4 border-blue-400' // Active conversation style
                  : 'bg-gray-50 hover:bg-gray-100' // No conversation style
                  } transition-all ease-in-out duration-300`}
              >
                {/* Avatar and Active Status */}
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <Image
                      src={LogoImage}
                      width={50}
                      height={50}
                      alt="User Avatar"
                    />
                  </div>
                  <span
                    className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${user.isActive ? 'bg-green-400' : 'bg-red-400'
                      }`}
                  ></span>
                </div>

                {/* User Information and Chat Preview */}
                <div className="flex flex-col justify-center w-full">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-800">
                      {user.email.split('@')[0]}
                    </span>
                    {user.hasActiveConversation && (
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>
                  {/* Chat preview or status */}
                  {user.hasActiveConversation ? (
                    <div className="text-sm text-gray-600">
                      {user.last_msg_text.slice(0, 30)}...{' '}
                      <span className="font-semibold">({user.recive_msg_count})</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-400">No chat yet</span>
                  )}
                </div>

                {/* Action button to start or enter chat */}
                <div
                  className="cursor-pointer"
                  onClick={() => handleStartNewConversation(user)}
                >
                  <Image
                    src={user.hasActiveConversation ? EnterChatMsgIcon : CreateChatMsgIcon}
                    width={70}
                    height={70}
                    alt="Chat Icon"
                    className={`transition-transform transform ${user.hasActiveConversation
                      ? 'scale-105 hover:scale-110'
                      : 'hover:scale-105'
                      }`}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default ActivChatSection;
