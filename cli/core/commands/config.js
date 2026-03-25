export async function run(context, args) {
  const config = context.config;
  
  return {
    output: `Configuration:\n- GITLAB_BASE_URL: ${config.gitlabBaseUrl || 'https://gitlab.com/api/v4'}\n- GITLAB_PROJECT_ID: ${config.gitlabProjectId || 'Not set'}\n- AI_MODEL: gemini-3-flash-preview\n- SCAN_DEPTH: deep\n- TENANT_ID: ${config.tenantId || 'default'}`,
    data: { config }
  };
}