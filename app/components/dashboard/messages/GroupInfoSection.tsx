import React, { useEffect, useRef, useState } from 'react';
import { FaVideo, FaInfoCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';

type Props = {
  groupName: string;
  users: Array<{ id: number; email: string }>;
};

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] }); // Update with your server URL

const GroupInfoSection = ({ groupName, users }: Props) => {
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex justify-between items-center bg-white p-4 mb-4 rounded-xl shadow-md">
        <div className="flex flex-col space-y-1">
          <span className="text-lg font-semibold text-gray-800">{groupName}</span>
          <span className="text-sm text-gray-500">{users?.length} Members</span>
        </div>
        <div className="flex space-x-4">
          <FaVideo
            size={25}
            className="text-indigo-500 cursor-pointer hover:text-indigo-700 transition-transform transform hover:scale-105"
          />
          <FaInfoCircle size={25} className="text-indigo-500 cursor-pointer hover:text-indigo-700 transition-transform transform hover:scale-105" />
        </div>
      </div>

      {/* Video Call Section */}
      <div className="flex space-x-4">
        {/* Local Video */}
        <video muted style={{ width: '300px', height: 'auto' }} />

        {/* Remote Video */}
        <video style={{ width: '300px', height: 'auto' }} />
      </div>
    </div>
  );
};

export default GroupInfoSection;
