import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class NodeGitAdapter {
  constructor(cwd = process.cwd()) {
    this.cwd = cwd;
  }

  async exec(command) {
    try {
      const { stdout, stderr } = await execAsync(command, { cwd: this.cwd });
      return stdout || stderr;
    } catch (error) {
      throw new Error(`Git command failed: ${error.message}`);
    }
  }

  async status() {
    const output = await this.exec('git status --porcelain');
    if (!output.trim()) return [];
    return output.split('\n').filter(line => line.trim());
  }

  async diff() {
    return this.exec('git diff --no-color');
  }

  async add(files = '.') {
    return this.exec(`git add ${files}`);
  }

  async commit(message) {
    return this.exec(`git commit -m "${message}"`);
  }

  async push(remote = 'origin', branch = 'main') {
    return this.exec(`git push ${remote} ${branch}`);
  }

  async pull(remote = 'origin', branch = 'main') {
    return this.exec(`git pull ${remote} ${branch}`);
  }

  async branch() {
    const output = await this.exec('git branch --show-current');
    return output.trim();
  }

  async log(count = 10) {
    return this.exec(`git log -${count} --oneline`);
  }

  async remote() {
    const output = await this.exec('git remote get-url origin');
    return output.trim();
  }

  async isRepo() {
    try {
      await this.exec('git rev-parse --git-dir');
      return true;
    } catch {
      return false;
    }
  }
}

export function createNodeGitAdapter(cwd) {
  return new NodeGitAdapter(cwd);
}