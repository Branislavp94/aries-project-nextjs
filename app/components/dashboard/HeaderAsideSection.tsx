import React from 'react'
import InfoSection from './InfoSection'
import ActivChatSection from './ActivChatSection'

const HeaderAsideSection = () => {
  return (
    <>
      <div className="flex flex-col py-8 pl-6 pr-2 w-64 bg-white flex-shrink-0">
        <InfoSection />
        <ActivChatSection />
      </div>
    </>
  )
}

export default HeaderAsideSection