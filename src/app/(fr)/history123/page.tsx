import type { Metadata } from 'next';
import AdminHistory from '@/components/AdminHistory';

export const metadata: Metadata = {
  title: 'Historique des soumissions',
  robots: { index: false, follow: false },
};

const Page = () => <AdminHistory />;

export default Page;
