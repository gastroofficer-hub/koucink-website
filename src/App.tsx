import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import StickyNavigation from "./components/StickyNavigation";
import ScrollToTop from "./components/ScrollToTop";
import CookieConsent from "./components/CookieConsent";
import Index from "./pages/Index";
import InformovanySouhlas from "./pages/InformovanySouhlas";
import Dotaznik from "./pages/Dotaznik";
import Kontakt from "./pages/Kontakt";
import Diplomy from "./pages/Diplomy";
import Cenik from "./pages/Cenik";
import EtickyKodex from "./pages/EtickyKodex";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <StickyNavigation />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/informovany-souhlas" element={<InformovanySouhlas />} />
            <Route path="/dotaznik" element={<Dotaznik />} />
            <Route path="/kontakt" element={<Kontakt />} />
            <Route path="/diplomy" element={<Diplomy />} />
            <Route path="/cenik" element={<Cenik />} />
            <Route path="/eticky-kodex" element={<EtickyKodex />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <ScrollToTop />
          <CookieConsent />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
