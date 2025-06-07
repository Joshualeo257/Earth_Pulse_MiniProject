import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, LoaderCircle, AlertTriangle, Info } from "lucide-react";

// --- TypeScript Type for a single recommendation ---
type RecommendationType = {
  _id: string;
  cropId: {
    name: string;
  };
  recommendation: {
    action: string;
    priority: string;
  };
};

const IrrigationRecommendations: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [recommendations, setRecommendations] = useState<RecommendationType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch("/api/irrigation/recommendations/pending");
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setRecommendations(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch recommendations.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  // --- RENDERING LOGIC ---
  const renderPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-400';
      default: return 'bg-irrigation-green';
    }
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center p-4"><LoaderCircle className="animate-spin h-6 w-6 text-irrigation-green" /></div>;
    }
    if (error) {
      return <div className="flex items-center text-red-600 p-4"><AlertTriangle className="h-5 w-5 mr-2" /> Error: {error}</div>;
    }
    if (recommendations.length === 0) {
      return (
        <div className="flex items-center text-gray-500 p-4">
          <Info className="h-5 w-5 mr-2" /> All irrigation schedules are up to date.
        </div>
      );
    }
    return (
      <div className="space-y-3">
        {recommendations.map((rec) => (
          <div 
            key={rec._id} 
            className="flex justify-between items-center p-3 rounded-md bg-white border border-gray-100"
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-6 rounded-full ${renderPriorityColor(rec.recommendation.priority)}`}></div>
              <span>{rec.cropId.name}</span>
            </div>
            <div className="flex items-center">
              {!rec.recommendation.action.includes('No') && (
                <Droplet className={`h-4 w-4 mr-1 ${rec.recommendation.priority === 'Critical' ? 'text-irrigation-blue' : 'text-gray-400'}`} />
              )}
              <span className="text-sm">{rec.recommendation.action}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium">Irrigation Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default IrrigationRecommendations;