import React, { ReactNode } from 'react';
import { getServerSession } from 'next-auth';
import { GET } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';
import MainLayout from '../components/dashboard/MainLayout';

interface Props {
  children: ReactNode
}

interface Session {
  user: {} | null;
}

export default async function PrivateRoute({ children }: Props) {
  const session: Session | null = await getServerSession(GET);

  if (!session?.user) {
    redirect('/register')
  }

  return (
    <>
      <MainLayout>
        {children}
      </MainLayout>
    </>
  )

}