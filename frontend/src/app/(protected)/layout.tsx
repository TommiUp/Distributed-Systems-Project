import { ReactNode } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Read the `access_token` cookie that Login page set
  const cookieStore = cookies();
  const jwtCookie = (await cookieStore).get('access_token');

  if (!jwtCookie) {
    // Not logged in → redirect to /login
    redirect('/login');
  }

  // Otherwise, show children (e.g. Channels page, Chat page)
  return <>{children}</>;
}
