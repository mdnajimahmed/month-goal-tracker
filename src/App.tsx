import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Index from "./pages/Index";
import DayPage from "./pages/DayPage";
import GoalAnalyticsPage from "./pages/GoalAnalyticsPage";
import BacklogPage from "./pages/BacklogPage";
import EisenhowerPage from "./pages/EisenhowerPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/day/:date" element={<DayPage />} />
            <Route path="/goal-analytics/:goalId" element={<GoalAnalyticsPage />} />
            <Route path="/operation" element={<EisenhowerPage />} />
            <Route path="/vision" element={<BacklogPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
