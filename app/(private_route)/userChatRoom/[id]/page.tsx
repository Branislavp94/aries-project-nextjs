'use client'

import UserChatMessagerSection from '@/app/components/dashboard/UserChatMessagerSection';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const Page = () => {
  const params = useParams();
  const groupId = params.id as string;

  // Initialize chatRoom as a single object
  const [chatRoom, setChatRoom] = useState<{ name: string, Users: Array<{}> } | null>(null);

  useEffect(() => {
    if (groupId) {
      socket.emit('get_chat_room_details', { id: groupId });

      socket.on('get_chat_room_details_response', (data) => {
        if (data) {
          setChatRoom(data); // Expecting data to be a single chat room object
        }
      });
    }

    return () => {
      socket.off('get_chat_room_details');
      socket.off('get_chat_room_details_response');
    };
  }, [groupId]);

  return (
    <>
      {!chatRoom ? (
        <LoadingOverlay />
      ) : (
        <UserChatMessagerSection
          users={chatRoom.Users}
          groupName={chatRoom.name}
          groupId={groupId}
        />
      )}
    </>
  );
};

export default Page;
