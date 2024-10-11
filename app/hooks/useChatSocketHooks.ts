import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] });

// Hook to fetch chat history
export const useChatHistory = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.emit('chat_history');

    socket.on('chat_history_response', (history: any[]) => {
      queryClient.setQueryData(['chatHistory'], history);
    });

    return () => {
      socket.off('chat_history_response');
    };
  }, [queryClient]);

  return useQuery<any[]>({
    queryKey: ['chatHistory'],
    queryFn: () => {
      const data = queryClient.getQueryData(['chatHistory']);
      return data || []; // Return an empty array if no data is found
    },
    staleTime: Infinity,
  });
};


// Hook to receive new messages
export const useReceiveNewMessage = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('receive_new_message', (newMessage: any) => {
      queryClient.setQueryData(['chatHistory'], newMessage);
    });

    return () => {
      socket.off('receive_new_message');
    };
  }, [queryClient]);

  return useQuery<any[]>({
    queryKey: ['chatHistory'],
    queryFn: () => {
      const data = queryClient.getQueryData(['chatHistory']);
      return data || []; // Return an empty array if no data is found
    },
    staleTime: Infinity,
  });
};