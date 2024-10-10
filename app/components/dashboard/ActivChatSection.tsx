import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import LogoImage from '@/public/images/413031207_6745980488864413_7674386761553248927_n.jpg';
import CreateChatMsgIcon from '@/public/new_message_icon.png';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] }); // Update with your server URL

const ActivChatSection = ({ users }) => {
  const { data: userData } = useSession();
  const router = useRouter();
  const [fetchRoom, setFetchRoom] = useState(false);
  const [usersFetchData, setFetchUsersData] = useState(users);

  const handleStartNewConversation = (user) => {
    if (userData && user) {
      const response = socket.emit('chat_room_users', { userOne: userData.user.id, userTwo: user.id });

      if (response) {
        setFetchRoom(true);
      }
    }
  };

  const handleSectionClick = (user) => {
    if (user.ChatRooms.length > 0) {
      const chatRoom = user.ChatRooms[0];
      router.push(`/userChatRoom/${chatRoom.id}`);
    }
  };

  // Sync usersFetchData state with users prop whenever users changes
  useEffect(() => {
    setFetchUsersData(users);
  }, [users]);

  useEffect(() => {
    if (fetchRoom) {
      socket.emit('chat_room_users');

      socket.on('chat_room_users_response', (data) => {
        if (data) {
          setFetchRoom(false);
          router.push(`/userChatRoom/${data.id}`);
        }
      });

      return () => {
        socket.off('chat_room_users_response');
      };
    }
  }, [fetchRoom]);

  return (
    <>
      <div className="flex flex-col mt-8">
        <div
          className="flex items-center cursor-pointer justify-center gap-4 p-4 mb-3 rounded-lg shadow-md w-96 bg-gray-50 hover:bg-gray-100 ease-in-out duration-300 text-center font-bold transition-transform transform hover:scale-105"
          onClick={() => router.push('/dashboard')}
        >
          <span>Global Main Room</span>
        </div>
        <div className="max-w-2xl mx-auto mt-5">
          {usersFetchData.length === 0 ? (
            <p>No active users</p>
          ) : (
            usersFetchData.map((user) => {
              const hasChatRoom = user.ChatRooms.some((chatRoom) =>
                chatRoom.name.includes(userData.user.email)
              );

              return (
                <div
                  key={user.id}
                  className={`flex items-center justify-between gap-4 p-4 mb-3 rounded-lg shadow-md w-96 transition-all ease-in-out duration-500 ${hasChatRoom ? 'bg-blue-100 border-l-4 border-blue-400 cursor-pointer hover:scale-105' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  onClick={() => hasChatRoom && handleSectionClick(user)}
                >
                  {/* Avatar and Active Status */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <Image src={LogoImage} width={50} height={50} alt="User Avatar" />
                    </div>
                    <span
                      className={`absolute top-0 right-0 w-4 h-4 rounded-full border-2 border-white ${user.isActive ? 'bg-green-400' : 'bg-red-400'}`}
                    ></span>
                  </div>

                  {/* User Information and Chat Preview */}
                  <div className="flex flex-col justify-center w-full">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-800">
                        {user.email.split('@')[0]}
                      </span>
                      {hasChatRoom && (
                        <span className="text-xs text-gray-500">
                          {new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    {/* Chat preview or status */}
                    {hasChatRoom ? (
                      <div className="text-sm text-gray-600">
                        <span className="font-semibold">You have a chat with this user</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">No chat yet</span>
                    )}
                  </div>

                  {/* Action button to start or enter chat */}
                  {!hasChatRoom && (
                    <div className="cursor-pointer" onClick={() => handleStartNewConversation(user)}>
                      <Image
                        src={CreateChatMsgIcon}
                        width={70}
                        height={70}
                        alt="Chat Icon"
                        className="transition-transform transform hover:scale-105"
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default ActivChatSection;
