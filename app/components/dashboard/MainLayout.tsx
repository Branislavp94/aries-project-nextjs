'use client'

import React, { useEffect, useState } from 'react'
import HeaderAsideSection from './HeaderAsideSection'
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import LoadingOverlay from '../LoadingOverlay';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const MainLayout = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const [users, setUsers] = useState([]);
  const { data: userData } = useSession();

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
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        {users.length <= 0 ? <LoadingOverlay /> : (
          <HeaderAsideSection users={users} />
        )}
        {children}
      </div>
    </div>
  )
}

export default MainLayout