import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Receipt,
  Truck,
  UserPlus,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  CalendarCheck,
  TrendingUp,
  Home,
} from "lucide-react";
import { cn } from "../lib/utils";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const menuItems = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    color: "text-amber-700",
    activeBg: "bg-amber-500",
    hoverBg: "hover:bg-amber-50",
    dot: "bg-amber-500",
  },
  {
    id: "quotation",
    label: "Quotation",
    icon: FileText,
    color: "text-emerald-700",
    activeBg: "bg-emerald-600",
    hoverBg: "hover:bg-emerald-50",
    dot: "bg-emerald-500",
  },
  {
    id: "billing",
    label: "Billing",
    icon: Receipt,
    color: "text-purple-700",
    activeBg: "bg-purple-600",
    hoverBg: "hover:bg-purple-50",
    dot: "bg-purple-500",
  },
  {
    id: "challan",
    label: "Challan",
    icon: Truck,
    color: "text-blue-700",
    activeBg: "bg-blue-600",
    hoverBg: "hover:bg-blue-50",
    dot: "bg-blue-500",
  },
  {
    id: "register-client",
    label: "Clients",
    icon: UserPlus,
    color: "text-orange-700",
    activeBg: "bg-orange-500",
    hoverBg: "hover:bg-orange-50",
    dot: "bg-orange-500",
  },
  {
    id: "mail",
    label: "Mail",
    icon: Mail,
    color: "text-indigo-700",
    activeBg: "bg-indigo-600",
    hoverBg: "hover:bg-indigo-50",
    dot: "bg-indigo-500",
  },
  {
    id: "employees",
    label: "Employees",
    icon: Users,
    color: "text-rose-700",
    activeBg: "bg-rose-600",
    hoverBg: "hover:bg-rose-50",
    dot: "bg-rose-500",
  },
  {
    id: "attendance",
    label: "Attendance",
    icon: CalendarCheck,
    color: "text-teal-700",
    activeBg: "bg-teal-600",
    hoverBg: "hover:bg-teal-50",
    dot: "bg-teal-500",
  },
  {
    id: "financials",
    label: "Financials",
    icon: TrendingUp,
    color: "text-violet-700",
    activeBg: "bg-violet-600",
    hoverBg: "hover:bg-violet-50",
    dot: "bg-violet-500",
  },
];

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-[72px] left-3 z-50 lg:hidden p-2 rounded-lg bg-white shadow-md border border-border hover:bg-muted transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-4 w-4 text-muted-foreground" /> : <Menu className="h-4 w-4 text-muted-foreground" />}
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen || (typeof window !== "undefined" && window.innerWidth >= 1024) ? 0 : "-100%",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed left-0 top-0 h-screen bg-white border-r border-border z-50 flex flex-col shadow-lg",
          "lg:relative lg:h-full lg:translate-x-0 lg:shadow-none",
          "transition-[width] duration-300",
          collapsed ? "w-[72px]" : "w-60"
        )}
      >
        {/* Collapse toggle - desktop only */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white border border-border shadow-sm hover:bg-muted transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronLeft className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>

        {/* Mobile close button */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-semibold text-foreground">Navigation</span>
          <button onClick={() => setIsOpen(false)} className="p-1 rounded hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Brand mark when collapsed */}
        {collapsed && (
          <div className="hidden lg:flex items-center justify-center py-4 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground text-xs font-bold">GE</span>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => { setActiveTab(item.id); setIsOpen(false); }}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center rounded-lg transition-all duration-200 font-medium text-sm",
                  collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                  isActive
                    ? `${item.activeBg} text-white shadow-sm`
                    : `${item.color} ${item.hoverBg} text-opacity-80`
                )}
              >
                <Icon className="h-[18px] w-[18px] flex-shrink-0" />
                {!collapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {!collapsed && isActive && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={cn("p-3 border-t border-border", collapsed && "flex justify-center")}>
          <button
            onClick={onLogout}
            title={collapsed ? "Logout" : undefined}
            className={cn(
              "flex items-center rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200",
              collapsed ? "p-2.5" : "w-full gap-3 px-3 py-2.5"
            )}
          >
            <LogOut className="h-[18px] w-[18px] flex-shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
