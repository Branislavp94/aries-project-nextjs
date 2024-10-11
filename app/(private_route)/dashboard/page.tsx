'use client'

import React from 'react';
import ChatMessagerSection from '@/app/components/dashboard/ChatMessagerSection';
import { useSession } from 'next-auth/react';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { useActiveUsersData } from '@/app/hooks/useUserSocketHooks';
import { useChatHistory, useReceiveNewMessage } from '@/app/hooks/useChatSocketHooks';

const DashboardPage = () => {
  const { data: userData } = useSession();
  const { data: users = [], isLoading: loadingUsers } = useActiveUsersData();
  const { data: messages = [], isLoading: loadingMessages } = useChatHistory();

  useReceiveNewMessage(); // Handle receiving new messages, no need to return data

  const messagerLoading = loadingUsers || loadingMessages;

  const filterUsers = users?.filter((user: { email: string }) => user.email !== userData?.user?.email);
  const groupName = 'Global Main Room';


  return (
    <>
      {messagerLoading ? (
        <LoadingOverlay />
      ) : (
        <ChatMessagerSection
          users={filterUsers}
          groupName={groupName}
          messages={messages}
          isUserChatRoom={false}
        />
      )}
    </>
  );
}

export default DashboardPage;
