// src/components/weather/HumidityChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface HumidityChartProps {
  data: { time: string; humidity: number }[];
}

export const HumidityChart: React.FC<HumidityChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">24-Hour Humidity Forecast (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <defs>
              <linearGradient id="colorHumidity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis fontSize={12} unit="%" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem', border: '1px solid #e0e0e0' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey="humidity"
              name="Humidity"
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorHumidity)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};