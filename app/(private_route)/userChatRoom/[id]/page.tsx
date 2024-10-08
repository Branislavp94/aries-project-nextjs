'use client'

import ChatMessagerSection from '@/app/components/dashboard/ChatMessagerSection'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL

const page = () => {
  const params = useParams();
  const groupId = params.id;

  const [chatRoom, setChatRoom] = useState([]);

  useEffect(() => {
    if (groupId) {
      socket.emit('get_chat_room_details', { id: groupId })

      socket.on('get_chat_room_details_response', (data) => {
        if (data) {
          setChatRoom(data)
        }
      })
    }

    return () => {
      socket.off('get_chat_room_details');
      socket.off('get_chat_room_details_response');
    }

  }, [groupId])

  return (
    <ChatMessagerSection users={chatRoom.Users} groupName={chatRoom.name} messages={chatRoom.Messages} />
  )
}

export default page