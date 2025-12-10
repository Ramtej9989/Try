import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ThreatLevelDistribution {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface ThreatSummaryProps {
  threatIntelData?: {
    total: number;
    distribution: ThreatLevelDistribution;
  };
  isLoading?: boolean;
}

const ThreatSummary: React.FC<ThreatSummaryProps> = ({ threatIntelData, isLoading = false }) => {
  const [chartData, setChartData] = useState({
    labels: ['Critical (9-10)', 'High (7-8)', 'Medium (4-6)', 'Low (1-3)'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(220, 53, 69, 0.8)',  // Red for Critical
        'rgba(255, 128, 0, 0.8)',  // Orange for High
        'rgba(255, 193, 7, 0.8)',  // Yellow for Medium
        'rgba(40, 167, 69, 0.8)'   // Green for Low
      ],
      borderColor: [
        'rgba(220, 53, 69, 1)',
        'rgba(255, 128, 0, 1)',
        'rgba(255, 193, 7, 1)',
        'rgba(40, 167, 69, 1)'
      ],
      borderWidth: 1
    }]
  });

  // Update chart data when threat intel data changes
  useEffect(() => {
    if (threatIntelData) {
      const { distribution } = threatIntelData;
      setChartData({
        ...chartData,
        datasets: [{
          ...chartData.datasets[0],
          data: [distribution.critical, distribution.high, distribution.medium, distribution.low]
        }]
      });
    }
  }, [threatIntelData]);

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          padding: 15
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '65%'
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Threat Intelligence Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
          </div>
        ) : !threatIntelData ? (
          <div className="flex h-64 items-center justify-center text-gray-500">
            <p>No threat intelligence data available</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="relative h-64 w-64">
              <Doughnut data={chartData} options={options} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-3xl font-bold">{threatIntelData.total}</div>
                <div className="text-sm text-gray-500">Total Indicators</div>
              </div>
            </div>
            
            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="text-sm">
                  <span className="font-medium">{threatIntelData.distribution.critical}</span> Critical
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                <div className="text-sm">
                  <span className="font-medium">{threatIntelData.distribution.high}</span> High
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="text-sm">
                  <span className="font-medium">{threatIntelData.distribution.medium}</span> Medium
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <div className="text-sm">
                  <span className="font-medium">{threatIntelData.distribution.low}</span> Low
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t pt-4 text-center text-sm text-gray-500">
        Based on threat intelligence from 50 sources
      </CardFooter>
    </Card>
  );
};

export default ThreatSummary;
