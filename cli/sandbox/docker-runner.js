import { execSync, exec } from "child_process";
import path from "path";
import fs from "fs";

const DOCKER_IMAGE = process.env.ASRO_PLUGIN_IMAGE || "node:18-alpine";
const DEFAULT_TIMEOUT = 30000;

export class DockerSandbox {
  constructor(options = {}) {
    this.image = options.image || DOCKER_IMAGE;
    this.timeout = options.timeout || DEFAULT_TIMEOUT;
    this.networkEnabled = options.networkEnabled || false;
    this.memoryLimit = options.memoryLimit || "256m";
    this.cpuLimit = options.cpuLimit || "0.5";
  }

  async runPlugin(pluginPath, input = {}, options = {}) {
    const pluginName = path.basename(pluginPath);
    const containerName = `asro-sandbox-${pluginName}-${Date.now()}`;
    const timeout = options.timeout || this.timeout;

    const dockerOpts = [
      "--rm",
      "--name", containerName,
      "--memory", this.memoryLimit,
      "--cpus", this.cpuLimit,
      "--network", this.networkEnabled ? "bridge" : "none",
      "-v", `${pluginPath}:/app:ro`,
      "-w", "/app"
    ];

    const inputFile = `/tmp/asro-input-${Date.now()}.json`;
    fs.writeFileSync(inputFile, JSON.stringify(input));

    dockerOpts.push("-v", `${inputFile}:/input:ro`);
    dockerOpts.push("-e", `ASRO_INPUT=/input`);

    const cmd = `docker run ${dockerOpts.join(" ")} ${this.image} sh -c "node /app/index.js < /input"`;

    try {
      const result = execSync(cmd, {
        timeout,
        encoding: "utf-8",
        env: { ...process.env, ASRO_MODE: "sandbox" }
      });

      fs.unlinkSync(inputFile);

      return {
        success: true,
        output: result.trim(),
        sandbox: {
          containerName,
          plugin: pluginName,
          timeout,
          memory: this.memoryLimit
        }
      };
    } catch (error) {
      try { fs.unlinkSync(inputFile); } catch {}
      try { execSync(`docker kill ${containerName} 2>/dev/null`, { stdio: "ignore" }); } catch {}

      return {
        success: false,
        error: error.message,
        sandbox: {
          containerName,
          plugin: pluginName,
          error: "Execution failed"
        }
      };
    }
  }

  async runPluginAsync(pluginPath, input = {}, callback) {
    const pluginName = path.basename(pluginPath);
    const containerName = `asro-sandbox-${pluginName}-${Date.now()}`;
    const timeout = options.timeout || this.timeout;

    const dockerOpts = [
      "--rm",
      "--name", containerName,
      "--memory", this.memoryLimit,
      "--cpus", this.cpuLimit,
      "--network", this.networkEnabled ? "bridge" : "none",
      "-v", `${pluginPath}:/app:ro`,
      "-w", "/app"
    ];

    const inputFile = `/tmp/asro-input-${Date.now()}.json`;
    fs.writeFileSync(inputFile, JSON.stringify(input));

    dockerOpts.push("-v", `${inputFile}:/input:ro`);

    const cmd = `docker run ${dockerOpts.join(" ")} ${this.image} sh -c "node /app/index.js < /input"`;

    exec(cmd, { timeout, env: { ...process.env, ASRO_MODE: "sandbox" } }, (error, stdout, stderr) => {
      try { fs.unlinkSync(inputFile); } catch {}
      
      if (error) {
        callback({ success: false, error: error.message });
      } else {
        callback({ success: true, output: stdout.trim() });
      }
    });
  }

  cleanup() {
    try {
      execSync("docker ps -aq --filter 'name=asro-sandbox-' | xargs -r docker rm -f", {
        stdio: "ignore"
      });
    } catch {}
  }
}

export function createSandbox(options) {
  return new DockerSandbox(options);
}

export async function runPluginInSandbox(pluginPath, input = {}, options = {}) {
  const sandbox = new DockerSandbox(options);
  return sandbox.runPlugin(pluginPath, input);
}

export async function isDockerAvailable() {
  try {
    execSync("docker --version", { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

export function getSandboxConfig() {
  return {
    image: DOCKER_IMAGE,
    timeout: DEFAULT_TIMEOUT,
    memory: "256m",
    cpu: "0.5",
    network: false
  };
}