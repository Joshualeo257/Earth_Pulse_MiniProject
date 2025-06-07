import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LoaderCircle, AlertTriangle } from "lucide-react";

// --- TypeScript Type for a sensor reading ---
type Reading = {
  timestamp: string;
  readings: {
    soilMoisture: number;
  };
};

// --- TODO: Replace this with an actual sensor ID from your database ---
const SENSOR_ID_FOR_DASHBOARD = "684303b406e7606c83a1330f"; // PASTE THE ID YOU COPIED HERE

const SoilMoistureChart: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    if (SENSOR_ID_FOR_DASHBOARD === "YOUR_SENSOR_ID_HERE") {
        setError("Please update the SENSOR_ID_FOR_DASHBOARD in the code.");
        setLoading(false);
        return;
    }

    const fetchMoistureData = async () => {
      try {
        // Fetch the last 24 readings (assuming 1 per hour for a day)
        const response = await fetch(`/api/sensors/${SENSOR_ID_FOR_DASHBOARD}/readings?limit=24&sort=asc`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          // Format data for the chart
          const formattedData = result.data.map((reading: Reading) => ({
            // Format timestamp to just show the time (e.g., "14:00")
            time: new Date(reading.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            moisture: reading.readings.soilMoisture,
          }));
          setData(formattedData);
        } else {
          throw new Error(result.message || "Failed to fetch sensor data.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMoistureData();
  }, []);

  const renderChart = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-48"><LoaderCircle className="animate-spin h-6 w-6 text-irrigation-green" /></div>;
    }
    if (error) {
      return <div className="flex items-center text-red-600 p-4 h-48"><AlertTriangle className="h-5 w-5 mr-2" /> {error}</div>;
    }
    if (data.length === 0) {
      return <div className="flex items-center justify-center text-gray-500 h-48">No moisture data available for this sensor.</div>;
    }
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis fontSize={12} tickLine={false} axisLine={false} unit="%" />
          <Tooltip 
            contentStyle={{ backgroundColor: 'white', border: '1px solid #ccc' }} 
            labelStyle={{ fontWeight: 'bold' }}
            formatter={(value) => [`${value}%`, 'Moisture']}
          />
          <Line 
            type="monotone" 
            dataKey="moisture" 
            stroke="#3b82f6" // Using a blue color
            strokeWidth={2}
            dot={{ r: 4, fill: '#3b82f6' }}
            activeDot={{ r: 6, stroke: '#1d4ed8' }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Soil Moisture (%)</CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default SoilMoistureChart;