'use client'
import { useSession } from 'next-auth/react'
import React from 'react'

const DashboardPage = () => {
  const { data: session } = useSession();

  return (
    <div>Dashboard</div>
  )
}

export default DashboardPage