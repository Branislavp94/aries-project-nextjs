'use client'

import React, { useEffect, useState, useMemo } from 'react';
import HeaderAsideSection from './HeaderAsideSection';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import LoadingOverlay from '../LoadingOverlay';
import 'webrtc-adapter';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const MainLayout = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  const [users, setUsers] = useState([]);
  const { data: userData } = useSession();
  const [userLoading, setUserLoading] = useState(false);

  useEffect(() => {
    setUserLoading(true);
    socket.emit('users', { email: userData?.user?.email });

    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setUsers(users);
      setUserLoading(false);
    };

    socket.on('active_users', handleActiveUsers);
  }, [userData?.user?.email]);

  useEffect(() => {
    setUserLoading(true);
    socket.emit('creteNewUser');

    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setUsers(users);
      setUserLoading(false);
    };

    socket.on('new_added_users', handleActiveUsers);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      socket.off('new_added_users', handleActiveUsers);
    };
  }, []);

  useEffect(() => {
    setUserLoading(true);

    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setUsers(users);
      setUserLoading(false);
    };

    socket.on('all_users_response_after_creating_new_conversation', handleActiveUsers);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      socket.off('all_users_response_after_creating_new_conversation', handleActiveUsers);
    };
  }, []);

  useEffect(() => {
    setUserLoading(true);

    const handleActiveUsers = (users: React.SetStateAction<never[]>) => {
      setUsers(users);
      setUserLoading(false);
    };

    socket.on('set_user_data_after_deactivate', handleActiveUsers);

    return () => {
      // Cleanup: Remove the event listener when the component unmounts
      socket.off('set_user_data_after_deactivate', handleActiveUsers);
    };
  }, []);

  // Use useMemo to recalculate filterUsers whenever users or userData changes
  const filterUsers = useMemo(() => {
    return users.filter((data: { email: string }) => data?.email !== userData?.user?.email);
  }, [users, userData?.user?.email]);

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        {userLoading ? <LoadingOverlay /> : <HeaderAsideSection users={filterUsers} />}
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
