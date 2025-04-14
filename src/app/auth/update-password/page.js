// app/auth/update-password/page.tsx
import { Suspense } from 'react';
import UpdatePassword from '@/components/UpdatePassword';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <UpdatePassword />
    </Suspense>
  );
}
