import React from 'react'
import InfoSection from './InfoSection'
import ActivChatSection from './ActivChatSection'

const HeaderAsideSection = ({ users }) => {
  return (
    <>
      <div className="flex flex-col py-8 p-3 w-96 bg-white flex-shrink-0">
        <InfoSection />
        <ActivChatSection users={users} />
      </div>
    </>
  )
}

export default HeaderAsideSection