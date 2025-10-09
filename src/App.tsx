import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Pacientes from "./pages/Pacientes";
import Agenda from "./pages/Agenda";
import Prontuario from "./pages/Prontuario";
import Dentistas from "./pages/Dentistas";
import Financeiro from "./pages/Financeiro";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={
            <ProtectedRoute>
              <MainLayout>
                <Dashboard />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/pacientes" element={
            <ProtectedRoute>
              <MainLayout>
                <Pacientes />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/agenda" element={
            <ProtectedRoute>
              <MainLayout>
                <Agenda />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/prontuario" element={
            <ProtectedRoute>
              <MainLayout>
                <Prontuario />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/dentistas" element={
            <ProtectedRoute>
              <MainLayout>
                <Dentistas />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/financeiro" element={
            <ProtectedRoute>
              <MainLayout>
                <Financeiro />
              </MainLayout>
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
