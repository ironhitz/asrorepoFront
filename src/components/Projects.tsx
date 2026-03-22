import React, { useState } from 'react';
import { Globe, Plus, Trash2, ExternalLink, Loader2, Search, AlertCircle, Copy, Check } from 'lucide-react';
import { GitLabProject } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../supabase';
import { 
  parseGitLabProjectLink, 
  describeGitLabProject, 
  getProjectLinkExamples,
  isValidGitLabProjectLink 
} from '../utils/gitlabProjectParser';

interface ProjectsProps {
  projects: GitLabProject[];
  selectedProjectId: string;
  setSelectedProjectId: (id: string) => void;
  user: any;
}

const Projects: React.FC<ProjectsProps> = ({ projects, selectedProjectId, setSelectedProjectId, user }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProjectId, setNewProjectId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectId.trim()) return;

    setIsAdding(true);
    try {
      // Parse the input (could be ID, HTTPS URL, or SSH URL)
      const parsed = parseGitLabProjectLink(newProjectId);
      
      if (!parsed) {
        alert(
          'Invalid GitLab project link. Please provide:\n' +
          '• Project ID (e.g., 79598942)\n' +
          '• HTTPS URL (e.g., https://gitlab.com/group/project)\n' +
          '• SSH URL (e.g., git@gitlab.com:group/project.git)'
        );
        setIsAdding(false);
        return;
      }

      // Fetch project info using the parsed project ID
      const res = await fetch(`/api/gitlab/project?projectId=${encodeURIComponent(parsed.projectId)}`);
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
          addedAt: new Date().toISOString(),
          addedBy: user.id
        };

        await supabase.from('projects').insert(projectToSave);
        setSelectedProjectId(data.id.toString());
        setIsAddModalOpen(false);
        setNewProjectId('');
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

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to remove this project from ASRO?")) {
      try {
        await supabase.from('projects').delete().eq('id', projectId);
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
          className="flex items-center gap-2 bg-gitlab-orange text-white px-6 py-3 rounded-2xl font-bold hover:bg-gitlab-orange/90 transition-all active:scale-95 shadow-[0_0_20px_rgba(226,67,41,0.2)]"
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
          className="w-full bg-zinc-900 border border-white/5 rounded-2xl pl-12 pr-4 py-4 text-white outline-none focus:border-gitlab-orange/30 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <motion.div
            layout
            key={project.id}
            onClick={() => setSelectedProjectId(project.id.toString())}
            className={`group relative bg-zinc-900 border rounded-3xl p-6 cursor-pointer transition-all duration-300 ${
              selectedProjectId === project.id.toString() 
                ? 'border-gitlab-orange bg-gitlab-orange/5 shadow-[0_0_30px_rgba(226,67,41,0.1)]' 
                : 'border-white/5 hover:border-white/10 hover:bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
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
                  className="p-2 hover:bg-white/10 rounded-xl text-zinc-500 hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                <button 
                  onClick={(e) => handleDeleteProject(project.id.toString(), e)}
                  className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1 truncate">{project.name}</h3>
            <p className="text-sm text-zinc-500 mb-4 truncate">{project.path_with_namespace}</p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${selectedProjectId === project.id.toString() ? 'bg-gitlab-orange animate-pulse' : 'bg-zinc-700'}`}></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  {selectedProjectId === project.id.toString() ? 'Active' : 'Standby'}
                </span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono">ID: {project.id}</span>
            </div>
          </motion.div>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
            <p className="text-zinc-500 max-w-xs">
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
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Add GitLab Project</h3>
                  <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleAddProject} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase mb-3">GitLab Project</label>
                    <input
                      type="text"
                      value={newProjectId}
                      onChange={(e) => setNewProjectId(e.target.value)}
                      placeholder="Project ID, HTTPS URL, or SSH link"
                      className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 outline-none focus:border-gitlab-orange/50 transition-all"
                      autoFocus
                    />
                    
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Supported Formats:</p>
                      <div className="space-y-1.5 text-[10px] text-zinc-500 font-mono">
                        <div className="p-2 bg-black/50 rounded border border-white/5 flex items-center justify-between group">
                          <span>Project ID: <span className="text-gitlab-orange">79598942</span></span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewProjectId('79598942');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-2 bg-black/50 rounded border border-white/5 flex items-center justify-between group">
                          <span>HTTPS: <span className="text-blue-400">https://gitlab.com/group/project</span></span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewProjectId('https://gitlab.com/group/project');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="p-2 bg-black/50 rounded border border-white/5 flex items-center justify-between group">
                          <span>SSH: <span className="text-green-400">git@gitlab.com:group/project.git</span></span>
                          <button
                            type="button"
                            onClick={() => {
                              setNewProjectId('git@gitlab.com:group/project.git');
                            }}
                            className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-white transition-all"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {newProjectId && !isValidGitLabProjectLink(newProjectId) && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-400">
                          Invalid format. Please use Project ID, HTTPS URL, or SSH link.
                        </p>
                      </div>
                    )}

                    {newProjectId && isValidGitLabProjectLink(newProjectId) && (
                      <div className="mt-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <p className="text-xs text-emerald-400">
                          {describeGitLabProject(parseGitLabProjectLink(newProjectId)!)}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isAdding || !newProjectId.trim() || !isValidGitLabProjectLink(newProjectId)}
                    className="w-full bg-gitlab-orange text-white py-4 rounded-2xl font-bold hover:bg-gitlab-orange/90 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
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
