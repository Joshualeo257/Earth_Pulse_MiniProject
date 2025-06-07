
import React from "react";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-6">
        <h1 className="text-6xl font-bold text-irrigation-green mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! Page not found</p>
        <div className="flex justify-center">
          <Button asChild className="bg-irrigation-green hover:bg-irrigation-green/90">
            <Link to="/">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
