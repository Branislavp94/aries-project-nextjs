'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { FaVideo, FaInfoCircle } from 'react-icons/fa'; // Import icons for video and info

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

type Props = {
  groupName: string;
  users: Array<{}>;
}

const ChatMessagerSection = ({ groupName, users }: Props) => {
  const { data: userData } = useSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const isTheSameUser = (id: string | null | undefined) => id === userData?.user?.id;

  useEffect(() => {
    socket.emit('chat_history');

    socket.on('chat_history_response', (history) => {
      setMessages(history);
    });

    return () => {
      socket.off('chat_history_response');
    };
  }, []);

  useEffect(() => {
    socket.on('receive_new_message', (newMessage) => {
      setMessages(newMessage);
    });

    return () => {
      socket.off('receive_new_message');
    };
  }, []);

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
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('send_messages', {
        content: message,
        socketId: socket.id,
        userId: userData?.user?.id,
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

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
        {/* Group Info Section */}
        <div className="flex justify-between items-center bg-white p-4 mb-4 rounded-xl shadow-md">
          <div className="flex flex-col space-y-1">
            <span className="text-lg font-semibold text-gray-800">{groupName}</span>
            <span className="text-sm text-gray-500">{users?.length} Members</span>
          </div>
          <div className="flex space-x-4">
            <FaVideo className="text-indigo-500 cursor-pointer hover:text-indigo-700" size={24} />
            <FaInfoCircle className="text-indigo-500 cursor-pointer hover:text-indigo-700" size={24} />
          </div>
        </div>

        {/* Messages Section */}
        <div className="flex flex-col h-full overflow-x-auto mb-4">
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-12 gap-y-2">
              {messages &&
                messages.map((data: { UserId: string; message: string }, index) => (
                  <div
                    key={index}
                    className={
                      isTheSameUser(data.UserId)
                        ? 'col-start-1 col-end-8 p-3 rounded-lg'
                        : 'col-start-6 col-end-13 p-3 rounded-lg'
                    }
                  >
                    <div className="flex flex-col">
                      <span
                        className={
                          isTheSameUser(data.UserId)
                            ? 'flex p-1 ml-12 text-slate-500'
                            : 'flex p-1 justify-end mr-12 '
                        }
                      >
                        {data.User?.email?.split('@')[0]}
                      </span>
                      <div
                        className={
                          isTheSameUser(data.UserId)
                            ? 'flex flex-row items-center'
                            : 'flex items-center justify-start flex-row-reverse'
                        }
                      >
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                          {isTheSameUser(data.UserId) ? 'A' : 'B'}
                        </div>
                        <div
                          className={
                            isTheSameUser(data.UserId)
                              ? 'relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl'
                              : 'relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl'
                          }
                        >
                          {data.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>

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
        <form onSubmit={sendMessage}>
          <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
            <div className="flex-grow ml-4">
              <div className="relative w-full">
                <input
                  type="text"
                  className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                  value={message}
                  onChange={handleTyping}
                />
              </div>
            </div>
            <div className="ml-4">
              <button
                type="submit"
                className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
              >
                <span>Send</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatMessagerSection;
