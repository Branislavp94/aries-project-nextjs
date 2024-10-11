'use client';

import React, { useMemo, useState } from 'react';
import HeaderAsideSection from './HeaderAsideSection';
import LoadingOverlay from '../LoadingOverlay';
import { useSession } from 'next-auth/react';
import { useActiveUsersData, useAllUsersAfterNewConversation, useCreateNewUser, useDeactivateUserData } from '@/app/hooks/useUserSocketHooks';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { data: userData } = useSession();

  // Use the custom hook to manage socket events and fetch active users' data
  const { data: usersFromAllEvents, isLoading } = useActiveUsersData();

  // Create new user and manage other socket events
  useCreateNewUser();
  useAllUsersAfterNewConversation();
  useDeactivateUserData();

  // Memoize the filtered user list, excluding the current user
  const filterUsers = useMemo(() => {
    if (!usersFromAllEvents || !userData?.user?.email) return [];

    // @ts-ignore
    return usersFromAllEvents.filter((data: { email: string }) => data.email !== userData?.user?.email);
  }, [usersFromAllEvents, userData?.user?.email]);

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        {isLoading ? <LoadingOverlay /> : <HeaderAsideSection users={filterUsers} />}
        {children}
      </div>
    </div>
  );
};

export default MainLayout;
