'use client'

import React, { useEffect, useMemo, useState } from 'react'
import ChatMessagerSection from '@/app/components/dashboard/ChatMessagerSection';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';
import LoadingOverlay from '@/app/components/LoadingOverlay';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const { data: userData } = useSession();
  const [messagerLoading, setMessagerLoading] = useState(false);

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
    setMessagerLoading(true);
    socket.emit('chat_history');

    socket.on('chat_history_response', (history) => {
      setMessages(history);
      setMessagerLoading(false);
    });

    return () => {
      socket.off('chat_history_response');
    };
  }, []);

  useEffect(() => {
    setMessagerLoading(true);
    socket.on('receive_new_message', (newMessage) => {
      setMessages(newMessage);
      setMessagerLoading(false);
    });

    return () => {
      socket.off('receive_new_message');
    };
  }, []);

  // Use useMemo to recalculate filterUsers whenever users or userData changes
  const filterUsers = useMemo(() => {
    return users.filter((data: { email: string }) => data?.email !== userData?.user?.email);
  }, [users, userData?.user?.email]);

  return (
    <>
      {messagerLoading ? <LoadingOverlay /> : (
        <ChatMessagerSection
          users={filterUsers}
          groupName={groupName}
          messages={messages}
          isUserChatRoom={false}
        />
      )}
    </>
  )
}

export default DashboardPage