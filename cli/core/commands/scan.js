export async function run(context, args) {
  const gitlab = context.gitlabClient;
  const ai = context.aiClient;
  
  if (!gitlab || !ai) {
    return { output: 'Error: GitLab or AI client not configured.' };
  }
  
  const projectId = context.config.gitlabProjectId;
  const targetPath = args[0] || '';
  
  const filesRes = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/repository/tree?recursive=true${targetPath ? `&path=${encodeURIComponent(targetPath)}` : ''}`);
  const files = Array.isArray(filesRes) ? filesRes : [];
  
  const output = `Scanning repository for vulnerabilities...\n[INFO] Found ${files.length} items.\n[INFO] Analyzing with AI...\n`;
  
  const codeFiles = files.filter((f) => f.type === 'blob' && 
    (f.path.endsWith('.ts') || f.path.endsWith('.js') || f.path.endsWith('.py') || f.path.endsWith('.go'))).slice(0, 5);
  
  const findings = [];
  let scanOutput = output;
  
  for (const file of codeFiles) {
    scanOutput += `[INFO] Analyzing ${file.path}...\n`;
    const contentRes = await gitlab.get(`/projects/${encodeURIComponent(projectId)}/repository/files/${encodeURIComponent(file.path)}/raw?ref=main`);
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze for security vulnerabilities. Return JSON with "vulnerabilities" array (title, description, severity, file). Empty array if none. File: ${file.path}\n\nCode:\n${contentRes}`,
        config: { responseMimeType: 'application/json' }
      });
      
      const result = JSON.parse(response.text);
      if (result.vulnerabilities?.length > 0) {
        findings.push(...result.vulnerabilities.map((v) => ({ ...v, file: file.path })));
        scanOutput += `[WARN] Found ${result.vulnerabilities.length} issue(s)\n`;
      } else {
        scanOutput += `[INFO] No vulnerabilities found\n`;
      }
    } catch (e) {
      scanOutput += `[ERROR] Failed to analyze ${file.path}\n`;
    }
  }
  
  scanOutput += `[SUCCESS] Scan complete. ${findings.length} vulnerabilities detected.`;
  
  return {
    output: scanOutput,
    data: { findings, fileCount: files.length }
  };
}