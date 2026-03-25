export async function run(context, args) {
  const git = context.gitAdapter;
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  if (git) {
    await git.push();
  }
  
  const projectId = context.config.gitlabProjectId;
  const branch = args[0] || 'main';
  
  const response = await gitlab.post(`/projects/${encodeURIComponent(projectId)}/pipeline?ref=${branch}`);
  
  return {
    output: `[SUCCESS] Pipeline triggered.\nPipeline ID: ${response.id}\nStatus: ${response.status}\nURL: ${response.web_url}`,
    data: { pipelineId: response.id, status: response.status }
  };
}