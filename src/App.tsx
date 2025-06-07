import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Sensors from "./pages/Sensors";
import Weather from "./pages/Weather";
import Crops from "./pages/Crops";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
// The Outlet component is not needed here because you are defining all routes explicitly.

const queryClient = new QueryClient();

// This is your main App component that controls the entire application structure.
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* This is the standard Toaster. It's fine to leave it. */}
      <Toaster />

      {/* --- THIS IS THE LINE TO MODIFY --- */}
      {/* Add the props to your existing Sonner component. */}
      <Sonner position="top-center" richColors />

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/sensors" element={<Sensors />} />
          <Route path="/weather" element={<Weather />} />
          <Route path="/crops" element={<Crops />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

// We no longer need the second, conflicting App function definition.
// function App() { ... } <-- DELETE THIS

export default App;