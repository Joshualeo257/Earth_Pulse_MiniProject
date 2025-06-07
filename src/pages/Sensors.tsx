
import React from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Thermometer, Droplet, Wind, Gauge } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Sample sensor data
const moistureData = [
  { time: '00:00', value: 35 },
  { time: '04:00', value: 32 },
  { time: '08:00', value: 28 },
  { time: '12:00', value: 25 },
  { time: '16:00', value: 30 },
  { time: '20:00', value: 34 },
  { time: '24:00', value: 37 },
];

const temperatureData = [
  { time: '00:00', value: 68 },
  { time: '04:00', value: 65 },
  { time: '08:00', value: 72 },
  { time: '12:00', value: 78 },
  { time: '16:00', value: 76 },
  { time: '20:00', value: 70 },
  { time: '24:00', value: 67 },
];

const SensorCard = ({ title, value, unit, icon, color }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-baseline">
            <h2 className="text-3xl font-bold">{value}</h2>
            <span className="ml-1 text-gray-500">{unit}</span>
          </div>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const SensorChart = ({ title, data, color }) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

const Sensors = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 hidden md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800">Sensors</h1>
              <p className="text-gray-600">Real-time sensor data from your field</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <SensorCard 
                title="Soil Moisture" 
                value="32" 
                unit="%" 
                icon={<Droplet className="h-6 w-6 text-irrigation-blue" />}
                color="blue"
              />
              <SensorCard 
                title="Temperature" 
                value="72" 
                unit="°F" 
                icon={<Thermometer className="h-6 w-6 text-irrigation-green" />}
                color="green"
              />
              <SensorCard 
                title="Humidity" 
                value="45" 
                unit="%" 
                icon={<Droplet className="h-6 w-6 text-irrigation-blue" />}
                color="blue"
              />
              <SensorCard 
                title="Pressure" 
                value="1013" 
                unit="hPa" 
                icon={<Gauge className="h-6 w-6 text-irrigation-earth" />}
                color="amber"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SensorChart title="Soil Moisture History (24h)" data={moistureData} color="#4CAF50" />
              <SensorChart title="Temperature History (24h)" data={temperatureData} color="#2196F3" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sensors;
