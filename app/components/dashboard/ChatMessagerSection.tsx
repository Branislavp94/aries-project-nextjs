// ChatMessagerSection.tsx
'use client';
import React from 'react';
import LoadingOverlay from '../LoadingOverlay';
import GroupInfoSection from './messages/GroupInfoSection';
import { useChatSocket } from '@/app/hooks/useChatInputSocket';
import ChatInputForm from '../forms/ChatInputForm';

type Props = {
  groupName: string;
  users: Array<{}>;
  messages: Array<{ UserId: string; content: string; User: { email: string } }>;
};

const ChatMessagerSection = ({ groupName, users, messages }: Props) => {
  const {
    message,
    isTyping,
    uploadImageLoading,
    messagesEndRef,
    sendMessage,
    handleTyping,
    handleImageUpload,
    handleSelectGif,
    isTheSameUser,
    handleSelectEmoticon,
  } = useChatSocket(messages);

  return (
    <div className="flex flex-col flex-auto h-full p-6">
      <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
        {/* <GroupInfoSection groupName={groupName} users={users} /> */}
        <div className="flex flex-col h-full overflow-x-auto mb-4">
          <div className="flex flex-col h-full">
            {uploadImageLoading ? (
              <LoadingOverlay />
            ) : (
              <div className="grid grid-cols-12 gap-y-2">
                {messages.map((messageObj, index) => {
                  const { UserId, content } = messageObj;
                  const isLink = content.includes('giphy.com') || content.includes('supabase.co');

                  return (
                    <div
                      key={index}
                      className={
                        isTheSameUser(UserId)
                          ? 'col-start-1 col-end-8 p-3 rounded-lg'
                          : 'col-start-6 col-end-13 p-3 rounded-lg'
                      }
                    >
                      <div className="flex flex-col">
                        <span
                          className={
                            isTheSameUser(UserId)
                              ? 'flex p-1 ml-12 text-slate-500'
                              : 'flex p-1 justify-end mr-12 '
                          }
                        >
                          {messageObj.User?.email?.split('@')[0]}
                        </span>
                        <div
                          className={
                            isTheSameUser(UserId)
                              ? 'flex flex-row items-center'
                              : 'flex items-center justify-start flex-row-reverse'
                          }
                        >
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
                            {isTheSameUser(UserId) ? 'A' : 'B'}
                          </div>
                          {isLink ? (
                            <div
                              className={
                                isTheSameUser(UserId)
                                  ? 'relative ml-3 text-md bg-white py-2 px-4 shadow rounded-xl'
                                  : 'relative mr-3 text-md bg-indigo-100 py-2 px-4 shadow rounded-xl'
                              }
                            >
                              <img src={content} alt="Link Image" width={400} height={400} />
                            </div>
                          ) : (
                            <div
                              className={
                                isTheSameUser(UserId)
                                  ? 'relative ml-3 text-md bg-white py-2 px-4 shadow rounded-xl'
                                  : 'relative mr-3 text-md bg-indigo-100 py-2 px-4 shadow rounded-xl'
                              }
                            >
                              {content}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {isTyping && (
              <div className="flex p-4 items-center justify-center">
                <span className="text-gray-500 text-sm">Someone is typing</span>
                <div className="dot-flashing ml-2"></div>
                <div className="dot-flashing ml-2"></div>
                <div className="dot-flashing ml-2"></div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>
        </div>

        {/* @ts-ignore */}
        <ChatInputForm
          message={message}
          handleTyping={handleTyping}
          sendMessage={sendMessage}
          handleImageUpload={handleImageUpload}
          handleSelectGif={handleSelectGif}
          handleSelectEmoticon={handleSelectEmoticon}
        />
      </div>
    </div>
  );
};

export default ChatMessagerSection;
