import React from 'react'

const MainLayout = ({ children }: { children: React.ReactNode }): React.ReactNode => {
  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
      {children}
      </div>
    </div>
  )
}

export default MainLayout