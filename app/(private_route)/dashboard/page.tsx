'use client'

import React, { useEffect, useState } from 'react'
import ChatMessagerSection from '@/app/components/dashboard/ChatMessagerSection';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';
import LoadingOverlay from '@/app/components/LoadingOverlay';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const { data: userData } = useSession();

  const groupName = 'Global Main Room';

  useEffect(() => {
    socket.emit('users', { email: userData?.user?.email });

    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setUsers(users);
    };

    socket.on('active_users', handleActiveUsers);

  }, [userData?.user?.email]);

  useEffect(() => {
    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setUsers(users);
    };

    socket.on('new_added_users', handleActiveUsers);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      socket.off('new_added_users', handleActiveUsers);
    };

  }, []);

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

  console.log('messages', messages)

  return (
    <>
      {messages.length <= 0 ? <LoadingOverlay /> : (
        <ChatMessagerSection
          users={users}
          groupName={groupName}
          messages={messages}
          isUserChatRoom={false}
        />
      )}
    </>
  )
}

export default DashboardPage