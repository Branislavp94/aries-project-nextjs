"use client"
import React, { useEffect, useState } from 'react'
import { io } from 'socket.io-client';
import LoadingIndicator from '../LoadingIndicator';
const socket = io('http://localhost:5000', { transports: ['websocket'] }); // Update with your server URL


const ActivChatSection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on('active_users', (users) => {
      setLoading(false)
      setUsers(users);
    });

    socket.emit('users');
  }, []);

  return (
    <div className="flex flex-col mt-8">
      <div className="flex flex-row items-center justify-between text-xs">
        <span className="font-bold">All Users</span>
        <span className="flex items-center justify-center bg-gray-300 h-4 w-4 rounded-full">{users.length}</span>
      </div>
      <div className="flex flex-col space-y-1 mt-4 -mx-2 h-48 overflow-y-auto">
        {loading ?
          <div className="m-auto">
            <LoadingIndicator />
          </div> :
          <>
            {users.map((user: { email: string, id: number }) => (
              <>
                <div key={user.id}>
                  <button className="flex flex-row items-center hover:bg-gray-100 rounded-xl p-2">
                    <div className="flex items-center justify-center h-8 w-8 bg-indigo-200 rounded-full">
                      H
                    </div>
                    <div className="ml-2 text-sm font-semibold">{user?.email?.split('@')[0]}</div>
                  </button>
                </div>
              </>
            ))}
          </>}
      </div>
    </div>
  )
}

export default ActivChatSection