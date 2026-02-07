import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DayPage from "./pages/DayPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import GoalAnalyticsPage from "./pages/GoalAnalyticsPage";
import BacklogPage from "./pages/BacklogPage";
import CompletedTasksPage from "./pages/CompletedTasksPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/day/:date" element={<DayPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/:goalId" element={<GoalAnalyticsPage />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/completed" element={<CompletedTasksPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
