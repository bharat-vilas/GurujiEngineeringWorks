import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface ResizableSplitPaneProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultLeftWidth?: number; // percentage
}

const ResizableSplitPane = ({
  left,
  right,
  defaultLeftWidth = 50,
}: ResizableSplitPaneProps) => {
  const [leftWidth, setLeftWidth] = useState(defaultLeftWidth);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newLeftWidth =
        ((e.clientX - containerRect.left) / containerRect.width) * 100;

      // Constrain between 20% and 80%
      const constrainedWidth = Math.max(20, Math.min(80, newLeftWidth));
      setLeftWidth(constrainedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  return (
    <div ref={containerRef} className="flex w-full h-full relative">
      {/* Left Panel */}
      <div
        className="h-full overflow-y-auto custom-scrollbar"
        style={{ width: `${leftWidth}%` }}
      >
        {left}
      </div>

      {/* Resizer */}
      <motion.div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 bottom-0 w-1 bg-gray-300 hover:bg-primary cursor-col-resize z-10 transition-colors ${
          isDragging ? "bg-primary" : ""
        }`}
        style={{
          left: `${leftWidth}%`,
          transform: "translateX(-50%)",
        }}
        whileHover={{ backgroundColor: "#486A47" }}
        whileTap={{ scale: 1.1 }}
      >
        {/* Drag Handle */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-12 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-300">
          <div className="flex flex-col gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </motion.div>

      {/* Right Panel */}
      <div
        className="h-full overflow-y-auto custom-scrollbar"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {right}
      </div>
    </div>
  );
};

export default ResizableSplitPane;

