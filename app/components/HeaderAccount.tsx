'use client'
import Image from 'next/image'
import React, { useState } from 'react'
import { signOut, useSession } from "next-auth/react"
import LogoImage from '@/public/images/413031207_6745980488864413_7674386761553248927_n.jpg'
import Link from 'next/link'
import SettingsSvg from '@/public/settings-icon.svg';
import LogOutSvg from '@/public/logout.svg'
import LoadingIndicator from './LoadingIndicator'
import { io } from 'socket.io-client';

const socket = io(process.env.BACKEND_URL as string, { transports: ['websocket'] }); // Update with your server URL

const HeaderAccount = () => {
  const { data, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleUserLogOut = () => {
    socket.emit('set_user_status_to_deactive', { email: data?.user?.email })
    signOut();
  }

  return (
    <div onClick={toggleDropdown} className="border-b-4 border-transparent">
      <div className="flex flex-col items-center bg-gray-100 border border-gray-200 p-5 rounded-lg">
        <div className="relative h-20 w-20 rounded-full border overflow-hidden cursor-pointer">
          <Image
            src={LogoImage}
            width={80}
            height={100}
            alt={'Image'}
          />
        </div>
        <div className="text-sm font-semibold mt-2">{status === 'loading' ? <LoadingIndicator /> : data?.user?.email}</div>
      </div>
      {isOpen && (
        <div className="absolute  mt-[-40px] ml-[18px]  z-50 w-56 px-5 py-3 dark:bg-gray-800 bg-white rounded-lg shadow border dark:border-transparent">
          <ul className="space-y-3 dark:text-white">
            <li className="font-medium">
              <Link
                // @ts-ignore
                href={`/dashboard/settings/${data?.user?.id}/profile`}
                className="flex items-center transform transition-colors duration-200 border-r-4 border-transparent hover:border-blue-600"
              >
                <div className="mr-3 text-blue-600">
                  <Image src={SettingsSvg} alt={""} />
                </div>
                Settings
              </Link>
            </li>
            <hr className="dark:border-gray-700" />
            <li className="font-medium">
              <Link
                onClick={handleUserLogOut}
                className="flex items-center transform transition-colors duration-200 border-r-4 border-transparent hover:border-red-600"
                href='#'
              >
                <div className="mr-3 text-red-600">
                  <Image src={LogOutSvg} alt={""} />
                </div>
                Logout
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

export default HeaderAccount