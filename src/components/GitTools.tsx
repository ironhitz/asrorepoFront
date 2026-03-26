import React, { useState, useEffect } from 'react';
import { GitBranch, FileCode, Diff, ChevronRight, Folder, File, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
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

  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  
  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'ts':
      case 'tsx':
      case 'js':
      case 'jsx':
        return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
      case 'json':
        return <FileCode className="w-3.5 h-3.5 text-yellow-400" />;
      case 'md':
        return <File className="w-3.5 h-3.5 text-zinc-400" />;
      case 'css':
      case 'scss':
        return <FileCode className="w-3.5 h-3.5 text-pink-400" />;
      case 'html':
        return <FileCode className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <File className="w-3.5 h-3.5 text-zinc-500" />;
    }
  };

  const buildTree = (flatFiles: any[]) => {
    const root: any = { name: 'root', type: 'tree', children: {}, path: '' };
    
    flatFiles.forEach(file => {
      const parts = file.path.split('/');
      let current = root;
      
      parts.forEach((part, index) => {
        if (!current.children[part]) {
          current.children[part] = {
            name: part,
            path: parts.slice(0, index + 1).join('/'),
            type: index === parts.length - 1 ? file.type : 'tree',
            children: {}
          };
        }
        current = current.children[part];
      });
    });
    
    return root;
  };

  const renderTree = (node: any, level = 0) => {
    const sortedChildren = Object.values(node.children).sort((a: any, b: any) => {
      if (a.type === b.type) return a.name.localeCompare(b.name);
      return a.type === 'tree' ? -1 : 1;
    });

    return sortedChildren.map((item: any) => {
      const isFolder = item.type === 'tree';
      const isExpanded = expandedFolders.has(item.path);
      const isSelected = selectedFile === item.path;
      
      return (
        <div key={item.path}>
          <div
            onClick={() => {
              if (isFolder) {
                toggleFolder(item.path);
              } else {
                setSelectedFile(item.path);
              }
            }}
            className={`flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded-[2px] group cursor-pointer transition-all ${isSelected ? 'bg-gitlab-orange/10 text-white' : isFolder ? 'text-zinc-300' : 'text-zinc-500'}`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
          >
            {isFolder ? (
              <>
                <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                <Folder className={`w-3.5 h-3.5 ${isExpanded ? 'text-gitlab-orange' : 'text-zinc-500'}`} />
              </>
            ) : (
              <>
                <div className="w-3" />
                {getFileIcon(item.name)}
              </>
            )}
            <span className={`text-[11px] font-medium truncate ${isSelected ? 'text-gitlab-orange' : 'group-hover:text-white'}`}>
              {item.name}
            </span>
          </div>
          {isFolder && isExpanded && renderTree(item, level + 1)}
        </div>
      );
    });
  };

  return (
    <div className="bg-zinc-950 border border-white/10 rounded-[2px] overflow-hidden flex flex-col h-full shadow-2xl">
      <div className="flex items-center border-b border-white/10 bg-zinc-900/80">
        <button 
          onClick={() => setActiveTab('branches')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all border-r border-white/5 ${activeTab === 'branches' ? 'bg-gitlab-orange text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
          <GitBranch className="w-3 h-3" /> Branches
        </button>
        <button 
          onClick={() => setActiveTab('files')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all border-r border-white/5 ${activeTab === 'files' ? 'bg-gitlab-orange text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
          <FileCode className="w-3 h-3" /> Explorer
        </button>
        <button 
          onClick={() => setActiveTab('diff')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${activeTab === 'diff' ? 'bg-gitlab-orange text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
        >
          <Diff className="w-3 h-3" /> Changes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 scrollbar-hide bg-black/20">
        {selectedFile && (
          <div className="mx-2 mb-2 p-2 bg-white/5 border border-white/10 rounded-[2px] flex items-center justify-between">
            <div className="flex items-center gap-2 overflow-hidden">
              <FileCode className="w-3 h-3 text-gitlab-orange shrink-0" />
              <span className="text-[10px] text-zinc-400 truncate font-mono">{selectedFile}</span>
            </div>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-zinc-600 hover:text-white transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeTab === 'branches' && (
            <motion.div
              key="branches"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-2 pt-2">
                <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Source Control</h3>
                {isLoading.branches && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
              </div>
              
              {status && (
                <div className={`mx-2 p-2 rounded-[1px] flex items-center gap-2 text-[10px] ${status.type === 'success' ? 'bg-green-500/5 text-green-400 border border-green-500/10' : 'bg-red-500/5 text-red-400 border border-red-500/10'}`}>
                  {status.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                  {status.message}
                </div>
              )}

              <div className="space-y-0.5">
                {branches.all.map((b) => (
                  <button
                    key={b}
                    onClick={() => handleCheckout(b)}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 rounded-[1px] group transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <GitBranch className="w-3.5 h-3.5 text-zinc-700 group-hover:text-gitlab-orange" />
                      <span className="text-[11px] text-zinc-400 group-hover:text-white font-medium">{b}</span>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 text-[8px] font-bold text-gitlab-orange uppercase tracking-tighter">Checkout</div>
                  </button>
                ))}
                {branches.all.length === 0 && !isLoading.branches && (
                  <div className="text-center py-12 text-zinc-700 text-[10px] font-medium uppercase tracking-widest italic">No branches detected</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between px-2 pt-2">
                <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Project Explorer</h3>
                {isLoading.files && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
              </div>
              
              <div className="py-1">
                {renderTree(buildTree(files))}
                {files.length === 0 && !isLoading.files && (
                  <div className="text-center py-12 text-zinc-700 text-[10px] font-medium uppercase tracking-widest italic">Empty repository</div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'diff' && (
            <motion.div
              key="diff"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between px-2 pt-2">
                <h3 className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Working Tree Diff</h3>
                {isLoading.diff && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
              </div>
              
              <div className="bg-zinc-950/80 rounded-[2px] border border-white/5 p-4 font-mono text-[10px] overflow-x-auto shadow-inner min-h-[200px]">
                <pre className="text-zinc-500 whitespace-pre-wrap leading-relaxed">
                  {diff || "No uncommitted changes detected."}
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
