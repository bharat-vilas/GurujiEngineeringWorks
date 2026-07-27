import { motion } from "framer-motion";
import { CalendarDays } from "lucide-react";

const Header = () => {
  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-white border-b border-border flex items-center justify-between px-5 z-30 shadow-sm flex-shrink-0"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center rounded-xl overflow-hidden">
          <img
            src="/GEWlogo2.png"
            alt="Guruji Engineering Works Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
        <div>
          <h1 className="text-base font-bold text-foreground leading-tight">Guruji Engineering Works</h1>
          <p className="text-xs text-muted-foreground leading-tight">Document Management System</p>
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-2 bg-muted/60 rounded-lg px-3 py-1.5">
        <CalendarDays className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium text-muted-foreground">{today}</span>
      </div>
    </motion.header>
  );
};

export default Header;
