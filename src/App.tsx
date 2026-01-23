import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InformovanySouhlas from "./pages/InformovanySouhlas";
import Dotaznik from "./pages/Dotaznik";
import KdoJsem from "./pages/KdoJsem";
import ProcKoucink from "./pages/ProcKoucink";
import Kontakt from "./pages/Kontakt";
import Diplomy from "./pages/Diplomy";
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
          <Route path="/informovany-souhlas" element={<InformovanySouhlas />} />
          <Route path="/dotaznik" element={<Dotaznik />} />
          <Route path="/kdo-jsem" element={<KdoJsem />} />
          <Route path="/proc-koucink" element={<ProcKoucink />} />
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/diplomy" element={<Diplomy />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
