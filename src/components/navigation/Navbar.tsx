
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-irrigation-green">EARTH PULSE</span>
            </Link>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Link to="/">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Link to="/sensors">
                <Button variant="ghost">Sensors</Button>
              </Link>
              <Link to="/weather">
                <Button variant="ghost">Weather</Button>
              </Link>
              <Link to="/crops">
                <Button variant="ghost">Crops</Button>
              </Link>
              <Link to="/settings">
                <Button variant="ghost">Settings</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
