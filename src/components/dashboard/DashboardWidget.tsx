"use client";

import { motion } from 'framer-motion';
import { LucideIcon, MoreHorizontal, Maximize2, X } from 'lucide-react';
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { formatCurrency, formatPercentage } from "@/lib/utils";

interface DashboardWidgetProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onRemove?: () => void;
  onExpand?: () => void;
  customActions?: React.ReactNode;
  children?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
}

export function DashboardWidget({
  title,
  description,
  icon,
  onRemove,
  onExpand,
  customActions,
  children,
  size = 'medium'
}: DashboardWidgetProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-gray-500">{icon}</div>}
          <div>
            <h3 className="text-sm font-medium text-gray-500">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
      </div>

      {children && <div className="mt-4">{children}</div>}

      <div className="flex items-center justify-between mt-4">
        {customActions}
        
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-200 rounded-md transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[120px]"
            >
              {onExpand && (
                <button
                  onClick={() => {
                    onExpand();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>Expandir</span>
                </button>
              )}
              
              {onRemove && (
                <button
                  onClick={() => {
                    onRemove();
                    setShowMenu(false);
                  }}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                  <span>Remover</span>
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </Card>
  );
} 