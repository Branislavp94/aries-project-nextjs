import React from 'react'
import ChatMessagerSection from '@/app/components/dashboard/ChatMessagerSection';
import HeaderAsideSection from '@/app/components/dashboard/HeaderAsideSection';
import MainLayout from '@/app/components/dashboard/MainLayout';

const DashboardPage = () => {
  return (
    <MainLayout>
      <HeaderAsideSection />
      <ChatMessagerSection />
    </MainLayout>
  )
}

export default DashboardPage