"use client";

import { useState, useEffect } from "react";
import {
  FileCode2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  File,
  Paperclip,
  Code2,
  AtSign,
  Send,
  Plus,
} from "lucide-react";

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
  bullets?: string[];
  diffStats?: { file: string; added: number; deleted: number };
  followUp?: string;
}

function getDiff(original: string, modified: string) {
  const one = original.split("\n");
  const two = modified.split("\n");
  
  const dp: number[][] = Array(one.length + 1).fill(0).map(() => Array(two.length + 1).fill(0));
  for (let i = 1; i <= one.length; i++) {
    for (let j = 1; j <= two.length; j++) {
      if (one[i - 1] === two[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  
  const diffResult: { type: 'normal' | 'added' | 'removed'; text: string; originalLineNum?: number; newLineNum?: number }[] = [];
  let i = one.length;
  let j = two.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && one[i - 1] === two[j - 1]) {
      diffResult.unshift({ type: 'normal', text: one[i - 1], originalLineNum: i, newLineNum: j });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      diffResult.unshift({ type: 'added', text: two[j - 1], newLineNum: j });
      j--;
    } else {
      diffResult.unshift({ type: 'removed', text: one[i - 1], originalLineNum: i });
      i--;
    }
  }
  return diffResult;
}

export default function Dashboard() {
  const [chatInput, setChatInput] = useState("");
  const [activeRepo, setActiveRepo] = useState("fixforge");
  const [folderContents, setFolderContents] = useState<{ [path: string]: any[] }>({});
  const [expandedFolders, setExpandedFolders] = useState<{ [path: string]: boolean }>({ "": true });
  const [filesLoading, setFilesLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [modifiedContent, setModifiedContent] = useState<string | null>(null);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);

  useEffect(() => {
    const isConnected = localStorage.getItem("github_connected") === "true";
    setGithubConnected(isConnected);
    if (!isConnected) {
      setFolderContents({});
      return;
    }

    const savedRepo = localStorage.getItem("active_repo");
    const owner = "Emmanuel-Addo";
    const repoName = savedRepo || "fixforge";
    if (savedRepo) setActiveRepo(savedRepo);

    setFilesLoading(true);
    fetch(`http://localhost:8000/api/projects/contents?owner=${owner}&repo=${repoName}`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFolderContents({ "": data });
        }
      })
      .catch(() => {})
      .finally(() => setFilesLoading(false));
  }, []);

  const getVisibleFiles = () => {
    const list: { name: string; path: string; type: string; depth: number }[] = [];
    
    const addContents = (path: string, depth: number) => {
      const items = folderContents[path] || [];
      const sorted = [...items].sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'dir' ? -1 : 1;
      });

      for (const item of sorted) {
        list.push({ ...item, depth });
        if (item.type === 'dir' && expandedFolders[item.path]) {
          addContents(item.path, depth + 1);
        }
      }
    };
    
    addContents("", 0);
    return list;
  };

  const handleFileClick = (item: {name: string; path: string; type: string}) => {
    if (item.type === "dir") {
      const isExpanded = !!expandedFolders[item.path];
      if (isExpanded) {
        setExpandedFolders(prev => ({ ...prev, [item.path]: false }));
      } else {
        setExpandedFolders(prev => ({ ...prev, [item.path]: true }));
        if (!folderContents[item.path]) {
          const owner = localStorage.getItem("github_owner") || "Emmanuel-Addo";
          const repo = localStorage.getItem("active_repo") || activeRepo;
          fetch(`http://localhost:8000/api/projects/contents?owner=${owner}&repo=${repo}&path=${item.path}`)
            .then((res) => res.json())
            .then((data) => {
              if (Array.isArray(data)) {
                setFolderContents(prev => ({ ...prev, [item.path]: data }));
              }
            })
            .catch((err) => console.error("Error loading folder contents:", err));
        }
      }
    } else {
      setSelectedFile(item.name);
      setFileContent(null);
      setModifiedContent(null);
      setFileContentLoading(true);
      const owner = localStorage.getItem("github_owner") || "Emmanuel-Addo";
      const repo = localStorage.getItem("active_repo") || activeRepo;
      fetch(`http://localhost:8000/api/projects/file?owner=${owner}&repo=${repo}&path=${item.path}`)
        .then((res) => res.json())
        .then((data) => setFileContent(data.content ?? ""))
        .catch(() => setFileContent("// Could not load file content."))
        .finally(() => setFileContentLoading(false));
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const newMsg = {
      sender: "user",
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput("");

    // Simulate AI response
    setTimeout(() => {
      let aiText = "I am running analysis on your request.";
      let diffStats = undefined;
      let bullets: string[] = [];
      let followUp = "";

      if (selectedFile) {
        aiText = `I've analyzed the issues in ${selectedFile} and generated a fix. Here is what I modified:`;
        bullets = [
          "Fixed error propagation and authentication handling",
          "Improved parameter validation",
          "Optimized token session generation logic"
        ];
        followUp = "Would you like me to apply this change to your repository?";

        if (fileContent) {
          let newContent = fileContent;
          if (selectedFile === "auth.py") {
            // Apply the user's specific auth.py code modification
            if (fileContent.includes("return None") && !fileContent.includes("raise AuthenticationError")) {
              newContent = fileContent
                .replace("if not user:\n        return None", "if not user:\n        raise AuthenticationError(\"User not found\")")
                .replace("if not verify_password(password, user.password):\n        return None", "if not verify_password(password, user.password):\n        raise AuthenticationError(\"Invalid credentials\")")
                .replace("create_token(user.id)", "create_token(user.id, expires_in=3600)")
                .replace("token = create_token(user.id)", "token = create_token(user.id, expires_in=3600)");
            } else {
              newContent = "# Optimized authentication handling\n" + fileContent;
            }
          } else {
            newContent = `# AI optimized ${selectedFile}\n` + fileContent;
          }
          setModifiedContent(newContent);

          const diffResult = getDiff(fileContent, newContent);
          const added = diffResult.filter(l => l.type === 'added').length;
          const deleted = diffResult.filter(l => l.type === 'removed').length;
          diffStats = {
            file: selectedFile,
            added,
            deleted
          };
        }
      } else {
        aiText = "Please select a file from the explorer first, then I can help you analyze and fix it.";
      }

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiText,
          bullets,
          diffStats,
          followUp,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col min-w-0 overflow-hidden">
      {/* 3-Column Workspace Row */}
      <div className="flex-1 flex flex-col lg:flex-row min-w-0 border-b border-slate-200 overflow-hidden">
        
        {/* Left Column: Files Explorer */}
        <div className="w-full lg:w-56 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col shrink-0 min-h-0 overflow-hidden">
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Files</span>
            <button className="p-1 hover:bg-slate-100 text-slate-500 rounded transition">
              <Plus size={14} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 text-xs font-mono select-none">
            {/* Root / Folder */}
            <div className="space-y-1">
              {!githubConnected ? (
                <div className="p-3 text-center space-y-3 font-sans">
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Connect your GitHub account to import a repository and view files.
                  </p>
                  <a
                    href="/dashboard/new"
                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all text-center w-full"
                  >
                    Connect GitHub
                  </a>
                </div>
              ) : (
                <>
                  <div 
                    className="flex items-center gap-1.5 py-1 px-1.5 hover:bg-slate-50 rounded cursor-pointer text-slate-800"
                    onClick={() => setExpandedFolders(prev => ({ ...prev, "": !prev[""] }))}
                  >
                    {expandedFolders[""] ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
                    <FolderOpen size={14} className="text-blue-500" />
                    <span className="text-blue-600 font-semibold">{activeRepo}</span>
                  </div>
     
                  {expandedFolders[""] && (
                    <div className="pl-2 space-y-0.5">
                      {filesLoading ? (
                        <div className="flex items-center gap-2 py-2 px-1.5 text-slate-400">
                          <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>Loading...</span>
                        </div>
                      ) : getVisibleFiles().length > 0 ? (
                        getVisibleFiles().map((item) => (
                          <div
                            key={item.path}
                            onClick={() => handleFileClick(item)}
                            style={{ paddingLeft: `${item.depth * 12}px` }}
                            className={`flex items-center gap-1.5 py-1 px-1.5 rounded cursor-pointer ${
                              selectedFile === item.name
                                ? "bg-blue-50 text-blue-700 border-l-2 border-blue-500"
                                : "hover:bg-slate-50 text-slate-600"
                            }`}
                          >
                            {item.type === "dir" ? (
                              <>
                                {expandedFolders[item.path] ? (
                                  <ChevronDown size={12} className="text-slate-400 shrink-0" />
                                ) : (
                                  <ChevronRight size={12} className="text-slate-400 shrink-0" />
                                )}
                                <FolderOpen size={13} className="text-blue-400 shrink-0" />
                                <span className="text-slate-700">{item.name}</span>
                              </>
                            ) : (
                              <>
                                <span className="w-3 shrink-0" />
                                <FileCode2 size={13} className={`shrink-0 ${selectedFile === item.name ? "text-blue-500" : "text-slate-400"}`} />
                                <span>{item.name}</span>
                              </>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="py-2 px-1.5 text-slate-400">No files found</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        

        {/* Center Column: Code Viewer */}
        <div className="flex-1 flex flex-col min-w-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 min-h-0 overflow-hidden">
          {/* Editor Tabs & Control */}
          <div className="h-10 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50/30">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-900">{selectedFile ?? "No file selected"}</span>
              {selectedFile && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            </div>
          </div>

          {/* Code Window */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-700 bg-slate-950/5">
            <div className="min-w-[500px]">
              {fileContentLoading ? (
                <div className="flex items-center gap-2 text-slate-400 py-8 px-4">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Loading file...</span>
                </div>
              ) : fileContent !== null ? (
                !modifiedContent ? (
                  fileContent.split("\n").map((line, i) => (
                    <div key={i} className="flex hover:bg-slate-100/60 py-0.5">
                      <span className="w-10 text-right pr-4 text-slate-400 select-none shrink-0">{i + 1}</span>
                      <span className="whitespace-pre text-slate-800">{line}</span>
                    </div>
                  ))
                ) : (
                  getDiff(fileContent, modifiedContent).map((line, idx) => {
                    if (line.type === 'added') {
                      return (
                        <div key={idx} className="flex bg-emerald-50 text-emerald-800 border-l-4 border-emerald-500 font-medium hover:bg-emerald-100/60 py-0.5">
                          <span className="w-10 text-right pr-4 text-emerald-400 select-none shrink-0">+</span>
                          <span className="whitespace-pre">{line.text}</span>
                        </div>
                      );
                    } else if (line.type === 'removed') {
                      return (
                        <div key={idx} className="flex bg-rose-50 text-rose-800 border-l-4 border-rose-500 hover:bg-rose-100/60 py-0.5">
                          <span className="w-10 text-right pr-4 text-rose-400 select-none shrink-0">-</span>
                          <span className="whitespace-pre">{line.text}</span>
                        </div>
                      );
                    } else {
                      return (
                        <div key={idx} className="flex hover:bg-slate-100/60 py-0.5">
                          <span className="w-10 text-right pr-4 text-slate-400 select-none shrink-0">{line.originalLineNum}</span>
                          <span className="whitespace-pre text-slate-800">{line.text}</span>
                        </div>
                      );
                    }
                  })
                )
              ) : !githubConnected ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 font-sans">
                  <FileCode2 size={28} className="text-slate-300 animate-pulse" />
                  <p className="text-xs">Connect your GitHub account to import and view files</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 font-sans">
                  <FileCode2 size={28} className="text-slate-300" />
                  <p className="text-xs">Click a file in the explorer to view its content</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {modifiedContent && (
            <div className="h-14 border-t border-slate-200 flex items-center justify-between px-6 bg-slate-50/50">
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <span className="font-semibold text-slate-800">{selectedFile}</span>
                <span>•</span>
                <span className="text-blue-600 font-semibold">
                  {(() => {
                    const diff = getDiff(fileContent || "", modifiedContent);
                    const added = diff.filter(l => l.type === 'added').length;
                    const deleted = diff.filter(l => l.type === 'removed').length;
                    return `${added + deleted} changes`;
                  })()}
                </span>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => setModifiedContent(null)}
                  className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    setFileContent(modifiedContent);
                    setModifiedContent(null);
                  }}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Chat Panel */}
        <div className="w-full lg:w-[420px] bg-white flex flex-col shrink-0 min-h-0 overflow-hidden">
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">AI Assistant</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold ml-auto">FixForge AI</span>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400">
                  {msg.sender === "ai" && <span className="font-bold text-slate-800">FixForge Bot</span>}
                  <span>{msg.time}</span>
                </div>
                <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                }`}>
                  <p>{msg.text}</p>
                  
                  {/* Bullets List (AI changes details) */}
                  {msg.bullets && msg.bullets.length > 0 && (
                    <ul className="mt-2 space-y-1 pl-4 list-disc text-slate-700">
                      {msg.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}

                  {/* Diff Stats Card representation */}
                  {msg.diffStats && (
                    <div className="mt-3 p-2 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-sm font-mono text-[10px] text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <FileCode2 size={12} className="text-slate-400" />
                        <span className="font-semibold">{msg.diffStats.file}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600">+{msg.diffStats.added}</span>
                        <span className="text-rose-600">-{msg.diffStats.deleted}</span>
                        <button 
                          className="bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2 py-0.5 rounded transition text-[9px] font-semibold text-slate-700 font-sans cursor-pointer"
                        >
                          Review Changes
                        </button>
                      </div>
                    </div>
                  )}

                  {msg.followUp && (
                    <p className="mt-3 font-semibold text-slate-900 border-t border-slate-200/50 pt-2">{msg.followUp}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions Suggestions (Placeholder) */}
          <div className="p-3 border-t border-slate-100 flex flex-wrap gap-1.5 bg-slate-50/20">
            {/* Placeholder for future quick actions */}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white">
            <div className="relative border border-slate-200 focus-within:border-blue-500 rounded-xl bg-slate-50/50 focus-within:bg-white overflow-hidden transition-all">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendChat();
                  }
                }}
                placeholder="Ask anything about this repository..."
                rows={2}
                className="w-full pl-3 pr-3 pt-2 text-xs bg-transparent border-0 focus:outline-none resize-none text-slate-800"
              />
              <div className="h-9 px-3 flex items-center justify-between border-t border-slate-100/50 bg-slate-50/50">
                <div className="flex gap-2 text-slate-400">
                  <button className="hover:text-slate-600 transition"><Paperclip size={14} /></button>
                  <button className="hover:text-slate-600 transition"><Code2 size={14} /></button>
                  <button className="hover:text-slate-600 transition"><AtSign size={14} /></button>
                </div>
                <button
                  onClick={handleSendChat}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-lg transition shadow-sm hover:shadow"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

