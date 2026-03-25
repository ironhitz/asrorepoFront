export async function run(context, args) {
  const gitlab = context.gitlabClient;
  
  if (!gitlab) {
    return { output: 'Error: GitLab client not configured.' };
  }
  
  const user = await gitlab.get('/user');
  
  return {
    output: `User: ${user.name} (@${user.username})\nEmail: ${user.email}\nID: ${user.id}`,
    data: { user }
  };
}