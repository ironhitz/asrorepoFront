import React from 'react';
import { Activity, Clock, Terminal } from 'lucide-react';
import { ActivityLog } from '../types';
import { motion } from 'motion/react';

interface ActivityFeedProps {
  logs: ActivityLog[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ logs }) => {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-gitlab-orange" />
          <h3 className="text-lg font-semibold text-white">Autonomous Actions Feed</h3>
        </div>
        <span className="text-xs text-zinc-500 font-mono">LIVE_STREAM</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-600">
            <Terminal className="w-12 h-12 mb-2 opacity-20" />
            <p>Waiting for agent activity...</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={log.id}
              className="relative pl-6 border-l border-white/10"
            >
              <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-gitlab-orange shadow-[0_0_8px_rgba(252,109,38,0.5)]"></div>
              
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-gitlab-orange uppercase tracking-wider">{log.type}</span>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                  <Clock className="w-3 h-3" />
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
              
              <p className="text-sm text-zinc-300 leading-relaxed">
                {log.message}
              </p>
              
              {log.agentId && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-mono">
                    AGENT: {log.agentId}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
