export async function run(context, args) {
  const gitlab = context.gitlabClient;
  const ai = context.aiClient;
  
  if (!gitlab || !ai) {
    return { output: 'Error: GitLab or AI client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const vulnerability = args.join(' ');
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a security patch for this vulnerability: ${vulnerability}. Return JSON with "patch" (unified diff) and "description".`,
    config: { responseMimeType: 'application/json' }
  });
  
  let patchData;
  try {
    patchData = JSON.parse(response.text);
  } catch (e) {
    return { output: `Failed to generate patch: ${response.text}` };
  }
  
  const branchName = `security-patch-${Date.now()}`;
  const branchRes = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/repository/branches/main`);
  const baseSha = branchRes.commit.id;
  
  await gitlab.post(`/projects/${encodeURIComponent(projectId)}/repository/branches`, {
    branch: branchName,
    ref: baseSha
  });
  
  return {
    output: `[SUCCESS] Security patch branch created: ${branchName}\nDescription: ${patchData.description || 'Automated security patch'}\n\nPatch:\n${patchData.patch || 'No patch generated'}`,
    data: { branchName, patch: patchData }
  };
}