export async function run(context, args) {
  const ai = context.aiClient;
  
  const agents = [
    { name: 'Gemini-3-Flash', role: 'Scanner', status: ai ? 'Online' : 'Offline' },
    { name: 'Gemini-Pro', role: 'Patch Generator', status: ai ? 'Online' : 'Offline' },
    { name: 'ASRO-Orchestrator', role: 'Coordinator', status: 'Online' }
  ];
  
  const output = 'Active AI Agents:\n' + 
    agents.map((a) => `- ${a.name} (${a.role}): ${a.status}`).join('\n');
  
  if (args[0] === 'run' && ai) {
    const agentName = args[1];
    return {
      output: `[INFO] Running agent: ${agentName || 'all'}`,
      data: { agents, running: agentName || 'all' }
    };
  }
  
  return { output, data: { agents } };
}