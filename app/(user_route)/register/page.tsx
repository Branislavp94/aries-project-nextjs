import RegisterUser from '@/app/components/RegisterUser'
import { AuthErrorContextProvider } from '@/app/context/ErrorMessageFormContext'
import React from 'react'

const page = () => {
  return (
    <AuthErrorContextProvider>
      <RegisterUser />
    </AuthErrorContextProvider>
  )
}

export default page