import React from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Wallet, 
  BarChart3, 
  Settings, 
  Home,
  Search,
  Github,
  Star,
  GitFork
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import Icon from '../ui/Icon';
import SectionSeparator from '../ui/SectionSeparator';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'markets', label: 'Markets', icon: TrendingUp },
    // Portfolio temporarily hidden until the MVP is ready to ship
    // { id: 'portfolio', label: 'Portfolio', icon: Wallet },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 h-full p-6">
      <GlassCard className="h-full p-6" elevated>
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-crypto flex items-center justify-center shadow-lg">
            <TrendingUp className="w-7 h-7 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">CryptoDash</h1>
            <p className="text-text-muted text-sm font-medium">AI-Powered Money Maker</p>
          </div>
        </div>

        <SectionSeparator variant="line" spacing="sm" />

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl 
                  transition-all duration-200 font-medium
                  ${
                    isActive 
                      ? 'bg-primary-500/20 text-primary-400 shadow-lg border border-primary-500/30 shadow-primary-500/20' 
                      : 'text-text-tertiary hover:text-text-primary hover:bg-glass-white/30 border border-transparent'
                  }
                `}
                whileHover={{ x: isActive ? 0 : 3 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-500/30 shadow-sm' 
                    : 'bg-glass-white/20'
                }`}>
                  <Icon 
                    icon={item.icon} 
                    size="sm" 
                    className={isActive ? 'text-primary-300' : 'text-text-tertiary'}
                    strokeWidth={2}
                  />
                </div>
                <span className={`transition-colors duration-200 ${
                  isActive ? 'text-primary-300' : ''
                }`}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
        </nav>

        <div className="mt-8">
          <SectionSeparator variant="line" spacing="sm" />
          <div className="mt-4 space-y-3">
            <a
              href="https://github.com/ktwu01/crypto-dashboard/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center px-4 py-3 rounded-xl border border-glass-border/60 bg-glass-white/20 text-sm text-text-secondary hover:bg-primary-500/20 hover:text-primary-200 transition-all duration-200 space-x-2"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repo</span>
            </a>
            <div className="flex items-center justify-center px-4 py-3 rounded-xl border border-glass-border/60 bg-glass-white/10 text-sm text-text-secondary space-x-3">
              <a
                href="https://github.com/ktwu01/crypto-dashboard/stargazers"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 hover:text-primary-200 transition-colors duration-200"
              >
                <Star className="w-4 h-4" />
                <span>Star</span>
              </a>
              <span className="text-text-muted">|</span>
              <a
                href="https://github.com/ktwu01/crypto-dashboard/fork"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-2 hover:text-primary-200 transition-colors duration-200"
              >
                <GitFork className="w-4 h-4" />
                <span>Fork</span>
              </a>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export default Sidebar;
