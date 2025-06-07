// src/pages/Weather.tsx

import React, { useState, useEffect } from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, AlertTriangle, Wind, Droplets } from "lucide-react";
import { TemperatureChart } from "@/components/weather/TemperatureChart";
import { HumidityChart } from "@/components/weather/HumidityChart";

// Helper to get the OpenWeatherMap icon URL
const getWeatherIconUrl = (iconCode: string) => `https://openweathermap.org/img/wn/${iconCode}@4x.png`;

// --- Updated TypeScript type to match our full API response ---
type WeatherData = {
  location: { name: string };
  current: {
    temperature: number;
    condition_desc: string;
    icon: string;
    humidity: number;
    windSpeed: number;
  };
  daily: {
    timestamp: string;
    temperature: { min: number; max: number };
    icon: string;
  }[];
  hourly: {
    time: string;
    temp: number;
    humidity: number;
  }[];
};

const Weather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/weather/bangalore");
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setWeather(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch weather data.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const getDayOfWeek = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });

  // Main content renderer
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-96">
          <LoaderCircle className="animate-spin h-12 w-12 text-irrigation-green" />
        </div>
      );
    }
    
    if (error || !weather) {
      return (
        <div className="flex flex-col justify-center items-center h-96 bg-red-50 text-red-700 rounded-lg">
          <AlertTriangle className="h-12 w-12 mb-4" />
          <p className="text-xl font-semibold">Error Loading Weather Data</p>
          <p>{error || "An unknown error occurred."}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* --- Top Current Weather Section --- */}
        <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center">
              <img src={getWeatherIconUrl(weather.current.icon)} alt={weather.current.condition_desc} className="w-24 h-24 -my-2" />
              <div>
                <p className="text-5xl font-bold">{Math.round(weather.current.temperature)}°C</p>
                <p className="text-lg text-gray-600 capitalize">{weather.current.condition_desc}</p>
                <p className="text-sm text-gray-500">{weather.location.name}</p>
              </div>
            </div>
            <div className="flex gap-8 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                <Droplets className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-bold text-lg">{weather.current.humidity}%</p>
                  <p className="text-sm text-gray-500">Humidity</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-6 h-6 text-gray-500" />
                <div>
                  {/* Convert m/s to km/h by multiplying by 3.6 */}
                  <p className="font-bold text-lg">{(weather.current.windSpeed * 3.6).toFixed(1)} km/h</p>
                  <p className="text-sm text-gray-500">Wind</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- 5-Day Forecast Section --- */}
        <Card>
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between items-center text-center">
            {weather.daily.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <p className="font-semibold">{getDayOfWeek(day.timestamp)}</p>
                <img src={getWeatherIconUrl(day.icon)} alt="weather icon" className="w-16 h-16"/>
                <p className="text-sm">{Math.round(day.temperature.max)}° / {Math.round(day.temperature.min)}°</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* --- Charts Section --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TemperatureChart data={weather.hourly} />
          <HumidityChart data={weather.hourly} />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 hidden md:block">
          <Sidebar />
        </aside>
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Weather;