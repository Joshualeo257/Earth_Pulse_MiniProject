import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoaderCircle, AlertTriangle } from "lucide-react";

// Helper function to get a dynamic OpenWeatherMap icon URL
const getWeatherIconUrl = (iconCode: string) => `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

// Updated TypeScript type definitions to match our new API response from the backend
type WeatherData = {
  current: {
    temperature: number;
    condition_desc: string;
    icon: string;
  };
  daily: {
    timestamp: string;
    temperature: { min: number; max: number };
    icon: string;
  }[];
};

const WeatherForecast: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Fetch from the new, correct endpoint for the dashboard
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

  // Helper function to get the short day of the week (e.g., "Mon") from a date string
  const getDayOfWeek = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center p-4 h-40"><LoaderCircle className="animate-spin h-6 w-6 text-irrigation-blue" /></div>;
    }
    
    if (error || !weather) {
      return <div className="flex items-center text-red-600 p-4 h-40"><AlertTriangle className="h-5 w-5 mr-2" /> {error || "Weather data could not be loaded."}</div>;
    }

    return (
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <img src={getWeatherIconUrl(weather.current.icon)} alt={weather.current.condition_desc} className="w-16 h-16 -my-2" />
          <div>
            <div className="text-4xl font-bold">{Math.round(weather.current.temperature)}°C</div>
            <div className="text-sm text-gray-500 capitalize">{weather.current.condition_desc}</div>
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          {weather.daily.slice(0, 5).map((day, index) => (
            <div key={index} className="text-center">
              <div className="font-medium">{getDayOfWeek(day.timestamp)}</div>
              <div className="my-2">
                <img src={getWeatherIconUrl(day.icon)} alt="weather icon" className="w-10 h-10 mx-auto" />
              </div>
              <div className="text-xs">{Math.round(day.temperature.max)}°/{Math.round(day.temperature.min)}°</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Weather Forecast</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default WeatherForecast;