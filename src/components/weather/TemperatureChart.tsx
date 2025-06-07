// src/components/weather/TemperatureChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TempChartProps {
  data: { time: string; temp: number }[];
}

export const TemperatureChart: React.FC<TempChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">24-Hour Temperature Forecast (°C)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis fontSize={12} unit="°" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(5px)', borderRadius: '0.5rem', border: '1px solid #e0e0e0' }}
              labelStyle={{ fontWeight: 'bold' }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="temp"
              name="Temperature"
              stroke="#ff7300" 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};