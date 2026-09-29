import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Code2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-warm opacity-40" />
      <div className="absolute top-20 right-20 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-20 left-20 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[80px]" />
      
      <motion.div
        className="text-center relative z-10 max-w-md px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 border border-primary/20"
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", delay: 0.2 }}
        >
          <MapPin className="w-10 h-10 text-primary" />
        </motion.div>
        
        <h1 className="text-8xl font-black gradient-text mb-2">404</h1>
        <h2 className="text-xl font-bold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          The route <code className="font-mono text-sm bg-secondary px-2 py-0.5 rounded-md border border-border">{location.pathname}</code> doesn't exist. Let's get you back on track.
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button asChild className="rounded-full gap-2 shadow-lg shadow-primary/20">
            <Link to="/"><Home className="w-4 h-4" /> Go Home</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full gap-2" onClick={() => window.history.back()}>
            <span><ArrowLeft className="w-4 h-4" /> Go Back</span>
          </Button>
        </div>
        
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Code2 className="w-3.5 h-3.5 text-primary" />
          <span className="font-semibold text-foreground">CodePilot</span> — Decode Algorithms, One Step at a Time
        </div>
      </motion.div>
    </div>
  );
};

export default NotFound;
