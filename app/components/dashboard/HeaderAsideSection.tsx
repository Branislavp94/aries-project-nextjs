import React from 'react'
import InfoSection from './InfoSection'
import ActivChatSection from './ActivChatSection'

const HeaderAsideSection = () => {
  return (
    <>
      <div className="flex flex-col py-8 p-3 w-auto bg-white flex-shrink-0">
        <InfoSection />
        <ActivChatSection />
      </div>
    </>
  )
}

export default HeaderAsideSection