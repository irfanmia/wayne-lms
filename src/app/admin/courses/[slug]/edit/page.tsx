'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    // Always start with settings tab (especially important for new courses)
    router.replace(`/admin/courses/${params.slug}/edit/settings`);
  }, [router, params.slug]);
  return null;
}
