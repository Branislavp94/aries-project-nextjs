'use client'
import React from 'react'
import LogoImage from '@/public/images/413031207_6745980488864413_7674386761553248927_n.jpg'
import Image from 'next/image'
import AriesImage from '@/public/images/SvgHeart.Com-445.png'
import { useSession } from "next-auth/react"
import HeaderAccount from '../HeaderAccount'

const InfoSection = () => {
  const { data: session } = useSession();

  return (
    <>
      <div className="flex flex-row items-center justify-center h-12 w-full">
        <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white gap-2">
          <div className="ml-2 font-bold text-2xl text-black">Aries Power</div>
          <Image
            src={AriesImage}
            width={40}
            height={40}
            alt={'Image'}
            objectFit={'contain'}
          />
        </div>
      </div>
      <HeaderAccount />
    </>
  )
}

export default InfoSection