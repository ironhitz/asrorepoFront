export async function run(context, args) {
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const project = await gitlab.get(`/projects/${encodeURIComponent(projectId)}`);
  
  return {
    output: `Project: ${project.name_with_namespace}\nID: ${project.id}\nVisibility: ${project.visibility}\nDefault Branch: ${project.default_branch}\nURL: ${project.web_url}`,
    data: { project }
  };
}