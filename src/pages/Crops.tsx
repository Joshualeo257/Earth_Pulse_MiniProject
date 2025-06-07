// src/pages/Crops.tsx

import React, { useState, useEffect, useMemo } from "react"; // Added useMemo
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplet, Calendar, CircleChevronUp, CircleChevronDown, Sprout, LoaderCircle, AlertTriangle, Sparkles } from "lucide-react";
import { AddNewCropDialog } from "@/components/crops/AddNewCropDialog";
import { IrrigationCalendar } from "@/components/crops/IrrigationCalendar";

// --- TypeScript Type Definitions ---
type AISchedule = {
  schedule: number[];
  quantity: number[];
};

type CropType = {
  _id: string;
  name: string;
  stage: 'Seedling' | 'Growing' | 'Mature' | 'Harvesting';
  waterNeeds: 'Low' | 'Medium' | 'Medium-High' | 'High';
  plantedDate: string;
  nextWatering: string;
  aiSchedule?: AISchedule;
};

// ===================================================================
// The Enhanced CropCard Component
// ===================================================================
const CropCard = ({ crop }: { crop: CropType }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // --- State Management for AI Feature ---
  const [originalSchedule, setOriginalSchedule] = useState<AISchedule | null>(crop.aiSchedule || null);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState<boolean>(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // ===================================================================
  // --- NEW: FUNCTION TO APPLY ZERO-IRRIGATION DAYS (FRONTEND ONLY) ---
  // ===================================================================
  const applyZeroIrrigationDays = (
    scheduleData: AISchedule | null, 
    waterNeeds: CropType['waterNeeds']
  ): AISchedule | null => {
    if (!scheduleData) return null;

    // Clone the original data to avoid modifying the state directly
    const newSchedule = [...scheduleData.schedule];
    const newQuantity = [...scheduleData.quantity];

    // 1. Define how many zero-days we want per week for each level
    const zeroDaysTargetPerWeek = {
      'Low': 5,
      'Medium': 4,
      'Medium-High': 3,
      'High': 2
    };

    // Calculate total zero-days needed for the 14-day period
    const totalZeroDaysNeeded = zeroDaysTargetPerWeek[waterNeeds] * 2;

    // 2. Find all days that currently have watering scheduled
    const wateringDays = newSchedule
      .map((s, index) => (s === 1 ? { index, quantity: newQuantity[index] } : null))
      .filter(Boolean);
      
    // If we already have enough or more zero days than needed, do nothing.
    const currentZeroDays = 14 - wateringDays.length;
    if (currentZeroDays >= totalZeroDaysNeeded) {
        return scheduleData;
    }

    // 3. Sort the watering days by the SMALLEST quantity first
    wateringDays.sort((a, b) => a!.quantity - b!.quantity);

    // 4. Calculate how many days we need to "turn off"
    const daysToZeroOut = wateringDays.length - (14 - totalZeroDaysNeeded);
    
    // 5. Take the smallest ones and set them to 0
    if (daysToZeroOut > 0) {
      const daysToChange = wateringDays.slice(0, daysToZeroOut);
      for (const day of daysToChange) {
        newSchedule[day!.index] = 0;
        newQuantity[day!.index] = 0;
      }
    }

    return { schedule: newSchedule, quantity: newQuantity };
  };

  // --- Use useMemo to prevent re-calculating on every render ---
  // This derived state will be used for display.
  const displaySchedule = useMemo(
    () => applyZeroIrrigationDays(originalSchedule, crop.waterNeeds),
    [originalSchedule, crop.waterNeeds]
  );
  // ===================================================================
  // --- END OF NEW LOGIC ---
  // ===================================================================


  const handleGenerateSchedule = async () => {
    setIsLoadingSchedule(true);
    setScheduleError(null);
    try {
      const response = await fetch(`/api/ai/schedule/${crop._id}`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to generate schedule.");
      }
      // Set the RAW, unmodified schedule from the backend
      setOriginalSchedule(data.data); 
    } catch (err: any) {
      setScheduleError(err.message);
    } finally {
      setIsLoadingSchedule(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
  
  const getWaterNeedsColor = (needs: string) => {
    // ... (this function remains the same)
    switch(needs) {
      case "Low": return "bg-green-100 text-green-800";
      case "Medium": return "bg-blue-100 text-blue-800";
      case "Medium-High": return "bg-indigo-100 text-indigo-800";
      case "High": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  const getStageColor = (stage: string) => {
    // ... (this function remains the same)
    switch(stage) {
      case "Seedling": return "bg-green-100 text-green-800";
      case "Growing": return "bg-blue-100 text-blue-800";
      case "Mature": return "bg-amber-100 text-amber-800";
      case "Harvesting": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="overflow-hidden shadow-md transition-all duration-300">
      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        {/* ... (this part of the component remains the same) ... */}
         <div className="flex items-center">
          <div className="mr-4 w-12 h-12 rounded-full bg-irrigation-green flex items-center justify-center text-white text-xl font-bold">
            {crop.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{crop.name}</h3>
            <div className="flex gap-2 mt-1">
              <span className={`text-xs px-2 py-1 rounded-full ${getStageColor(crop.stage)}`}>{crop.stage}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${getWaterNeedsColor(crop.waterNeeds)}`}>{crop.waterNeeds} Water</span>
            </div>
          </div>
        </div>
        {isExpanded ? <CircleChevronUp className="text-gray-500" /> : <CircleChevronDown className="text-gray-400" />}
      </div>
      
      {isExpanded && (
        <CardContent className="border-t pt-4 space-y-6">
          <div>
              <h4 className="text-sm font-medium text-gray-800 mb-3">Crop Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Sprout className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <div>
                          <p className="text-gray-500">Planted On</p>
                          <p className="font-semibold">{formatDate(crop.plantedDate)}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Calendar className="h-5 w-5 text-gray-600 flex-shrink-0" />
                      <div>
                          <p className="text-gray-500">Next Manual Watering</p>
                          <p className="font-semibold">{formatDate(crop.nextWatering)}</p>
                      </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <Droplet className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                          <p className="text-gray-500">Water Needs</p>
                          <p className="font-semibold">{crop.waterNeeds}</p>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* --- AI Schedule Section --- */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            {/* --- MODIFIED: Use the `displaySchedule` for rendering --- */}
            {displaySchedule ? (
              <IrrigationCalendar schedule={displaySchedule.schedule} quantity={displaySchedule.quantity} />
            ) : (
              <div className="text-center py-4">
                <h3 className="font-semibold text-gray-700">Generate AI Forecast</h3>
                <p className="text-sm text-gray-500 my-2">Use the Vision Transformer model to predict the optimal 14-day irrigation plan.</p>
                <Button onClick={handleGenerateSchedule} disabled={isLoadingSchedule}>
                  {isLoadingSchedule ? (<><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Generating...</>) : (<><Sparkles className="mr-2 h-4 w-4" />Generate Schedule</>)}
                </Button>
              </div>
            )}
            {scheduleError && <p className="text-red-500 text-sm mt-2 text-center">Error: {scheduleError}</p>}
          </div>
          {displaySchedule && !isLoadingSchedule && (
            <div className="text-center -mt-4">
                <Button variant="link" size="sm" onClick={handleGenerateSchedule}>Re-generate Schedule</Button>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

// ===================================================================
// The Main Crops Page Component (No changes needed here)
// ===================================================================
const Crops = () => {
    // ... (The entire `Crops` component remains exactly the same) ...
    const [crops, setCrops] = useState<CropType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCrops = async () => {
        try {
            const response = await fetch("/api/crops");
            const data = await response.json();
            if (data.success) {
            setCrops(data.data);
            } else {
            throw new Error(data.message || "Failed to fetch crops.");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
        };
        fetchCrops();
    }, []);

    const handleCropAdded = (newCrop: CropType) => {
        setCrops((prevCrops) => [newCrop, ...prevCrops]);
    };

    const renderContent = () => {
        if (loading) return <div className="flex justify-center p-8"><LoaderCircle className="animate-spin h-8 w-8 text-irrigation-green" /></div>;
        if (error) return <div className="p-4 bg-red-50 text-red-600 rounded-md"><AlertTriangle className="inline mr-2" />Error: {error}</div>;
        if (crops.length === 0) return <div className="text-center p-8 bg-gray-100 rounded-lg"><p>No crops found. Add one to get started!</p></div>;
        return (
        <div className="space-y-6">
            {crops.map((crop) => <CropCard key={crop._id} crop={crop} />)}
        </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 hidden md:block"><Sidebar /></aside>
            <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Crops</h1>
                    <p className="text-gray-600">Manage your crops and view AI-powered irrigation forecasts.</p>
                </div>
                <AddNewCropDialog onCropAdded={handleCropAdded} />
                </div>
                {renderContent()}
            </div>
            </main>
        </div>
        </div>
    );
};

export default Crops;