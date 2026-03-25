import { useState, useCallback, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  timestamp: number;
}

export interface SystemState {
  loading: boolean;
  message: string;
}

class StateManager {
  private state: SystemState = {
    loading: false,
    message: ''
  };
  
  private listeners: Set<(state: SystemState) => void> = new Set();

  getState(): SystemState {
    return { ...this.state };
  }

  setState(newState: Partial<SystemState>) {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  subscribe(listener: (state: SystemState) => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l(this.getState()));
  }

  setLoading(loading: boolean, message = '') {
    this.setState({ loading, message });
  }

  log(event: string, data?: Record<string, unknown>) {
    const logEntry = {
      event: `[ASRO] ${event}`,
      timestamp: new Date().toISOString(),
      ...data
    };
    console.log(JSON.stringify(logEntry, null, 2));
  }
}

export const systemState = new StateManager();

export function useSystemState() {
  const [state, setState] = useState(systemState.getState());

  useEffect(() => {
    return systemState.subscribe(setState);
  }, []);

  return state;
}

export function notify(message: string, type: ToastType = 'info') {
  console.log(`[NOTIFY] ${type.toUpperCase()}: ${message}`);
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const logger = {
  info: (msg: string, data?: Record<string, unknown>) => systemState.log('INFO', { message: msg, ...data }),
  error: (msg: string, data?: Record<string, unknown>) => systemState.log('ERROR', { message: msg, ...data }),
  warn: (msg: string, data?: Record<string, unknown>) => systemState.log('WARN', { message: msg, ...data }),
  event: (action: string, data?: Record<string, unknown>) => systemState.log(action.toUpperCase(), data)
};