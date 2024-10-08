'use client'

import React, { useEffect, useState } from 'react'
import ChatMessagerSection from '@/app/components/dashboard/ChatMessagerSection';
import HeaderAsideSection from '@/app/components/dashboard/HeaderAsideSection';
import MainLayout from '@/app/components/dashboard/MainLayout';
import { useSession } from 'next-auth/react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const DashboardPage = () => {
  const [users, setUsers] = useState([]);
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

  return (
    <MainLayout>
      <HeaderAsideSection users={users} />
      <ChatMessagerSection users={users} groupName={groupName} />
    </MainLayout>
  )
}

export default DashboardPage