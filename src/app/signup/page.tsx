import { Suspense } from 'react';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Suspense fallback={<div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
