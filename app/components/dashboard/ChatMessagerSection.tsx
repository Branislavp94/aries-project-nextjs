'use client'
import { useSession } from 'next-auth/react';
import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client';
import SceletonLoading from '../SceletonLoading';
import { useSearchParams } from 'next/navigation'

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const ChatMessagerSection = () => {
  const searchParams = useSearchParams()
  const { data: userData } = useSession();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState('');
  const [loading, setLoading] = useState(true); // Track loading state
  const messagesEndRef = useRef(null);
  const groupId = searchParams.get('groupId');

  useEffect(() => {
    // Listen for the chat history event and update the state
    socket.on('chat_history', (history) => {
      setMessages(history.messages);
      setLoading(false); // Set loading to false after chat history is received
      scrollToBottom();
    });


    if (groupId) {
      // Request chat history when the user joins or refreshes the page
      socket.emit('request_chat_history', { groupId });
    }
  }, [groupId]); // Dependency array is empty, so it runs only once when the component mounts

  useEffect(() => {
    // Listen for the 'recive_message' event and update the state
    socket.on('recive_message', (data) => {
      if (data && data.messages && data.messages.length > 0) {
        // Update state with only the last message in the array
        // @ts-ignore
        setMessages((prevMessages) => [...prevMessages, data.messages[data.messages.length - 1]]);
        scrollToBottom();
      }
    });

    // Listen for the 'typingResponse' event and update the state
    socket.on('typingResponse', (data) => {
      setTypingStatus(data);
    });

    return () => {
      socket.off('recive_message');
      socket.off('typingResponse');
      setTypingStatus('');
    };
  }, []);

  const sendMessage = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('message', {
        message,
        username: userData?.user?.email,
        socketId: socket.id,
        timeStamp: new Date().toLocaleDateString(),
        groupId,
        // @ts-ignore
        userId: userData?.user.id,
      });
      setMessage('');
    }
  };

  const handleTyping = () => {
    socket.emit('user_typing', `${userData?.user?.email} is typing...`);
  }

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
        {loading ? <SceletonLoading /> : (
          <>
            <div className="flex flex-col h-full overflow-x-auto mb-4">
              <div className="flex flex-col h-full">
                <div className="grid grid-cols-12 gap-y-2">
                  {messages && messages?.map((data: { userId: string, message: string, username: string, timeStamp: string }) => (
                    <>
                      <div key={data?.userId} className={data?.username === userData?.user?.email ? "col-start-1 col-end-8 p-3 rounded-lg" : 'col-start-6 col-end-13 p-3 rounded-lg'}>
                        <div className='flex flex-col'>
                          <span className={data?.username === userData?.user?.email ? 'flex p-1 ml-12 text-slate-500' : 'flex p-1 justify-end mr-12 '}>{data?.username?.split('@')[0]}</span>
                          <div className={data?.username === userData?.user?.email ? 'flex flex-row items-center' : 'flex items-center justify-start flex-row-reverse'}>
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                              {data?.username === userData?.user?.email ? 'A' : 'B'}
                            </div>
                            <div className={data?.username === userData?.user?.email ? 'relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl' : 'relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl'}>
                              {data?.message}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ))}
                </div>
              </div>
              <div className="m-auto">
                <p>{typingStatus}</p>
              </div>
            </div>
            <div ref={messagesEndRef}></div>
            <form onSubmit={sendMessage}>
              <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
                <div>
                  <button
                    type="button"
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
                      onKeyDown={handleTyping}
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
          </>
        )}
      </div>
    </div>
  )
}

export default ChatMessagerSection