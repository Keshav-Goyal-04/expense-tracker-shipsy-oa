import { Suspense } from 'react';
import ExpenseTracker from '@/components/ExpenseTracker';

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExpenseTracker />
    </Suspense>
  );
}