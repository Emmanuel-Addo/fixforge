"use client";

import { useState, useEffect, useRef } from "react";
import { API_BASE_URL } from "@/lib/api";
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
  modifiedContent?: string;
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
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [originalFileContent, setOriginalFileContent] = useState<string | null>(null);
  const [modifiedContent, setModifiedContent] = useState<string | null>(null);
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubOwner, setGithubOwner] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Push to GitHub state
  const [pushDialogMsgId, setPushDialogMsgId] = useState<number | null>(null);
  const [footerPushOpen, setFooterPushOpen] = useState(false);
  const [commitMessage, setCommitMessage] = useState("");
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; text: string } | null>(null);

  // Auto-scroll to bottom whenever chatMessages updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const isConnected = localStorage.getItem("github_connected") === "true";
    setGithubConnected(isConnected);
    if (!isConnected) {
      setFolderContents({});
      return;
    }

    // Resolve owner: prefer cached value, then derive from Supabase GitHub OAuth session
    const resolveOwner = async () => {
      let owner = localStorage.getItem("github_owner") || "";
      if (!owner) {
        try {
          const { getSupabase } = await import("@/lib/supabase");
          const { data: { session } } = await getSupabase().auth.getSession();
          owner = session?.user?.user_metadata?.user_name
            || session?.user?.user_metadata?.preferred_username
            || session?.user?.email?.split("@")[0]
            || "";
          if (owner) localStorage.setItem("github_owner", owner);
        } catch (_) {}
      }
      setGithubOwner(owner);

      const savedRepo = localStorage.getItem("active_repo");
      const repoName = savedRepo || "";
      if (savedRepo) setActiveRepo(savedRepo);

      if (!owner || !repoName) return;

      setFilesLoading(true);
      fetch(`${API_BASE_URL}/api/projects/contents?owner=${owner}&repo=${repoName}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setFolderContents({ "": data });
          }
        })
        .catch(() => {})
        .finally(() => setFilesLoading(false));
    };

    resolveOwner();
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
          const owner = localStorage.getItem("github_owner") || githubOwner;
          const repo = localStorage.getItem("active_repo") || activeRepo;
          fetch(`${API_BASE_URL}/api/projects/contents?owner=${owner}&repo=${repo}&path=${item.path}`)
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
      setSelectedFilePath(item.path);
      setFileContent(null);
      setOriginalFileContent(null);
      setModifiedContent(null);
      setFileContentLoading(true);
      const owner = localStorage.getItem("github_owner") || githubOwner;
      const repo = localStorage.getItem("active_repo") || activeRepo;
      fetch(`${API_BASE_URL}/api/projects/file?owner=${owner}&repo=${repo}&path=${item.path}`)
        .then((res) => res.json())
        .then((data) => {
          const content = data.content ?? "";
          setFileContent(content);
          setOriginalFileContent(content);
        })
        .catch(() => {
          setFileContent("// Could not load file content.");
          setOriginalFileContent("// Could not load file content.");
        })
        .finally(() => setFileContentLoading(false));
    }
  };

  const handleSaveFile = async () => {
    if (!selectedFilePath || fileContent === null) return;
    const owner = localStorage.getItem("github_owner") || githubOwner;
    const repo = localStorage.getItem("active_repo") || activeRepo;
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          path: selectedFilePath,
          content: fileContent
        })
      });
      const data = await response.json();
      if (response.ok) {
        setOriginalFileContent(fileContent);
      } else {
        console.error("Failed to save file:", data);
      }
    } catch (err) {
      console.error("Error saving file:", err);
    }
  };

  const handleApplyAndSave = async (modContent: string) => {
    const owner = localStorage.getItem("github_owner") || githubOwner;
    const repo = localStorage.getItem("active_repo") || activeRepo;
    setModifiedContent(modContent);
    // Fire-and-forget: record the accepted edit in Supabase
    try {
      const { data: { session } } = await (await import("@/lib/supabase")).getSupabase().auth.getSession();
      const userId = session?.user?.id;
      if (userId && selectedFilePath) {
        fetch(`${API_BASE_URL}/api/projects/save-edit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            owner,
            repo,
            file_path: selectedFilePath,
            original_content: originalFileContent,
            modified_content: modContent,
          }),
        }).catch(console.error);
      }
    } catch (_) {}
  };

  const handlePushToGitHub = async (msgIdx: number, content: string) => {
    if (!commitMessage.trim()) return;
    const owner = localStorage.getItem("github_owner") || githubOwner;
    const repo = localStorage.getItem("active_repo") || activeRepo;
    setIsPushing(true);
    setPushResult(null);
    try {
      const { data: { session } } = await (await import("@/lib/supabase")).getSupabase().auth.getSession();
      const userId = session?.user?.id || "unknown";
      const response = await fetch(`${API_BASE_URL}/api/projects/push`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          owner,
          repo,
          file_path: selectedFilePath,
          content,
          commit_message: commitMessage,
          original_content: originalFileContent,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setPushResult({ success: true, text: `✅ Pushed! Commit: "${commitMessage}"` });
        setPushDialogMsgId(null);
        setCommitMessage("");
        // Update file state to reflect pushed version
        setFileContent(content);
        setOriginalFileContent(content);
        setModifiedContent(null);
      } else {
        setPushResult({ success: false, text: `❌ Push failed: ${data.detail || "Unknown error"}` });
      }
    } catch (err) {
      setPushResult({ success: false, text: `❌ Error: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setIsPushing(false);
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim()) return;
    const messageText = chatInput;
    const newMsg = {
      sender: "user",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedMessages = [...chatMessages, newMsg];
    setChatMessages(updatedMessages);
    setChatInput("");

    setChatMessages((prev) => [
      ...prev,
      {
        sender: "ai",
        text: "Analyzing project files...",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    const owner = localStorage.getItem("github_owner") || githubOwner;
    const repo = localStorage.getItem("active_repo") || activeRepo;

    const history = updatedMessages.map(msg => ({
      role: msg.sender === "user" ? "user" : "assistant",
      content: msg.text
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo,
          message: messageText,
          selected_file: selectedFilePath,
          file_content: fileContent,
          history: history
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      
      let diffStats = undefined;
      if (data.modifiedContent && fileContent) {
        setModifiedContent(data.modifiedContent);
        const diffResult = getDiff(fileContent, data.modifiedContent);
        const added = diffResult.filter(l => l.type === 'added').length;
        const deleted = diffResult.filter(l => l.type === 'removed').length;
        diffStats = {
          file: selectedFile || "active file",
          added,
          deleted
        };
      }

      setChatMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          sender: "ai",
          text: data.description || "I have completed my analysis.",
          bullets: data.bullets || [],
          diffStats: diffStats,
          followUp: data.followUp || "",
          modifiedContent: data.modifiedContent || undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return copy;
      });

    } catch (err) {
      console.error("AI chat error:", err);
      setChatMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          sender: "ai",
          text: `Error connecting to AI: ${err instanceof Error ? err.message : String(err)}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return copy;
      });
    }
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
                              selectedFilePath === item.path
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
                                <FileCode2 size={13} className={`shrink-0 ${selectedFilePath === item.path ? "text-blue-500" : "text-slate-400"}`} />
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
          <div className="h-10 border-b border-slate-200 flex items-center justify-between px-4 bg-slate-50/30 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-900">{selectedFile ?? "No file selected"}</span>
              {selectedFile && <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
            </div>
            {selectedFile && fileContent !== null && originalFileContent !== null && fileContent !== originalFileContent && !modifiedContent && (
              <button
                onClick={handleSaveFile}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-semibold rounded-lg shadow-sm transition flex items-center gap-1 cursor-pointer font-sans"
              >
                Save Changes
              </button>
            )}
          </div>

          {/* Code Window */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed text-slate-700 bg-slate-950/5 flex flex-col">
            <div className="min-w-[500px] flex-1 flex flex-col">
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
                  <div className="flex flex-1 w-full min-h-[400px]">
                    {/* Line numbers gutter */}
                    <div className="w-10 text-right pr-4 text-slate-400 select-none font-mono text-xs leading-relaxed shrink-0 pt-0.5 border-r border-slate-200/50">
                      {fileContent.split("\n").map((_, i) => (
                        <div key={i} className="h-5 flex items-center justify-end">{i + 1}</div>
                      ))}
                    </div>
                    {/* Code textarea */}
                    <textarea
                      value={fileContent}
                      onChange={(e) => setFileContent(e.target.value)}
                      spellCheck={false}
                      className="flex-1 pl-4 bg-transparent font-mono text-xs leading-relaxed text-slate-800 focus:outline-none resize-none w-full h-full min-h-[400px] border-0 outline-none pt-0.5 block"
                      style={{ lineHeight: '1.25rem' }}
                    />
                  </div>
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
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 font-sans my-auto">
                  <FileCode2 size={28} className="text-slate-300 animate-pulse" />
                  <p className="text-xs">Connect your GitHub account to import and view files</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-400 gap-2 font-sans my-auto">
                  <FileCode2 size={28} className="text-slate-300" />
                  <p className="text-xs">Click a file in the explorer to view its content</p>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          {modifiedContent && (
            <div className="border-t border-slate-200 bg-slate-50 flex flex-col shrink-0">
              <div className="h-14 flex items-center justify-between px-6 bg-slate-50/50">
                <div className="flex items-center gap-1 text-xs text-slate-500 font-sans">
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
                <div className="flex gap-2.5 font-sans">
                  <button
                    onClick={() => {
                      setModifiedContent(null);
                      setFooterPushOpen(false);
                      setPushResult(null);
                    }}
                    className="px-4 py-1.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition"
                  >
                    Reject
                  </button>
                  <button
                    onClick={async () => {
                      const updatedContent = modifiedContent;
                      setFileContent(updatedContent);
                      setModifiedContent(null);
                      if (selectedFilePath && updatedContent !== null) {
                        const owner = localStorage.getItem("github_owner") || githubOwner;
                        const repo = localStorage.getItem("active_repo") || activeRepo;
                        try {
                          const response = await fetch(`${API_BASE_URL}/api/projects/save`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              owner,
                              repo,
                              path: selectedFilePath,
                              content: updatedContent
                            })
                          });
                          if (response.ok) {
                            setOriginalFileContent(updatedContent);
                          }
                        } catch (err) {
                          console.error("Error auto-saving accepted code:", err);
                        }
                      }
                    }}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setFooterPushOpen(true);
                      setCommitMessage("");
                      setPushResult(null);
                    }}
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition flex items-center gap-1"
                  >
                    ↑ Push to GitHub
                  </button>
                </div>
              </div>

              {/* Inline Commit Dialog in Footer */}
              {footerPushOpen && (
                <div className="border-t border-slate-200 p-3 bg-slate-100/50 flex flex-col gap-2 font-sans">
                  <p className="text-xs font-semibold text-slate-700">Push to GitHub</p>
                  <div className="flex gap-2.5">
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      onKeyDown={(e) => { 
                        if (e.key === "Enter" && commitMessage.trim()) {
                          handlePushToGitHub(-1, modifiedContent);
                          setFooterPushOpen(false);
                        }
                      }}
                      placeholder="Commit message (e.g. fix: resolve auth failure)"
                      className="flex-1 text-xs border border-slate-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:border-blue-500 font-sans shadow-sm"
                    />
                    <button
                      onClick={async () => {
                        await handlePushToGitHub(-1, modifiedContent);
                        setFooterPushOpen(false);
                      }}
                      disabled={isPushing || !commitMessage.trim()}
                      className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold px-4 py-1.5 rounded-xl cursor-pointer transition shadow-sm"
                    >
                      {isPushing ? "Pushing…" : "Confirm & Push"}
                    </button>
                    <button
                      onClick={() => { setFooterPushOpen(false); setPushResult(null); }}
                      className="text-slate-500 hover:text-slate-800 text-xs font-semibold px-3 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                  {pushResult && (
                    <p className={`text-xs ${pushResult.success ? "text-emerald-600" : "text-rose-600"}`}>
                      {pushResult.text}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: AI Assistant Chat Panel */}
        <div className="w-full lg:w-[420px] bg-white flex flex-col shrink-0 min-h-0 overflow-hidden border-t lg:border-t-0 lg:border-l border-slate-200">
          <div className="p-3 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">AI Assistant</span>
            <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-semibold ml-auto font-sans">FixForge AI</span>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {chatMessages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 text-center space-y-2 p-6 font-sans">
                <Code2 size={24} className="text-slate-300" />
                <p className="font-semibold text-slate-600">How can I help you today?</p>
                <p className="text-[11px]">Ask me to analyze files, fix syntax errors, or generate refactorings.</p>
              </div>
            )}
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className="flex items-center gap-1.5 mb-1 text-[10px] text-slate-400 font-sans">
                  {msg.sender === "ai" && <span className="font-bold text-slate-800">FixForge Bot</span>}
                  <span>{msg.time}</span>
                </div>
                <div className={`p-3 rounded-2xl max-w-[90%] leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-slate-900 text-white rounded-br-none"
                    : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
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
                    <div className="mt-3 bg-white border border-slate-200 rounded-xl shadow-sm font-mono text-[10px] text-slate-900 overflow-hidden">
                      <div className="flex items-center justify-between gap-2 p-2">
                        <div className="flex items-center gap-1.5">
                          <FileCode2 size={12} className="text-slate-400" />
                          <span className="font-semibold truncate max-w-[120px]">{msg.diffStats.file}</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-emerald-600">+{msg.diffStats.added}</span>
                          <span className="text-rose-600">-{msg.diffStats.deleted}</span>
                          <button
                            onClick={() => {
                              if (msg.modifiedContent) {
                                setModifiedContent(msg.modifiedContent);
                              }
                            }}
                            className="bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2 py-0.5 rounded transition text-[9px] font-semibold text-slate-700 font-sans cursor-pointer"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => {
                              if (msg.modifiedContent) {
                                handleApplyAndSave(msg.modifiedContent);
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-0.5 rounded transition text-[9px] font-semibold font-sans cursor-pointer"
                          >
                            Apply
                          </button>
                          <button
                            onClick={() => {
                              setPushDialogMsgId(i);
                              setCommitMessage("");
                              setPushResult(null);
                              if (msg.modifiedContent) handleApplyAndSave(msg.modifiedContent);
                            }}
                            className="bg-slate-900 hover:bg-slate-700 text-white px-2 py-0.5 rounded transition text-[9px] font-semibold font-sans cursor-pointer flex items-center gap-1"
                          >
                            ↑ Push
                          </button>
                        </div>
                      </div>
                      {/* Inline Push Dialog */}
                      {pushDialogMsgId === i && (
                        <div className="border-t border-slate-200 p-2 bg-slate-50 flex flex-col gap-1.5">
                          <p className="text-[9px] font-semibold text-slate-600 font-sans">Commit message</p>
                          <div className="flex gap-1.5">
                            <input
                              type="text"
                              value={commitMessage}
                              onChange={(e) => setCommitMessage(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter" && msg.modifiedContent) handlePushToGitHub(i, msg.modifiedContent); }}
                              placeholder="e.g. fix: resolve null pointer in auth"
                              className="flex-1 text-[10px] border border-slate-200 rounded px-2 py-1 bg-white focus:outline-none focus:border-blue-500 font-sans"
                            />
                            <button
                              onClick={() => msg.modifiedContent && handlePushToGitHub(i, msg.modifiedContent)}
                              disabled={isPushing || !commitMessage.trim()}
                              className="bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white text-[9px] font-semibold px-3 py-1 rounded font-sans cursor-pointer"
                            >
                              {isPushing ? "Pushing…" : "Confirm"}
                            </button>
                            <button
                              onClick={() => { setPushDialogMsgId(null); setPushResult(null); }}
                              className="text-slate-400 hover:text-slate-700 text-[9px] font-semibold px-2 font-sans cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                          {pushResult && (
                            <p className={`text-[9px] font-sans ${pushResult.success ? "text-emerald-600" : "text-rose-600"}`}>
                              {pushResult.text}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {msg.followUp && (
                    <p className="mt-3 font-semibold text-slate-900 border-t border-slate-200/50 pt-2 font-sans">{msg.followUp}</p>
                  )}
                </div>
              </div>
            ))}
            {/* Auto-scroll anchor */}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Suggestions (Placeholder) */}
          <div className="p-3 border-t border-slate-100 flex flex-wrap gap-1.5 bg-slate-50/20">
            {/* Placeholder for future quick actions */}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 bg-white font-sans">
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
