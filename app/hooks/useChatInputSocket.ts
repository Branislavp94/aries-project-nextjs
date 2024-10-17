// useChatSocket.ts
import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useSession } from 'next-auth/react';

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] }); // Update with your server URL

// Main hook for chat functionality
export const useChatSocket = (messages: Array<{ UserId: string, content: string, User: { email: string } }>) => {
  const { data: userData } = useSession();
  const [message, setMessage] = useState('');
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploadImageLoading, setUploadImageLoading] = useState(false);

  const isTheSameUser = (id: string | null | undefined) => id === userData?.user?.id;

  useEffect(() => {
    // Listen for typing events
    socket.on('user_typing', () => {
      setIsTyping(true);
    });

    socket.on('user_stopped_typing', () => {
      setIsTyping(false);
    });

    return () => {
      socket.off('user_typing');
      socket.off('user_stopped_typing');
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current || isTyping) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [messages, isTyping]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() !== '') {
      socket.emit('send_messages', {
        content: message,
        socketId: socket.id,
        userId: userData?.user?.id as string,
      });
      setMessage('');
      setTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);
    setTyping(e.target.value !== '');
    socket.emit(e.target.value === '' ? 'stop_typing' : 'typing');
  };

  const handleImageUpload = async (file: any) => {
    if (file) {
      setUploadImageLoading(true);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/user/general/supabase/file/upload`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const { url } = await response.json();

        if (url) {
          socket.emit('send_messages', {
            content: url, // Use the public URL for the message
            socketId: socket.id,
            userId: userData?.user?.id as string,
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      } finally {
        setUploadImageLoading(false);
      }
    }
  };

  const handleSelectGif = (imageUrl: string) => {
    if (imageUrl) {
      socket.emit('send_messages', {
        content: imageUrl,
        socketId: socket.id,
        userId: userData?.user?.id as string,
      });
    }
  };


  const handleSelectEmoticon = (emoticon: string) => {
    setMessage((prevMessage) => prevMessage + emoticon); // Update the local message state

    if (emoticon) {
      socket.emit('send_messages', {
        content: emoticon,
        socketId: socket.id,
        userId: userData?.user?.id as string,
      });
    }
  };


  return {
    message,
    setMessage,
    typing,
    isTyping,
    uploadImageLoading,
    messagesEndRef,
    sendMessage,
    handleTyping,
    handleImageUpload,
    handleSelectGif,
    handleSelectEmoticon, // Expose the new function
    isTheSameUser,
  };
};
