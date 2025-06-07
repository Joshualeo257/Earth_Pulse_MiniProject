
import React from "react";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import SoilMoistureChart from "@/components/dashboard/SoilMoistureChart";
import WeatherForecast from "@/components/dashboard/WeatherForecast";
import IrrigationRecommendations from "@/components/dashboard/IrrigationRecommendations";

const Index = () => {
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
              <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
              <p className="text-gray-600">Overview of your irrigation system</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SoilMoistureChart />
              <WeatherForecast />
            </div>
            
            <div className="mt-6">
              <IrrigationRecommendations />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;
