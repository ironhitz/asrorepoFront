import React, { useState, useEffect } from 'react';
import { GitPullRequest, GitMerge, GitBranch, Loader2, ExternalLink, MessageSquare, Clock, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface MergeRequestsProps {
  projectId: string;
  mergeRequests?: any[];
}

const MergeRequests: React.FC<MergeRequestsProps> = ({ projectId, mergeRequests }) => {
  const [mrs, setMrs] = useState<any[]>(mergeRequests || []);
  const [loading, setLoading] = useState(!mergeRequests);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mergeRequests) {
      setMrs(mergeRequests);
      setLoading(false);
      return;
    }

    const fetchMRs = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/gitlab/merge_requests?projectId=${projectId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setMrs(data);
        } else {
          setMrs([]);
        }
      } catch (err) {
        setError('Failed to fetch merge requests from GitLab.');
      } finally {
        setLoading(false);
      }
    };

    fetchMRs();
  }, [projectId]);

  const getStatusColor = (state: string) => {
    switch (state.toLowerCase()) {
      case 'opened': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'merged': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'closed': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-gitlab-orange animate-spin mb-4" />
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Fetching GitLab Merge Requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Merge Requests</h2>
          <p className="text-zinc-500 mt-1">Track security patches and code reviews in GitLab.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-zinc-900 border border-white/5 rounded-xl">
            <span className="text-[10px] text-zinc-500 uppercase font-bold block">Active MRs</span>
            <span className="text-xl font-bold text-white">{mrs.filter(m => m.state === 'opened').length}</span>
          </div>
        </div>
      </div>

      {mrs.length === 0 ? (
        <div className="bg-zinc-900 border border-white/5 p-12 rounded-3xl flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-500/10 rounded-full flex items-center justify-center mb-4">
            <GitPullRequest className="w-8 h-8 text-zinc-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Merge Requests Found</h3>
          <p className="text-zinc-500 max-w-md">
            There are no merge requests for this project. 
            Propose a security fix using the <code className="text-gitlab-orange">asro mr create</code> command.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {mrs.map((mr) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={mr.id}
              className="bg-zinc-900 border border-white/5 p-6 rounded-2xl hover:border-white/10 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(mr.state)}`}>
                      {mr.state}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">!{mr.iid}</span>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{new Date(mr.created_at).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white group-hover:text-gitlab-orange transition-colors">{mr.title}</h4>
                  
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <User className="w-3.5 h-3.5" />
                      <span>{mr.author.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <GitBranch className="w-3.5 h-3.5" />
                      <span>{mr.source_branch} → {mr.target_branch}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{mr.user_notes_count} comments</span>
                    </div>
                  </div>

                  {mr.has_conflicts && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-red-500 font-bold uppercase tracking-widest">Merge Conflict Detected</span>
                      <button className="ml-auto px-3 py-1 bg-red-500 text-white text-[10px] font-bold rounded-lg uppercase tracking-widest hover:bg-red-600 transition-all">
                        Resolve with AI
                      </button>
                    </div>
                  )}
                </div>
                <a 
                  href={mr.web_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5"
                >
                  <ExternalLink className="w-4 h-4 text-zinc-400" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MergeRequests;
