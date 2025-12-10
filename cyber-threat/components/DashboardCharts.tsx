'use client';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';

const sampleData = [
  { name: 'Mon', alerts: 12, resolved: 8 },
  { name: 'Tue', alerts: 18, resolved: 12 },
  { name: 'Wed', alerts: 9, resolved: 7 },
  { name: 'Thu', alerts: 15, resolved: 10 },
  { name: 'Fri', alerts: 20, resolved: 15 },
  { name: 'Sat', alerts: 7, resolved: 5 },
  { name: 'Sun', alerts: 10, resolved: 8 },
];

export default function DashboardCharts({ data = sampleData }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Alerts Over Time (Line Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="alerts" stroke="#8884d8" name="Alerts" />
            <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Alerts vs Resolved (Bar Chart)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="alerts" fill="#8884d8" name="Alerts" />
            <Bar dataKey="resolved" fill="#82ca9d" name="Resolved" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}