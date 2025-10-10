import { useTranslation } from 'react-i18next';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from 'lucide-react';
import { BottomNavigation } from '@/components/layout/BottomNavigation';

export function MenuPage() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();

  const menuItems = [
    {
      icon: Info,
      label: 'About Us',
      path: '/about-pgt'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 pb-20">
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Menu</h1>
          <p className="text-gray-600">Access key features and settings</p>
        </div>

        <div className="space-y-4">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <Button
                    variant="ghost"
                    className="w-full h-16 flex items-center justify-start px-6 py-4 text-left"
                    onClick={() => navigate(item.path)}
                  >
                    <IconComponent className="h-6 w-6 mr-4 text-emerald-600" />
                    <span className="text-lg font-medium text-gray-900">{item.label}</span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}