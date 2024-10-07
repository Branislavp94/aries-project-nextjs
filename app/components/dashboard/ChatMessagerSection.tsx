'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const ChatMessagerSection = () => {
  const { data: userData } = useSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
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

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('send_messages', {
        content: message,
        socketId: socket.id,
        userId: userData?.user?.id,
      });
      setMessage(''); // Clear the input after sending
    }
  };

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
        <>
          <div className="flex flex-col h-full overflow-x-auto mb-4">
            <div className="flex flex-col h-full">
              <div className="grid grid-cols-12 gap-y-2">
                {messages && messages.map((data: { UserId: string, message: string }, index) => (
                  <div key={index} className={isTheSameUser(data.UserId) ? "col-start-1 col-end-8 p-3 rounded-lg" : 'col-start-6 col-end-13 p-3 rounded-lg'}>
                    <div className="flex flex-col">
                      <span className={isTheSameUser(data.UserId) ? 'flex p-1 ml-12 text-slate-500' : 'flex p-1 justify-end mr-12 '}>
                        {data.User?.email?.split('@')[0]}
                      </span>
                      <div className={isTheSameUser(data.UserId) ? 'flex flex-row items-center' : 'flex items-center justify-start flex-row-reverse'}>
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                          {isTheSameUser(data.UserId) ? 'A' : 'B'}
                        </div>
                        <div className={isTheSameUser(data.UserId) ? 'relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl' : 'relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl'}>
                          {data.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={messagesEndRef}></div>
            </div>
          </div>
          <form onSubmit={sendMessage}>
            <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
              <div className="flex-grow ml-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
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
        </>
      </div>
    </div>
  );
};

export default ChatMessagerSection;