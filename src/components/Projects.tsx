import React, { useState } from 'react';
import { Globe, Plus, Trash2, ExternalLink, Loader2, Search, AlertCircle, Link, X } from 'lucide-react';
import { GitLabProject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

interface ProjectsProps {
  projects: GitLabProject[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  user: any;
}

const Projects: React.FC<ProjectsProps> = ({ projects, selectedProjectId, setSelectedProjectId, user }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProjectId, setNewProjectId] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectId.trim() && !newRepoUrl.trim()) return;

    setIsAdding(true);
    try {
      const query = newRepoUrl.trim() 
        ? `repoUrl=${encodeURIComponent(newRepoUrl.trim())}` 
        : `projectId=${newProjectId.trim()}`;
        
      const res = await fetch(`/api/gitlab/project?${query}`);
      const data = await res.json();
      
      if (!res.ok) {
        if (data.error === "GitLab configuration missing") {
          alert("GitLab configuration missing. Please set GITLAB_TOKEN in AI Studio Settings.");
        } else {
          alert(data.error || "Failed to fetch project.");
        }
        setIsAdding(false);
        return;
      }

      if (data.id) {
        // Check if already in list
        if (projects.some(p => p.id.toString() === data.id.toString())) {
          alert("Project already added.");
          setIsAdding(false);
          return;
        }

        const projectToSave = {
          id: data.id.toString(),
          name: data.name,
          path_with_namespace: data.path_with_namespace,
          avatar_url: data.avatar_url || '',
          web_url: data.web_url,
          star_count: data.star_count,
          forks_count: data.forks_count,
          last_activity_at: data.last_activity_at,
          addedAt: new Date().toISOString(),
          user_id: user.uid
        };

        await addDoc(collection(db, 'projects'), projectToSave);

        setSelectedProjectId(data.id.toString());
        setIsAddModalOpen(false);
        setNewProjectId('');
        setNewRepoUrl('');
      } else {
        alert("Project not found or invalid Project ID.");
      }
    } catch (error) {
      console.error("Failed to add project:", error);
      alert("Failed to add project. Check console for details.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteProject = async (firestoreId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this project from ASRO?")) {
      try {
        await deleteDoc(doc(db, 'projects', firestoreId));
      } catch (error) {
        console.error("Failed to delete project:", error);
      }
    }
  };

  const filteredProjects = projects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.path_with_namespace.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">GitLab Projects</h2>
          <p className="text-zinc-500 mt-1">Manage the repositories monitored by ASRO.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-b from-gitlab-orange to-gitlab-light-orange text-white px-6 py-3 rounded-[2px] font-bold hover:shadow-[0_4px_20px_rgba(226,67,41,0.4)] transition-all active:scale-95 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
        <input 
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-950 border border-white/10 rounded-[2px] pl-12 pr-4 py-4 text-white outline-none focus:border-gitlab-orange/30 transition-all shadow-inner"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            layout
            key={project.id}
            onClick={() => setSelectedProjectId(project.id.toString())}
            className={`group relative bg-zinc-900/50 border rounded-[2px] p-6 cursor-pointer transition-all duration-300 shadow-lg overflow-hidden ${
              selectedProjectId === project.id.toString() 
                ? 'border-gitlab-orange bg-gitlab-orange/5 shadow-[0_0_30px_rgba(226,67,41,0.15)]' 
                : 'border-white/10 hover:border-white/20 hover:bg-zinc-900'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-gitlab-orange/5 to-transparent opacity-0 transition-opacity duration-500 ${selectedProjectId === project.id.toString() ? 'opacity-100' : 'group-hover:opacity-100'}`} />
            
            <div className="flex items-start justify-between mb-4 relative z-10">
              <div className="w-12 h-12 bg-zinc-950 rounded-[2px] flex items-center justify-center overflow-hidden border border-white/10 shadow-inner">
                {project.avatar_url ? (
                  <img src={project.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Globe className="w-6 h-6 text-zinc-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={project.web_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-2 hover:bg-white/10 rounded-[2px] text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button 
                  onClick={(e) => handleDeleteProject((project as any).firestoreId, e)}
                  className="p-2 hover:bg-red-500/10 rounded-[2px] text-zinc-500 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="relative z-10">
              <h3 className="text-lg font-bold text-white mb-1 truncate tracking-tight group-hover:text-gitlab-orange transition-colors">{project.name}</h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 truncate opacity-70">{project.path_with_namespace}</p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 bg-black/20 -mx-6 px-6 py-3">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${selectedProjectId === project.id.toString() ? 'bg-gitlab-orange animate-pulse' : 'bg-zinc-700'}`}></div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    {selectedProjectId === project.id.toString() ? 'Active' : 'Standby'}
                  </span>
                </div>
                <span className="text-[10px] text-zinc-600 font-mono font-bold">ID: {project.id}</span>
              </div>
            </div>
          </motion.div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-zinc-900/20 border border-dashed border-white/5 rounded-[2px]">
            <div className="w-16 h-16 bg-white/5 rounded-[2px] flex items-center justify-center mb-4 border border-white/5">
              <AlertCircle className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No projects found</h3>
            <p className="text-zinc-500 max-w-xs text-xs font-bold uppercase tracking-widest opacity-60">
              {searchQuery ? `No projects matching "${searchQuery}"` : "You haven't added any GitLab projects yet."}
            </p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2px] shadow-[0_32px_64px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="p-8 bg-gradient-to-b from-zinc-900 to-zinc-950">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold text-white tracking-tight uppercase">Add GitLab Project</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-[2px] text-zinc-500 hover:text-white border border-transparent hover:border-white/10 transition-all">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddProject} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">GitLab Project ID</label>
                      <input
                        type="text"
                        value={newProjectId}
                        onChange={(e) => setNewProjectId(e.target.value)}
                        placeholder="e.g., 7071551"
                        className="w-full bg-zinc-950 border border-white/10 rounded-[2px] px-4 py-3 text-white placeholder:text-zinc-700 outline-none focus:border-gitlab-orange/50 transition-all shadow-inner font-mono text-sm"
                      />
                    </div>
                    <div className="relative flex items-center py-2">
                      <div className="flex-grow border-t border-white/5"></div>
                      <span className="flex-shrink mx-4 text-zinc-600 text-[10px] font-bold uppercase tracking-widest">OR</span>
                      <div className="flex-grow border-t border-white/5"></div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Repository URL</label>
                      <input
                        type="text"
                        value={newRepoUrl}
                        onChange={(e) => setNewRepoUrl(e.target.value)}
                        placeholder="e.g., https://gitlab.com/group/project"
                        className="w-full bg-zinc-950 border border-white/10 rounded-[2px] px-4 py-3 text-white placeholder:text-zinc-700 outline-none focus:border-gitlab-orange/50 transition-all shadow-inner font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-gitlab-orange/5 border border-gitlab-orange/10 p-4 rounded-[2px] shadow-inner">
                    <h4 className="text-[10px] font-bold text-gitlab-orange uppercase tracking-widest mb-1">Guidelines</h4>
                    <ul className="text-[10px] text-zinc-500 space-y-1 list-disc pl-3 font-bold opacity-80">
                      <li>Ensure your GITLAB_TOKEN has 'api' and 'read_repository' scopes.</li>
                      <li>Project IDs are numeric (found on project home page).</li>
                      <li>URLs should be the full HTTPS path to the repository.</li>
                    </ul>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isAdding || (!newProjectId.trim() && !newRepoUrl.trim())}
                    className="w-full bg-gradient-to-b from-gitlab-orange to-gitlab-light-orange text-white py-4 rounded-[2px] font-bold text-[10px] uppercase tracking-widest hover:shadow-[0_4px_20px_rgba(226,67,41,0.4)] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg active:shadow-inner"
                  >
                    {isAdding ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        Add Project
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
