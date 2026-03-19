import { Card } from '@/components/ui/card';

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-black text-brown mb-8">
        Help Center
      </h1>
      <Card className="p-8">
        <p className="text-lg text-brown/80">This page is currently under construction. Please check back later for updates regarding our help.</p>
      </Card>
    </div>
  );
}