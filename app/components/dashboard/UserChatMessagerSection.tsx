import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import ChatInputForm from '../forms/ChatInputForm';
import LoadingOverlay from '../LoadingOverlay';
import Image from 'next/image';
import GroupInfoSection from './messages/GroupInfoSection';
import VideoChatRomComponent from '../VideoChatRomComponent';

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] });

type Props = {
  groupName: string;
  users: Array<{}>;
  groupId?: string;
};

const UserChatMessagerSection = ({ groupName, users, groupId }: Props) => {
  const { data: userData } = useSession();
  const [uploadImageLoading, setUploadImageLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [passVideoStreamData, setPassVideoStreamData] = useState(null);

  const isTheSameUser = (id: string | null | undefined) => id === userData?.user?.id;

  useEffect(() => {
    if (groupId) {
      // Join the chat room (group) for typing events
      socket.emit('join_room', { chatRoomId: groupId });

      socket.on('user_chat_typing', (data) => {
        if (data.chatRoomId === groupId) {
          setIsTyping(true);
        }
      });

      socket.on('user_chat_stopped_typing', (data) => {
        if (data.chatRoomId === groupId) {
          setIsTyping(false);
        }
      });

      socket.emit('user_chat_room_send_message', { chatRoomId: groupId });

      socket.on('users_new_chat_history_response', (data) => {
        // Proveri da li su poruke iz trenutne grupe
        if (data) {
          setMessages(data.Messages);
        }
      });

      return () => {
        // Clean up events when leaving the group
        socket.off('user_chat_typing');
        socket.off('user_chat_stopped_typing');
        socket.off('users_new_chat_history_response');
      };
    }
  }, [groupId]);


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, isTyping]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('user_chat_room_send_message', {
        chatRoomId: groupId,
        userId: userData?.user?.id,
        content: message,
      });

      setMessage('');
      setTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setTyping(e.target.value !== '');
  };

  if (typing) {
    socket.emit('user_chat_typing', { chatRoomId: groupId });
  } else {
    socket.emit('user_chat_stopped_typing', { chatRoomId: groupId });
  }

  const handleSelectEmoticon = (emoticon: string) => {
    setMessage((prevMessage) => prevMessage + emoticon);
  };

  const handleImageUpload = async (file: any) => {
    if (file) {
      setUploadImageLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/user/general/supabase/file/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) throw new Error('Failed to upload file');

        const { url } = await response.json();

        if (url) {
          socket.emit('user_chat_room_send_message', {
            content: url,
            chatRoomId: groupId,
            userId: userData?.user?.id,
          });
          setUploadImageLoading(false);
        }

      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleSelectGif = (imageUrl: string) => {
    if (imageUrl) {
      socket.emit('user_chat_room_send_message', {
        content: imageUrl,
        chatRoomId: groupId,
        userId: userData?.user?.id,
      });
    }
  };

  const handleVideoCallBack = (data: React.SetStateAction<null>) => {
    if (data) {
      setPassVideoStreamData(data);
    }
  };

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
        {/* Group Info Section */}
        <GroupInfoSection
          groupName={groupName}
          users={users}
          groupId={groupId}
          videoRefCallback={handleVideoCallBack}
        />

        {/* Messages Section */}
        <div className="flex flex-col h-full overflow-x-auto mb-4 relative">
          {uploadImageLoading ? <LoadingOverlay /> : (
            <div className="grid grid-cols-12 gap-y-2">
              {messages.map((messageObj, index) => {
                const { UserId, content } = messageObj;
                const isLink = content.includes('giphy.com') || content.includes('supabase.co');

                return (
                  <div
                    key={index}
                    className={
                      isTheSameUser(UserId)
                        ? 'col-start-1 col-end-8 p-3 rounded-lg'
                        : 'col-start-6 col-end-13 p-3 rounded-lg'
                    }
                  >
                    <div className="flex flex-col">
                      <span
                        className={
                          isTheSameUser(UserId)
                            ? 'flex p-1 ml-12 text-slate-500'
                            : 'flex p-1 justify-end mr-12 '
                        }
                      >
                        {messageObj.User?.email?.split('@')[0]}
                      </span>
                      <div
                        className={
                          isTheSameUser(UserId)
                            ? 'flex flex-row items-center'
                            : 'flex items-center justify-start flex-row-reverse'
                        }
                      >
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                          {isTheSameUser(UserId) ? 'A' : 'B'}
                        </div>
                        {isLink ? (
                          <div
                            className={
                              isTheSameUser(UserId)
                                ? 'relative ml-3 text-md bg-white py-2 px-4 shadow rounded-xl'
                                : 'relative mr-3 text-md bg-indigo-100 py-2 px-4 shadow rounded-xl'
                            }
                          >
                            <Image
                              src={content}
                              unoptimized={true}
                              width={400}
                              height={400}
                              alt="Link Image"
                            />
                          </div>
                        ) : (
                          <div
                            className={
                              isTheSameUser(UserId)
                                ? 'relative ml-3 text-md bg-white py-2 px-4 shadow rounded-xl'
                                : 'relative mr-3 text-md bg-indigo-100 py-2 px-4 shadow rounded-xl'
                            }
                          >
                            {content}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Show typing indicator */}
          {isTyping && (
            <div className="flex p-4 items-center justify-center">
              <span className="text-gray-500 text-sm">Someone is typing</span>
              <div className="dot-flashing ml-2"></div>
              <div className="dot-flashing ml-2"></div>
              <div className="dot-flashing ml-2"></div>
            </div>
          )}
          <div ref={messagesEndRef}></div>

          <>
            {passVideoStreamData?.localStream && passVideoStreamData?.remoteStream && <div className="fixed inset-0 bg-black opacity-50 z-10" />}
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
              <VideoChatRomComponent
                passVideoStreamData={passVideoStreamData}
                groupId={groupId}
              />
            </div>
          </>
        </div>

        {/* Input Section */}
        <ChatInputForm
          message={message}
          handleTyping={handleTyping}
          sendMessage={sendMessage}
          handleImageUpload={handleImageUpload}
          handleSelectGif={handleSelectGif}
          handleSelectEmoticon={handleSelectEmoticon}
        />
      </div>
    </div>
  );
};

export default UserChatMessagerSection;
