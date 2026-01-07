import { motion } from "framer-motion";

const Header = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-6 z-30"
    >
      <div className="flex items-center space-x-3">
        <img 
          src="/GEWlogo2.png" 
          alt="Guruji Engineering Works Logo" 
          className="h-16 w-auto object-contain"
        />
        <div>
          <h1 className="text-lg font-bold text-gray-800">Guruji Engineering Works</h1>
          <p className="text-xs text-gray-500">Document Management System</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>
    </motion.header>
  );
};

export default Header;

