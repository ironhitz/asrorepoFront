export async function run(context, args) {
  const git = context.gitAdapter;
  const ai = context.aiClient;
  
  if (!git) {
    return { output: 'Error: Git adapter not configured.' };
  }
  
  try {
    const status = await git.status();
    
    if (!status || status.length === 0) {
      return { output: 'Nothing to commit. No changes detected.' };
    }
    
    const diff = await git.diff();
    let commitMessage = args.join(' ');
    
    if (!commitMessage && ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Generate a concise git commit message for these changes:\n\nDiff:\n${diff.slice(0, 2000)}`,
          config: { responseMimeType: 'text/plain' }
        });
        commitMessage = response.text.trim();
      } catch (e) {
        commitMessage = 'Automated commit via ASRO';
      }
    }
    
    if (!commitMessage) {
      commitMessage = 'Automated commit via ASRO';
    }
    
    await git.add('.');
    const result = await git.commit(commitMessage);
    
    return {
      output: `[SUCCESS] Changes committed.\nMessage: ${commitMessage}\n${result}`,
      data: { message: commitMessage }
    };
  } catch (error) {
    return { output: `Error: ${error.message}` };
  }
}