import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, ChevronRight, Command, Minus, Maximize2, Anchor, Copy, Download, Trash2, Loader2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  userId: string;
  onFindings?: (findings: any[]) => void;
  onProjectAdded?: (target: string) => Promise<void>;
}

const ASCII_ART = `
    ___   _____ ____  ____ 
   /   | / ___// __ \\/ __ \\
  / /| | \\__ \\/ /_/ / / / /
 / ___ |___/ / _, _/ /_/ / 
/_/  |_/____/_/ |_|\\____/  
AI Security Orchestration v1.0.0
`;

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, projectId, userId, onFindings, onProjectAdded }) => {
  const [history, setHistory] = useState<{ type: 'cmd' | 'out', text: string, timestamp: string }[]>([
    { type: 'out', text: ASCII_ART, timestamp: new Date().toLocaleTimeString() },
    { type: 'out', text: "Type 'asro help' to see available commands.", timestamp: new Date().toLocaleTimeString() },
    { type: 'out', text: "\n[GUIDELINES]\n- Use 'asro project add <ID|URL>' to monitor new repositories.\n- Run 'asro scan' to identify vulnerabilities using AI and GitLab pipelines.\n- Use 'asro mr create <title>' to propose security fixes.\n- Run 'asro compliance check' for automated governance auditing.\n- Use 'asro threat-model generate' for predictive analysis.\n- All actions are logged for compliance auditing.", timestamp: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState('');
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDocked, setIsDocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isMinimized]);

  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const cmd = input.trim();
    const timestamp = new Date().toLocaleTimeString();
    
    setHistory(prev => [...prev, { type: 'cmd', text: cmd, timestamp }]);
    setCmdHistory(prev => [cmd, ...prev]);
    setHistoryIndex(-1);
    setInput('');

    if (cmd === 'asro clear' || cmd === 'clear') {
      setHistory([{ type: 'out', text: ASCII_ART, timestamp }]);
      return;
    }

    if (cmd === 'asro exit' || cmd === 'exit') {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
      const [command, ...args] = cmd.split(" ");

      const response = await fetch('/api/cli/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          command: cmd, // Keep full command for engine
          args, 
          projectId, 
          userId 
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        setHistory(prev => [...prev, { type: 'out', text: `Error: Server returned ${response.status} ${response.statusText}\n${errorText}`, timestamp }]);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      const outputText = data.output || (data.success ? '✅ Done' : '❌ Command failed');
      setHistory(prev => [...prev, { type: 'out', text: outputText, timestamp: data.timestamp || timestamp }]);
      
      if (data.action === 'PROJECT_ADD' && data.data?.target && onProjectAdded) {
        try {
          await onProjectAdded(data.data.target);
          setHistory(prev => [...prev, { type: 'out', text: `[SUCCESS] Project ${data.data.target} added to ASRO dashboard.`, timestamp: new Date().toLocaleTimeString() }]);
        } catch (error) {
          setHistory(prev => [...prev, { type: 'out', text: `[ERROR] Failed to add project: ${error instanceof Error ? error.message : String(error)}`, timestamp: new Date().toLocaleTimeString() }]);
        }
      }

      if (data.data?.findings && onFindings) {
        onFindings(data.data.findings);
      }
    } catch (error) {
      console.error("Terminal Execution Error:", error);
      setHistory(prev => [...prev, { type: 'out', text: `Error: Failed to execute command. ${error instanceof Error ? error.message : String(error)}`, timestamp }]);
    } finally {
      setIsLoading(false);
    }
  };

  const [copiedId, setCopiedId] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedId(index);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < cmdHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  const copyHistory = () => {
    const text = history.map(h => `${h.type === 'cmd' ? '$ ' : ''}${h.text}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  const downloadLogs = () => {
    const text = history.map(h => `[${h.timestamp}] ${h.type === 'cmd' ? '$ ' : ''}${h.text}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `asro-cli-logs-${Date.now()}.txt`;
    a.click();
  };

  const terminalClasses = `
    fixed z-50 flex flex-col overflow-hidden transition-all duration-300 shadow-[0_32px_64px_rgba(0,0,0,0.8)]
    ${isDocked ? 'bottom-0 left-0 right-0 w-full h-[300px] rounded-t-[2px]' : 
      isMaximized ? 'inset-0 w-full h-full rounded-none' : 
      isMinimized ? 'bottom-8 right-8 w-64 h-12 rounded-[2px]' : 
      'bottom-8 right-8 w-[700px] h-[450px] rounded-[2px]'}
    bg-zinc-950 border border-white/10
  `;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          drag={!isDocked && !isMaximized && !isMinimized}
          dragMomentum={false}
          className={terminalClasses}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-gradient-to-b from-zinc-900 to-zinc-950 cursor-move shadow-md relative z-10">
            <div className="flex items-center gap-3">
              <TerminalIcon className="w-4 h-4 text-gitlab-orange" />
              <span className="text-[10px] font-bold text-white uppercase tracking-widest">ASRO Terminal v1.0.4</span>
              {isLoading && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/5 rounded-[2px] text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsMaximized(!isMaximized); setIsDocked(false); }} className="p-1.5 hover:bg-white/5 rounded-[2px] text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsDocked(!isDocked); setIsMaximized(false); }} className="p-1.5 hover:bg-white/5 rounded-[2px] text-zinc-500 hover:text-white transition-all border border-transparent hover:border-white/10">
                <Anchor className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-[2px] text-zinc-500 hover:text-gitlab-orange transition-all border border-transparent hover:border-white/10">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 border-b border-white/5 shadow-inner">
                <button onClick={copyHistory} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button onClick={downloadLogs} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
                  <Download className="w-3 h-3" /> Download
                </button>
                <button onClick={() => setHistory([{ type: 'out', text: ASCII_ART, timestamp: new Date().toLocaleTimeString() }])} className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-3 scrollbar-hide bg-black/40 shadow-inner"
              >
                {history.map((item, i) => (
                  <div key={i} className="group relative">
                    <span className="absolute -left-4 top-0 text-[8px] font-bold text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      [{item.timestamp}]
                    </span>
                    <div className="flex items-start justify-between gap-2">
                      <div className={item.type === 'cmd' ? 'text-gitlab-light-orange font-bold flex-1' : 'text-zinc-300 whitespace-pre-wrap leading-relaxed flex-1'}>
                        {item.type === 'cmd' && <span className="text-zinc-600 mr-3">$</span>}
                        {item.text}
                      </div>
                      {item.text !== ASCII_ART && (
                        <button 
                          onClick={() => copyToClipboard(item.text, i)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded-[2px] text-zinc-500 hover:text-white transition-all shrink-0"
                          title="Copy to clipboard"
                        >
                          {copiedId === i ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCommand} className="p-4 border-t border-white/10 bg-zinc-900/50 flex items-center gap-3 shadow-[0_-4px_12px_rgba(0,0,0,0.2)]">
                <ChevronRight className="w-4 h-4 text-gitlab-orange" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-zinc-800"
                  placeholder="Enter asro command..."
                  autoFocus
                />
                <div className="flex items-center gap-2 px-2 py-1 bg-white/5 rounded-[2px] border border-white/10 shadow-sm">
                  <Command className="w-3 h-3 text-zinc-600" />
                  <span className="text-[10px] text-zinc-600 font-bold tracking-widest">ENTER</span>
                </div>
              </form>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Terminal;
