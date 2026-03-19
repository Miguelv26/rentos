"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-black italic text-white mb-4">
          RENT<span className="text-[#00E5FF]">OS</span>
        </h1>
        <p className="text-gray-500">Cargando...</p>
      </div>
    </div>
  );
}
