import { useEffect } from 'react';
import { useQuery, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useRouter } from 'next/navigation';

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] });

// Hook to manage active users data
export const useActiveUsersData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.emit('users');

    socket.on('active_users', (users: any[]) => {
      queryClient.setQueryData(['users'], users);
    });

    return () => {
      socket.off('active_users');
    };
  }, [queryClient]);

  return useQuery<any[]>({
    queryKey: ['users'],
    queryFn: () => {
      const data = queryClient.getQueryData(['users']);
      return data || []; // Return an empty array if no data is found
    },
    staleTime: Infinity,
  });
};

// Hook to create a new user
export const useCreateNewUser = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.emit('createNewUser');

    socket.on('new_added_users', (users: any[]) => {
      queryClient.setQueryData(['users'], users);
    });

    return () => {
      socket.off('new_added_users');
    };
  }, [queryClient]);

  return useQuery<any[]>({
    queryKey: ['users'],
    queryFn: () => {
      const data = queryClient.getQueryData(['users']);
      return data || []; // Return an empty array if no data is found
    },
    staleTime: Infinity,
  });
};

// Hook to fetch all users after creating a new conversation
export const useAllUsersAfterNewConversation = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('all_users_response_after_creating_new_conversation', (users: any[]) => {
      queryClient.setQueryData(['users'], users);
    });

    return () => {
      socket.off('all_users_response_after_creating_new_conversation');
    };
  }, [queryClient]);

  return useQuery<any[]>({
    queryKey: ['users'],
    queryFn: () => {
      const data = queryClient.getQueryData(['users']);
      return data || []; // Return an empty array if no data is found
    },
    staleTime: Infinity,
  });
};

// Hook to deactivate user data
export const useDeactivateUserData = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on('set_user_data_after_deactivate', (users: any[]) => {
      queryClient.setQueryData(['users'], users);
    });

    return () => {
      socket.off('set_user_data_after_deactivate');
    };
  }, [queryClient]);

  return useQuery<any[]>({
    queryKey: ['users'],
    queryFn: () => {
      const data = queryClient.getQueryData(['users']);
      return data || []; // Return an empty array if no data is found
    },
    staleTime: Infinity,
  });
};


