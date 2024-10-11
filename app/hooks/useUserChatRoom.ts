import { useEffect } from 'react';
import { useQuery, useQueryClient, UseQueryResult } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] });

// Define the chat room data type
export type ChatRoomData = {
  name: string;
  Users: Array<unknown>; // Replace 'unknown' with the actual user type if available
};

// Hook to create a new user
export const useChatRoom = (groupId: { groupId: string }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (groupId) {
      socket.emit('get_chat_room_details', { id: groupId });

      socket.on('get_chat_room_details_response', (data) => {
        if (data) {
          queryClient.setQueryData(['chat_room_new_added_users'], data);
        }
      });
    }

    return () => {
      socket.off('get_chat_room_details');
      socket.off('get_chat_room_details_response');
    };
  }, [groupId, queryClient]);

  return useQuery<any[]>({
    queryKey: ['chat_room_new_added_users'],
    queryFn: () => {
      const data = queryClient.getQueryData(['chat_room_new_added_users']);
      return data || []; // Return an empty array if no data is found
    },
    staleTime: Infinity,
  });
};
