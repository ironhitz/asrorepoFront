export async function run(context, args) {
  const gitlab = context.gitlabClient;
  const git = context.gitAdapter;
  
  let output = 'ASRO Doctor - Repository Health Check\n';
  let issues = 0;
  
  if (gitlab) {
    try {
      const projectId = context.config.gitlabProjectId;
      const project = await gitlab.get(`/projects/${encodeURIComponent(projectId)}`);
      output += `[OK] GitLab project accessible: ${project.name_with_namespace}\n`;
    } catch (e) {
      output += `[ERROR] GitLab project not accessible: ${e.message}\n`;
      issues++;
    }
  } else {
    output += `[WARN] GitLab client not configured\n`;
  }
  
  if (git) {
    try {
      const status = await git.status();
      output += `[OK] Git repository accessible\n`;
      if (status.length > 0) {
        output += `[INFO] ${status.length} uncommitted changes\n`;
      }
    } catch (e) {
      output += `[ERROR] Git repository not accessible\n`;
      issues++;
    }
  } else {
    output += `[INFO] Git adapter not configured (API mode)\n`;
  }
  
  output += issues === 0 ? '\n[SUCCESS] No issues detected.' : `\n[WARN] ${issues} issue(s) detected.`;
  
  return { output, data: { issues } };
}