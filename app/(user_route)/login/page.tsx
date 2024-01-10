import LoginUser from '@/app/components/LoginUser'
import { AuthErrorContextProvider } from '@/app/context/ErrorMessageFormContext'
import React from 'react'

const page = () => {
  return (
    <AuthErrorContextProvider>
      <LoginUser />
    </AuthErrorContextProvider>
  )
}

export default page