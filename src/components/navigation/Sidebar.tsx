
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LayoutDashboard, Thermometer, CloudSun, Crop, Settings } from "lucide-react";

const Sidebar: React.FC = () => {
  return (
    <Card className="h-full rounded-none border-r bg-irrigation-gray">
      <div className="p-4 space-y-6">
        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="w-full text-left justify-start"
            asChild
          >
            <Link to="/" className="flex items-center space-x-2">
              <LayoutDashboard className="h-5 w-5 text-irrigation-green" />
              <span>Sensor Data</span>
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="w-full text-left justify-start"
            asChild
          >
            <Link to="/weather" className="flex items-center space-x-2">
              <CloudSun className="h-5 w-5 text-irrigation-blue" />
              <span>Weather</span>
            </Link>
          </Button>
        </div>

        <div className="flex justify-center">
          <Button
            variant="ghost"
            className="w-full text-left justify-start"
            asChild
          >
            <Link to="/crops" className="flex items-center space-x-2">
              <Crop className="h-5 w-5 text-irrigation-earth" />
              <span>Crop Settings</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Sidebar;
