'use client';
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { FaVideo, FaInfoCircle } from 'react-icons/fa'; // Import icons
import ChatInputForm from '../forms/ChatInputForm';
import Image from 'next/image';
import LoadingOverlay from '../LoadingOverlay';
import GroupInfoSection from './messages/GroupInfoSection';

const socket = io('http://localhost:5000', { transports: ['websocket'] });

type Props = {
  groupName: string;
  users: Array<{}>;
  groupId?: string;
  isUserChatRoom?: boolean;
  messages: Array<{ UserId: string, content: string, User: { email: string } }>;
};

const ChatMessagerSection = ({
  groupName,
  users,
  messages,
}: Props) => {
  const { data: userData } = useSession();
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [uploadImageLoading, setUploadImageLoading] = useState(false);

  const isTheSameUser = (id: string | null | undefined) => id === userData?.user?.id;

  // Listen for typing event
  useEffect(() => {
    socket.on('user_typing', () => {
      setIsTyping(true);
    });

    socket.on('user_stopped_typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current || isTyping) {
      // @ts-ignore
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('send_messages', {
        content: message,
        socketId: socket.id,
        userId: userData?.user?.id as string,
      });

      setMessage('');
      setTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    if (!typing) {
      setTyping(true);
    }
    if (e.target.value === '') {
      setTyping(false);
    }
  };

  if (typing) {
    socket.emit('typing');
  } else {
    socket.emit('stop_typing');
  }

  // Handler for selecting emoticons
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

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const { url } = await response.json();

        if (url) {

          const response = socket.emit('send_messages', {
            content: url, // Use the public URL for the message
            socketId: socket.id,
            userId: userData?.user?.id as string,
          });

          if (response) {
            setUploadImageLoading(false)
          }
        }

      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
  };

  const handleSelectGif = (imageUrl: string) => {
    if (imageUrl) {
      socket.emit('send_messages', {
        content: imageUrl,
        socketId: socket.id,
        userId: userData?.user?.id as string,
      });
    }
  }

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
        {/* Group Info Section */}
        <GroupInfoSection groupName={groupName} users={users} />

        {/* Messages Section */}
        <div className="flex flex-col h-full overflow-x-auto mb-4">
          <div className="flex flex-col h-full">
            {uploadImageLoading ? <LoadingOverlay /> : (
              <div className="grid grid-cols-12 gap-y-2">
                {messages &&
                  messages.map((messageObj, index) => {
                    const { UserId, content } = messageObj; // Access UserId and message from messageObj

                    // Check if the message content contains a Giphy link
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
                                  src={content} // Assuming the content contains the Giphy URL
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
          </div>
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

export default ChatMessagerSection;
