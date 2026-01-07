import { useState } from "react";
import { motion } from "framer-motion";
import { 
  FileTextOutlined, 
  DollarOutlined, 
  CarOutlined, 
  LogoutOutlined,
  MenuOutlined,
  CloseOutlined,
  UserAddOutlined,
  LeftOutlined,
  RightOutlined,
  MailOutlined
} from "@ant-design/icons";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar = ({ activeTab, setActiveTab, onLogout, isOpen, setIsOpen }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  
  const menuItems = [
    {
      id: "quotation",
      label: "Quotation",
      icon: FileTextOutlined,
      color: "bg-green-50 hover:bg-green-100 text-green-700",
      activeColor: "bg-green-600 text-white",
    },
    {
      id: "billing",
      label: "Billing",
      icon: DollarOutlined,
      color: "bg-purple-50 hover:bg-purple-100 text-purple-700",
      activeColor: "bg-purple-600 text-white",
    },
    {
      id: "challan",
      label: "Challan",
      icon: CarOutlined,
      color: "bg-blue-50 hover:bg-blue-100 text-blue-700",
      activeColor: "bg-blue-600 text-white",
    },
    {
      id: "register-client",
      label: "Register Client",
      icon: UserAddOutlined,
      color: "bg-orange-50 hover:bg-orange-100 text-orange-700",
      activeColor: "bg-orange-600 text-white",
    },
    {
      id: "mail",
      label: "Mail",
      icon: MailOutlined,
      color: "bg-indigo-50 hover:bg-indigo-100 text-indigo-700",
      activeColor: "bg-indigo-600 text-white",
    },
  ];

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  };

  const itemVariants = {
    open: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
    closed: {
      opacity: 0,
      x: -20,
    },
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 left-4 z-50 lg:hidden p-2 rounded-lg bg-white shadow-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <CloseOutlined className="text-lg text-gray-700" />
        ) : (
          <MenuOutlined className="text-lg text-gray-700" />
        )}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={
          isOpen || (typeof window !== "undefined" && window.innerWidth >= 1024)
            ? "open"
            : "closed"
        }
        className={`fixed left-0 top-0 h-screen bg-white shadow-xl z-50 lg:relative lg:h-full flex flex-col transition-all duration-300 relative ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Collapse/Expand Toggle Button (Desktop only) - Positioned at right edge, vertically centered */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 p-2 rounded-full bg-white shadow-lg border border-gray-200 hover:bg-gray-100 transition-colors items-center justify-center"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <RightOutlined className="text-base text-gray-600" />
          ) : (
            <LeftOutlined className="text-base text-gray-600" />
          )}
        </button>

        {/* Close button for mobile */}
        <div className="lg:hidden p-4 border-b border-gray-200 flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 rounded hover:bg-gray-100"
          >
            <CloseOutlined className="text-base text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                variants={itemVariants}
                initial="closed"
                animate="open"
                transition={{ delay: index * 0.1 }}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center ${
                  collapsed ? "justify-center px-2" : "space-x-3 px-4"
                } py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? item.activeColor + " shadow-md"
                    : item.color
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="text-lg flex-shrink-0" />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            variants={itemVariants}
            initial="closed"
            animate="open"
            onClick={onLogout}
            className={`w-full flex items-center ${
              collapsed ? "justify-center px-2" : "space-x-3 px-4"
            } py-3 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-all duration-200`}
            title={collapsed ? "Logout" : undefined}
          >
            <LogoutOutlined className="text-lg flex-shrink-0" />
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                className="font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;

