import React from 'react';
import { Link } from 'wouter';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export default function Dashboard() {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <UnifiedHeader title="Keys to Paradise" />
      
      <main className="flex-1 container max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Welcome to Keys to Paradise</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Link href="/goals" className="flex items-center justify-center gap-2 px-4 py-6 border rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-center">
            <span className="material-icons">track_changes</span>
            <span className="font-medium">Set Spiritual Goals</span>
          </Link>
          
          <Link href="/content" className="flex items-center justify-center gap-2 px-4 py-6 border rounded-md bg-primary/10 hover:bg-primary/20 transition-colors text-center">
            <span className="material-icons">menu_book</span>
            <span className="font-medium">Browse Content</span>
          </Link>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}