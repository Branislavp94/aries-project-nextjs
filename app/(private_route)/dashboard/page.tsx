import ChatMessagerSection from '@/app/components/dashboard/ChatMessagerSection';
import HeaderAsideSection from '@/app/components/dashboard/HeaderAsideSection';
import MainLayout from '@/app/components/dashboard/MainLayout';
import React from 'react'


const DashboardPage = () => {
  return (
    <MainLayout>
      <HeaderAsideSection />
      <ChatMessagerSection />
    </MainLayout>
  )
}

export default DashboardPage