/**
 * Settings Page Header
 * Header reutilizable para las páginas del panel de settings
 */

'use client';

import { 
  Users, 
  Shield, 
  Code, 
  History, 
  Play, 
  Eye,
  LucideIcon
} from 'lucide-react';

interface SettingsPageHeaderProps {
  title: string;
  description: string;
  icon: 'users' | 'shield' | 'code' | 'history' | 'play' | 'eye';
  actions?: React.ReactNode;
}

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  shield: Shield,
  code: Code,
  history: History,
  play: Play,
  eye: Eye
};

export function SettingsPageHeader({ 
  title, 
  description, 
  icon, 
  actions 
}: SettingsPageHeaderProps) {
  const Icon = iconMap[icon];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {title}
            </h1>
            <p className="text-gray-600 mt-1">
              {description}
            </p>
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}