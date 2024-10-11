'use client'

import UserChatMessagerSection from '@/app/components/dashboard/UserChatMessagerSection';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { useChatRoom } from '@/app/hooks/useUserChatRoom';
import { useParams } from 'next/navigation';
import React from 'react';

const Page = () => {
  const params = useParams();
  const groupId = params.id as string;

  const { data: chatRoom, isLoading, error } = useChatRoom(groupId);

  if (isLoading) return <LoadingOverlay />;
  if (error) return <div>Error loading chat room</div>;


  return (
    <UserChatMessagerSection
      users={chatRoom?.Users || []}
      groupName={chatRoom?.name || 'Unknown'}
      groupId={groupId}
    />
  );
};

export default Page;
