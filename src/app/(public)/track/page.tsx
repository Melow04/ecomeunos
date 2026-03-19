'use client'

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function TrackPage() {
  const [orderId, setOrderId] = useState('');
  const [tracking, setTracking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (orderId.trim()) setTracking(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-brown mb-8">
        Track Order
      </h1>
      <Card className="p-8">
        <form onSubmit={handleTrack} className="flex gap-4 mb-8">
          <Input 
            placeholder="Enter Order ID..." 
            value={orderId} 
            onChange={(e) => setOrderId(e.target.value)} 
            className="flex-1"
          />
          <Button type="submit" disabled={!orderId.trim()}>Track</Button>
        </form>

        {tracking && (
          <div className="space-y-6">
            <h3 className="text-xl font-bold">Tracking Status for #{orderId}</h3>
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-black/10 z-0"></div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-green-500 border-4 border-white"></div>
                <div>
                  <p className="font-semibold">Order Placed</p>
                  <p className="text-sm text-black/60">Your order has been received.</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-green-500 border-4 border-white"></div>
                <div>
                  <p className="font-semibold">Processing</p>
                  <p className="text-sm text-black/60">We are preparing your items.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-blue-500 border-4 border-white"></div>
                <div>
                  <p className="font-semibold">Shipped</p>
                  <p className="text-sm text-black/60">Your order is on the way!</p>
                </div>
              </div>

              <div className="flex items-center gap-4 relative z-10">
                <div className="w-6 h-6 rounded-full bg-black/20 border-4 border-white"></div>
                <div>
                  <p className="font-semibold text-black/40">Delivered</p>
                  <p className="text-sm text-black/40">Estimated delivery: Tomorrow</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}