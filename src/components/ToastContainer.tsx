import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { Toast, ToastType, systemState } from '../state/system';

const iconMap: Record<ToastType, typeof Info> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
};

const colorMap: Record<ToastType, string> = {
  success: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400',
  error: 'bg-red-500/20 border-red-500/40 text-red-400',
  warning: 'bg-amber-500/20 border-amber-500/40 text-amber-400',
  info: 'bg-blue-500/20 border-blue-500/40 text-blue-400'
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const Icon = iconMap[toast.type];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm ${colorMap[toast.type]}`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium flex-1">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleToast = (event: CustomEvent<{ message: string; type: ToastType }>) => {
      const { message, type } = event.detail;
      const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const toast: Toast = { id, message, type, timestamp: Date.now() };
      
      setToasts(prev => [...prev, toast]);
      systemState.log('TOAST', { message, type });

      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 5000);
    };

    window.addEventListener('asro-toast', handleToast as EventListener);
    return () => window.removeEventListener('asro-toast', handleToast as EventListener);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem 
              toast={toast} 
              onDismiss={removeToast} 
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function showToast(message: string, type: ToastType = 'info') {
  window.dispatchEvent(new CustomEvent('asro-toast', { detail: { message, type } }));
}

export default ToastContainer;