import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import InformovanySouhlas from "./pages/InformovanySouhlas";
import Dotaznik from "./pages/Dotaznik";
import Kontakt from "./pages/Kontakt";
import Diplomy from "./pages/Diplomy";
import Cenik from "./pages/Cenik";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
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
          <Route path="/kontakt" element={<Kontakt />} />
          <Route path="/diplomy" element={<Diplomy />} />
          <Route path="/cenik" element={<Cenik />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
