import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  color?: 'default' | 'blue' | 'green' | 'yellow' | 'red';
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  color = 'default'
}) => {
  const colorClasses = {
    default: 'bg-white',
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    red: 'bg-red-50 border-red-200'
  };

  return (
    <Card className={`${colorClasses[color]} shadow-sm`}>
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
          {icon && <div className="text-gray-400">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        
        {(description || trend) && (
          <div className="mt-1 flex items-center text-sm">
            {trend && (
              <span className={`mr-2 flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? (
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                )}
                {Math.abs(trend.value)}% {trend.label}
              </span>
            )}
            {description && <span className="text-gray-500">{description}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SummaryCard;
