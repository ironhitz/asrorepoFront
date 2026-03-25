export async function run(context, args) {
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const action = args[0] || 'list';
  
  if (action === 'run') {
    const response = await gitlab.post(`/projects/${encodeURIComponent(projectId)}/pipeline?ref=main`);
    return {
      output: `[SUCCESS] Pipeline triggered.\nPipeline ID: ${response.id}\nStatus: ${response.status}\nURL: ${response.web_url}`,
      data: { pipelineId: response.id }
    };
  }
  
  const pipelines = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/pipelines?per_page=5`);
  const output = 'Recent Pipelines:\n' + 
    (Array.isArray(pipelines) ? pipelines.map((p) => `- #${p.id}: ${p.status} (${p.ref})`).join('\n') : 'No pipelines found');
  
  return { output, data: { pipelines } };
}