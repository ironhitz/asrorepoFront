import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, X, ChevronRight, Command, Minus, Maximize2, Anchor, Copy, Download, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TerminalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onFindings?: (findings: any[]) => void;
}

const ASCII_ART = `
╔═════════════════════════════════════════════════════════╗
║  ██████╗ ███████╗███████╗██╗   ██╗███╗   ██║███████╗    ║
║ ██╔═══██╗██╔════╝██╔════╝██║   ██║████╗  ██║██╔═══╝     ║
║ ██║   ██║█████╗  █████╗  ██║   ██║██╔██╗ ██║█████╗      ║
║ ██║   ██║██╔══╝  ██╔══╝  ██║   ██║██║╚██╗██║██╔══╝      ║
║ ╚██████╔╝██║     ██║     ╚██████╔╝██║ ╚████║███████╗    ║
║  ╚═════╝ ╚═╝     ╚═╝      ╚═════╝ ╚═╝  ╚═══╝╚══════╝    ║
║                                                         ║
║   ████╗  ██████╗ █████╗  █████╗              ██╗        ║
║  █╔══██╗ ██╔════╝██╔══██╗██╔══██╗            ╚═╝        ║
║  ██████║╝╚█████╗ ╚█████║╝██║  ██║ █████╗██╗  ██╗        ║
║  ██╔══██╗ ╚═══██╗██╔══██╗██║  ██║ ██╔══╝██║ ╔██║        ║
║  ██║   ██║██████║██║  ███╗█████╔╝ █████║███████║        ║
║  ╚═╝   ╚═╝╚═════╝╚═╝  ╚══╝╚════╝  ╚════╝╚═══╝╚═╝        ║
║                                                         ║
║OFFLINE ASRO CLI - Autonomous Secure Release Orchestrator║
║ NB* Still under development- Contributors welcome!      ║
╚═════════════════════════════════════════════════════════╝
`;

const Terminal: React.FC<TerminalProps> = ({ isOpen, onClose, projectId, onFindings }) => {
  const [history, setHistory] = useState<{ type: 'cmd' | 'out', text: string, timestamp: string }[]>([
    { type: 'out', text: ASCII_ART, timestamp: new Date().toLocaleTimeString() },
    { type: 'out', text: "Type 'asro help' to see available commands.", timestamp: new Date().toLocaleTimeString() }
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
      const response = await fetch('/api/cli/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, projectId })
      });
      const data = await response.json();
      setHistory(prev => [...prev, { type: 'out', text: data.output, timestamp: data.timestamp || timestamp }]);
      
      if (data.data?.findings && onFindings) {
        onFindings(data.data.findings);
      }
    } catch (error) {
      setHistory(prev => [...prev, { type: 'out', text: 'Error: Failed to execute command.', timestamp }]);
    } finally {
      setIsLoading(false);
    }
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
    fixed z-50 flex flex-col overflow-hidden transition-all duration-300
    ${isDocked ? 'bottom-0 left-0 right-0 w-full h-[300px] rounded-t-2xl' : 
      isMaximized ? 'inset-0 w-full h-full rounded-none' : 
      isMinimized ? 'bottom-8 right-8 w-64 h-12 rounded-xl' : 
      'bottom-8 right-8 w-[700px] h-[450px] rounded-2xl shadow-2xl'}
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
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-zinc-900/50 cursor-move">
            <div className="flex items-center gap-2">
              <TerminalIcon className="w-4 h-4 text-gitlab-orange" />
              <span className="text-xs font-bold text-white uppercase tracking-widest">ASRO Terminal</span>
              {isLoading && <Loader2 className="w-3 h-3 text-gitlab-orange animate-spin" />}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                <Minus className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsMaximized(!isMaximized); setIsDocked(false); }} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                <Maximize2 className="w-4 h-4" />
              </button>
              <button onClick={() => { setIsDocked(!isDocked); setIsMaximized(false); }} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all">
                <Anchor className="w-4 h-4" />
              </button>
              <button onClick={onClose} className="p-1.5 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-gitlab-orange transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-zinc-900/30 border-b border-white/5">
                <button onClick={copyHistory} className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-all">
                  <Copy className="w-3 h-3" /> Copy
                </button>
                <button onClick={downloadLogs} className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-all">
                  <Download className="w-3 h-3" /> Download
                </button>
                <button onClick={() => setHistory([{ type: 'out', text: ASCII_ART, timestamp: new Date().toLocaleTimeString() }])} className="flex items-center gap-1.5 text-[10px] text-zinc-500 hover:text-white transition-all">
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>

              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2 scrollbar-hide bg-black/50"
              >
                {history.map((item, i) => (
                  <div key={i} className="group relative">
                    <span className="absolute -left-2 top-0 text-[8px] text-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.timestamp}
                    </span>
                    <div className={item.type === 'cmd' ? 'text-gitlab-light-orange' : 'text-zinc-300 whitespace-pre-wrap'}>
                      {item.type === 'cmd' && <span className="text-zinc-600 mr-2">$</span>}
                      {item.text}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCommand} className="p-4 border-t border-white/5 bg-zinc-900/30 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-gitlab-orange" />
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-white font-mono text-sm placeholder:text-zinc-700"
                  placeholder="Enter asro command..."
                  autoFocus
                />
                <div className="flex items-center gap-1 px-2 py-1 bg-white/5 rounded border border-white/10">
                  <Command className="w-3 h-3 text-zinc-500" />
                  <span className="text-[10px] text-zinc-500 font-bold">ENTER</span>
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