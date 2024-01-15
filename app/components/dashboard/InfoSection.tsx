import React from 'react'
import Image from 'next/image'
import AriesImage from '@/public/images/SvgHeart.Com-445.png'
import HeaderAccount from '../HeaderAccount'

const InfoSection = () => {
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
          />
        </div>
      </div>
      <HeaderAccount />
    </>
  )
}

export default InfoSection