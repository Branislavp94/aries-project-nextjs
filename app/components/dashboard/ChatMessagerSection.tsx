'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const ChatMessagerSection = () => {
  const { data } = useSession();
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('')
  const [messages, setMessages] = useState([]);

  const showChat = username === data?.user?.email;

  useEffect(() => {
    const handleMessage = (data: { message: string; username: React.SetStateAction<string>; }) => {
      setMessages((prevMessages) => [...prevMessages, data?.message]);
      setUsername(data?.username);
    };

    socket.on('recive_message', handleMessage);

    return () => {
      socket.off('recive_message', handleMessage);
    };
  }, []);

  const sendMessage = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('message', {
        message,
        username: data?.user?.email,
      });
      setMessage('');
    }
  };


  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
        <div className="flex flex-col h-full overflow-x-auto mb-4">
          <div className="flex flex-col h-full">
            <div className="grid grid-cols-12 gap-y-2">
              {messages.map((data, index) => (
                <>
                  <div key={index} className={showChat ? "col-start-1 col-end-8 p-3 rounded-lg" : 'col-start-6 col-end-13 p-3 rounded-lg'}>
                    <div className={showChat ? 'flex flex-row items-center' : 'flex items-center justify-start flex-row-reverse'}>
                      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                        {showChat ? 'A' : 'B'}
                      </div>
                      <div className={showChat ? 'relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl' : 'relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl'}>
                        <div>{data}</div>
                      </div>
                    </div>
                  </div>
                </>
              ))}
            </div>
          </div>
        </div>
        <form onSubmit={sendMessage}>
          <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
            <div>
              <button
                type="button" // Assuming this button is not meant to submit the form
                className="flex items-center justify-center text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* ... */}
                </svg>
              </button>
            </div>
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
                <span className="ml-2">
                  <svg
                    className="w-4 h-4 transform rotate-45 -mt-px"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* ... */}
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ChatMessagerSection