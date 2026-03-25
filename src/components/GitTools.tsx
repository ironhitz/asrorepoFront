import React, { useState, useEffect } from 'react';
import { GitBranch, FileCode, Diff, ChevronRight, Folder, File, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface GitToolsProps {
  projectId: string;
}

const GitTools: React.FC<GitToolsProps> = ({ projectId }) => {
  const [branches, setBranches] = useState<{ all: string[] }>({ all: [] });
  const [files, setFiles] = useState<any[]>([]);
  const [diff, setDiff] = useState("");
  const [isLoading, setIsLoading] = useState({ branches: false, files: false, diff: false });
  const [activeTab, setActiveTab] = useState<'branches' | 'files' | 'diff'>('branches');
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    if (!projectId) return;
    
    // Fetch branches
    setIsLoading(prev => ({ ...prev, branches: true }));
    fetch(`/api/git?action=branch&projectId=${projectId}`)
      .then(r => r.json())
      .then(data => setBranches(data))
      .catch(err => console.error("Failed to fetch branches:", err))
      .finally(() => setIsLoading(prev => ({ ...prev, branches: false })));

    // Fetch files
    setIsLoading(prev => ({ ...prev, files: true }));
    fetch(`/api/files?projectId=${projectId}`)
      .then(r => r.json())
      .then(data => setFiles(data))
      .catch(err => console.error("Failed to fetch files:", err))
      .finally(() => setIsLoading(prev => ({ ...prev, files: false })));

    // Fetch diff
    setIsLoading(prev => ({ ...prev, diff: true }));
    fetch(`/api/diff?projectId=${projectId}`)
      .then(r => r.json())
      .then(data => setDiff(data.diff))
      .catch(err => console.error("Failed to fetch diff:", err))
      .finally(() => setIsLoading(prev => ({ ...prev, diff: false })));
  }, [projectId]);

  const handleCheckout = async (branch: string) => {
    setStatus(null);
    try {
      const res = await fetch("/api/git", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "checkout",
          projectId,
          args: [branch]
        })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `Successfully switched to ${branch}` });
      } else {
        setStatus({ type: 'error', message: data.error || "Failed to switch branch" });
      }
    } catch (err) {
      setStatus({ type: 'error', message: "Network error during checkout" });
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-white/10 rounded-[2px] overflow-hidden flex flex-col h-full">
      <div className="flex items-center border-b border-white/10 bg-zinc-950/50">
        <button 
          onClick={() => setActiveTab('branches')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'branches' ? 'bg-gitlab-orange text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
          <GitBranch className="w-3 h-3" /> Branches
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'files' ? 'bg-gitlab-orange text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
          <FileCode className="w-3 h-3" /> Files
        </button>
        <button 
          onClick={() => setActiveTab('diff')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'diff' ? 'bg-gitlab-orange text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
          <Diff className="w-3 h-3" /> Diff
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
        <AnimatePresence mode="wait">
          {activeTab === 'branches' && (
            <motion.div
              key="branches"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Branches</h3>
                {isLoading.branches && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
              </div>
              
              {status && (
                <div className={`p-3 rounded-[2px] flex items-center gap-2 text-xs ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {status.message}
                </div>
              )}

              <div className="grid gap-2">
                {branches.all.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleCheckout(b)}
                    className="flex items-center justify-between p-3 bg-zinc-950/50 border border-white/5 hover:border-gitlab-orange/50 rounded-[2px] group transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-4 h-4 text-zinc-600 group-hover:text-gitlab-orange" />
                      <span className="text-sm text-zinc-300 group-hover:text-white">{b}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-800 group-hover:text-gitlab-orange" />
                  </button>
                ))}
                {branches.all.length === 0 && !isLoading.branches && (
                  <div className="text-center py-8 text-zinc-600 text-xs italic">No branches found.</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Repository Files</h3>
                {isLoading.files && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
              </div>
              
              <div className="grid gap-1">
                {files.map((f) => (
                  <div
                    key={f.path}
                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-[2px] group cursor-pointer"
                  >
                    {f.type === 'tree' ? (
                      <Folder className="w-4 h-4 text-gitlab-orange/70" />
                    ) : (
                      <File className="w-4 h-4 text-zinc-600" />
                    )}
                    <div className="flex flex-col">
                      <span className="text-sm text-zinc-300 group-hover:text-white">{f.name}</span>
                      <span className="text-[10px] text-zinc-600 uppercase tracking-tighter">{f.path}</span>
                    </div>
                  </div>
                ))}
                {files.length === 0 && !isLoading.files && (
                  <div className="text-center py-8 text-zinc-600 text-xs italic">No files found.</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'diff' && (
            <motion.div
              key="diff"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Recent Changes</h3>
                {isLoading.diff && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
              </div>
              
              <div className="bg-black/60 rounded-[2px] border border-white/5 p-4 font-mono text-xs overflow-x-auto">
                <pre className="text-zinc-400 whitespace-pre-wrap leading-relaxed">
                  {diff || "No changes detected between main and HEAD."}
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default GitTools;
