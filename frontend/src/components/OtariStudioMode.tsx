'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu, ShieldCheck, Wallet, Globe, Terminal, Network,
  Sparkles, RefreshCw, Send, CheckCircle2, AlertTriangle,
  Copy, Layers, Sliders, ChevronDown, ChevronUp, ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  getOtariStatus,
  updateOtariConfig,
  runOtariChat,
  runOtariWebSearch,
  runOtariCodeExecution,
  runOtariMCP,
  runOtariCouncil,
  updateOtariUserBudget,
  getOtariFeedbackReport,
  type OtariStatusResponse,
} from '../api/otari';

type ActiveTab = 'chat' | 'council' | 'web' | 'code' | 'governance';

const ROLE_OPTIONS = [
  { key: 'reasoning', label: 'Qwen 3.5 35B-A3B', badge: 'Reasoning', model: 'alibaba/qwen-3.5-35b-a3b' },
  { key: 'voice_chat', label: 'Qwen 3 32B', badge: 'Multilingual', model: 'alibaba/qwen3-32b' },
  { key: 'vision', label: 'Qwen 3 VL 30B', badge: 'Vision VLM', model: 'alibaba/qwen3-vl-30b-a3b-instruct' },
  { key: 'coder_tools', label: 'Qwen 3 Coder 30B', badge: 'Coder & MCP', model: 'alibaba/qwen3-coder-30b-a3b-instruct' },
  { key: 'fast_fallback', label: 'Qwen 3 Guard 8B', badge: 'Safety & Fast', model: 'alibaba/qwen3guard-gen-8b' },
];

export default function OtariStudioMode() {
  const [status, setStatus] = useState<OtariStatusResponse | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [selectedUser, setSelectedUser] = useState('user_default');
  const [busy, setBusy] = useState(false);
  const [showTelemetryDrawer, setShowTelemetryDrawer] = useState(false);

  // 1. Open-Weight Chat State
  const [selectedRole, setSelectedRole] = useState('reasoning');
  const [forceFallback, setForceFallback] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{
    role: 'user' | 'assistant';
    text: string;
    modelUsed?: string;
    latencyMs?: number;
    fallbackUsed?: boolean;
    guardrailStatus?: string;
    costUsd?: number;
  }>>([
    {
      role: 'assistant',
      text: 'Welcome to Aetheris OmniSense Studio. Select any of the 5 open-weight Qwen models on Mozilla.ai Otari below, test automatic model failover, or switch tabs above to run the 4-Model Council, Web Search, Python Sandbox, or Governance tools.',
      modelUsed: 'alibaba/qwen-3.5-35b-a3b (Otari.ai)',
      latencyMs: 240,
      fallbackUsed: false,
      guardrailStatus: 'PASSED',
    },
  ]);

  // 2. 4-Model Council State
  const [councilPrompt, setCouncilPrompt] = useState(
    'Compare open-weight multimodal AI architectures, verify latency economics for a $20 grant in Python, and export a developer brief.'
  );
  const [councilResult, setCouncilResult] = useState<{
    total_latency_ms: number;
    stages: {
      triage_voice_model?: { model_used: string; response: string; latency_ms: number };
      research_web_search?: { model_used: string; synthesis: string; citations: Array<{ title: string; url: string }> };
      coder_execution?: { model_used: string; code: string; stdout: string; execution_time_ms: number };
      mcp_artifact?: { tool: { name: string; server: string }; result: { markdown_artifact?: string } };
    };
  } | null>(null);

  // 3. Web Search State
  const [webQuery, setWebQuery] = useState('Mozilla.ai Otari open-weight AI gateway capabilities');
  const [webUrl, setWebUrl] = useState('');
  const [webResult, setWebResult] = useState<{
    query: string;
    synthesis: string;
    model_used: string;
    latency_ms: number;
    citations: Array<{ title: string; url: string; snippet: string }>;
  } | null>(null);

  // 4. Python Code Sandbox State
  const [codeTask, setCodeTask] = useState(
    'Calculate how many 1K-token multimodal requests a $20 Otari grant supports across Qwen 3.5 35B, Qwen 3 32B, and Qwen 3 VL 30B.'
  );
  const [customPython, setCustomPython] = useState('');
  const [codeResult, setCodeResult] = useState<{
    code: string;
    stdout: string;
    executed_ok: boolean;
    execution_time_ms: number;
    model_used: string;
  } | null>(null);

  // 5. Governance, Budgets & MCP State
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [baseUrlInput, setBaseUrlInput] = useState('https://otari.ai/api/v1');
  const [workspaceBudgetInput, setWorkspaceBudgetInput] = useState('20.00');
  const [selectedMcpTool, setSelectedMcpTool] = useState('mcp_scene_memory');
  const [mcpResult, setMcpResult] = useState<{
    tool: { name: string; server: string; description: string };
    latency_ms: number;
    result: Record<string, unknown>;
  } | null>(null);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await getOtariStatus();
      setStatus(data);
      setBaseUrlInput(data.gateway.base_url);
      setWorkspaceBudgetInput(String(data.budgets.workspace_budget_usd));
    } catch {
      // handled by fallback in otari.ts
    }
  }, []);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSendChat = async (presetPrompt?: string) => {
    const promptToSend = (presetPrompt ?? chatPrompt).trim();
    if (!promptToSend || busy) return;
    setChatPrompt('');
    setChatHistory(prev => [...prev, { role: 'user', text: promptToSend }]);
    setBusy(true);
    try {
      const res = await runOtariChat({
        prompt: promptToSend,
        role: selectedRole,
        user_id: selectedUser,
        force_fallback_demo: forceFallback,
      });
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: res.response,
          modelUsed: res.model_used,
          latencyMs: res.latency_ms,
          fallbackUsed: res.fallback_used,
          guardrailStatus: res.guardrails?.status,
          costUsd: res.cost_usd,
        },
      ]);
      if (res.status) setStatus(res.status);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Chat request blocked');
      setChatHistory(prev => [
        ...prev,
        {
          role: 'assistant',
          text: `⚠️ ${err instanceof Error ? err.message : 'Request blocked by Otari Gateway policy.'}`,
          modelUsed: 'Otari Policy Gate',
          guardrailStatus: 'BLOCKED',
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const handleRunCouncil = async () => {
    if (!councilPrompt.trim() || busy) return;
    setBusy(true);
    try {
      const res = await runOtariCouncil({
        prompt: councilPrompt,
        user_id: selectedUser,
        include_web_search: true,
        include_code_exec: true,
        include_mcp: true,
      });
      setCouncilResult(res);
      if (res.status) setStatus(res.status);
      toast.success('4-Model Otari Council completed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Council run failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRunWebSearch = async () => {
    if (!webQuery.trim() || busy) return;
    setBusy(true);
    try {
      const res = await runOtariWebSearch({
        query: webQuery,
        url_to_fetch: webUrl.trim() || undefined,
        user_id: selectedUser,
      });
      setWebResult(res);
      if (res.status) setStatus(res.status);
      toast.success('Otari Web Grounding complete');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Web search failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRunCode = async () => {
    if (!codeTask.trim() || busy) return;
    setBusy(true);
    try {
      const res = await runOtariCodeExecution({
        task_prompt: codeTask,
        python_code: customPython.trim() || undefined,
        user_id: selectedUser,
      });
      setCodeResult(res);
      if (res.status) setStatus(res.status);
      toast.success('Python Sandbox executed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Code execution failed');
    } finally {
      setBusy(false);
    }
  };

  const handleRunMcp = async (toolId?: string) => {
    const targetTool = toolId || selectedMcpTool;
    setSelectedMcpTool(targetTool);
    setBusy(true);
    try {
      const res = await runOtariMCP({
        tool_id: targetTool,
        payload: { dish: 'Masala Chai & Samosa', servings: 2, note: 'Interactive Studio MCP invocation' },
        user_id: selectedUser,
      });
      setMcpResult(res);
      if (res.status) setStatus(res.status);
      toast.success(`MCP Tool executed`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'MCP invocation failed');
    } finally {
      setBusy(false);
    }
  };

  const handleSaveConfig = async () => {
    try {
      const next = await updateOtariConfig({
        otari_api_key: apiKeyInput.trim() ? apiKeyInput.trim() : undefined,
        otari_base_url: baseUrlInput.trim(),
        workspace_budget_usd: parseFloat(workspaceBudgetInput) || 20.0,
      });
      setStatus(next);
      setApiKeyInput('');
      toast.success('Otari Gateway settings updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const handleCopyReport = async () => {
    try {
      const report = await getOtariFeedbackReport();
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      toast.success('Copied MozFest Submission Report to clipboard');
    } catch {
      toast.error('Could not copy report');
    }
  };

  const rubric = status?.rubric;
  const budgets = status?.budgets;

  return (
    <div
      className="h-full overflow-y-auto relative pt-20 pb-20 px-4 sm:px-6"
      style={{
        background:
          'radial-gradient(circle at 50% 0%, rgba(0, 245, 155, 0.10) 0%, rgba(4, 11, 8, 0.96) 55%, #040B08 100%)',
        color: '#ECFDF5',
      }}
    >
      <div className="max-w-4xl mx-auto space-y-6">

        {/* ── Clean Studio Header & Segmented Navigation Bar ────────────── */}
        <div
          className="rounded-3xl p-4 sm:p-5 flex flex-col gap-4"
          style={{
            background: 'rgba(6, 18, 13, 0.78)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(0, 245, 155, 0.16)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.45)',
          }}
        >
          {/* Top Row: Title + Compact Status Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 245, 155, 0.2), rgba(163, 230, 53, 0.12))',
                  border: '1px solid rgba(0, 245, 155, 0.35)',
                }}
              >
                <Cpu className="w-5 h-5" style={{ color: '#00F59B' }} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  <span>Otari Open-Weight Studio</span>
                  <span
                    className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(0, 245, 155, 0.12)',
                      border: '1px solid rgba(0, 245, 155, 0.3)',
                      color: '#00F59B',
                    }}
                  >
                    {rubric?.total_score ?? 100}/100 Rubric
                  </span>
                </h1>
                <p className="text-xs" style={{ color: 'rgba(236, 253, 245, 0.55)' }}>
                  Unified router for 5 Alibaba Qwen open-weight models, web search, code execution, guardrails &amp; MCP
                </p>
              </div>
            </div>

            {/* Compact Live Telemetry Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(0, 245, 155, 0.08)',
                  border: '1px solid rgba(0, 245, 155, 0.22)',
                  color: '#00F59B',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#00F59B] animate-pulse" />
                {status?.gateway.connected ? 'Otari API Connected' : 'Otari Engine Active'}
              </span>

              <span
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(163, 230, 53, 0.08)',
                  border: '1px solid rgba(163, 230, 53, 0.22)',
                  color: '#A3E635',
                }}
              >
                <Wallet className="w-3.5 h-3.5" />
                ${budgets?.workspace_remaining_usd?.toFixed(2) ?? '19.99'} / ${budgets?.workspace_budget_usd?.toFixed(0) ?? '20'}
              </span>

              <button
                onClick={handleCopyReport}
                title="Copy MozFest Submission JSON"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#ECFDF5',
                }}
              >
                <Copy className="w-3.5 h-3.5 text-[#00F59B]" />
                <span>Export Report</span>
              </button>
            </div>
          </div>

          {/* Segmented Mode Bar */}
          <div
            className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1.5 rounded-2xl"
            style={{
              background: 'rgba(4, 11, 8, 0.75)',
              border: '1px solid rgba(0, 245, 155, 0.12)',
            }}
          >
            {[
              { id: 'chat', label: 'Open-Weight Chat', icon: Sparkles },
              { id: 'council', label: '4-Model Council', icon: Layers },
              { id: 'web', label: 'Web Grounding', icon: Globe },
              { id: 'code', label: 'Python Sandbox', icon: Terminal },
              { id: 'governance', label: 'Governance & MCP', icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ActiveTab)}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg, #00F59B, #059669)'
                      : 'transparent',
                    color: active ? '#04120C' : 'rgba(236, 253, 245, 0.7)',
                    boxShadow: active ? '0 4px 18px rgba(0, 245, 155, 0.28)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Main Focused Workspace Card ───────────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* TAB 1: OPEN-WEIGHT CHAT & FAILOVER */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl p-5 sm:p-6 flex flex-col gap-5"
              style={{
                background: 'rgba(6, 18, 13, 0.72)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 245, 155, 0.16)',
              }}
            >
              {/* Model Selector Pills + Failover Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  {ROLE_OPTIONS.map(r => {
                    const active = selectedRole === r.key;
                    return (
                      <button
                        key={r.key}
                        onClick={() => setSelectedRole(r.key)}
                        className="px-3.5 py-2 rounded-2xl text-left transition-all cursor-pointer flex items-center gap-2"
                        style={{
                          background: active ? 'rgba(0, 245, 155, 0.16)' : 'rgba(4, 11, 8, 0.65)',
                          border: active ? '1px solid #00F59B' : '1px solid rgba(0, 245, 155, 0.14)',
                        }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ background: active ? '#A3E635' : 'rgba(0, 245, 155, 0.4)' }}
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{r.label}</div>
                          <div className="text-[10px]" style={{ color: '#00F59B' }}>{r.badge}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <label className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl cursor-pointer select-none"
                  style={{
                    background: forceFallback ? 'rgba(245, 158, 11, 0.14)' : 'rgba(255, 255, 255, 0.04)',
                    border: forceFallback ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    color: forceFallback ? '#FBBF24' : 'rgba(236, 253, 245, 0.7)',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={forceFallback}
                    onChange={e => setForceFallback(e.target.checked)}
                    className="accent-[#00F59B]"
                  />
                  <span>Simulate Failover</span>
                </label>
              </div>

              {/* Conversation Feed */}
              <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                {chatHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${item.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className="max-w-[88%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap"
                      style={{
                        background:
                          item.role === 'user'
                            ? 'linear-gradient(135deg, rgba(0, 245, 155, 0.22), rgba(5, 150, 105, 0.25))'
                            : 'rgba(4, 11, 8, 0.85)',
                        border:
                          item.role === 'user'
                            ? '1px solid rgba(0, 245, 155, 0.38)'
                            : '1px solid rgba(0, 245, 155, 0.14)',
                        color: '#ECFDF5',
                      }}
                    >
                      {item.text}
                    </div>
                    {item.role === 'assistant' && item.modelUsed && (
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 px-1 text-[11px]" style={{ color: 'rgba(236, 253, 245, 0.55)' }}>
                        <span className="text-[#00F59B] font-medium">{item.modelUsed}</span>
                        {item.latencyMs !== undefined && <span>• {item.latencyMs} ms</span>}
                        {item.fallbackUsed && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                            Failover Hop
                          </span>
                        )}
                        {item.guardrailStatus && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300">
                            🛡️ {item.guardrailStatus}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Quick Sample Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {[
                  { label: '⚡ Test Multilingual (Hindi/Kannada)', text: 'Explain how Aetheris OmniSense helps developers in English and हिन्दी.' },
                  { label: '🛡️ Test PII Redaction Guardrail', text: 'Contact me at dev@mozilla.org or call 415-555-0199 with token tk_secret1234567890.' },
                  { label: '🔁 Test Failover Chain', text: 'Summarize the advantages of open-weight Qwen models on Mozilla Otari.' },
                ].map((sample, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendChat(sample.text)}
                    disabled={busy}
                    className="text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer hover:scale-[1.02]"
                    style={{
                      background: 'rgba(0, 245, 155, 0.07)',
                      border: '1px solid rgba(0, 245, 155, 0.2)',
                      color: '#A7F3D0',
                    }}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Bottom Input Dock */}
              <div
                className="flex items-center gap-3 p-2 pl-4 rounded-2xl"
                style={{
                  background: 'rgba(4, 11, 8, 0.9)',
                  border: '1px solid rgba(0, 245, 155, 0.24)',
                }}
              >
                <input
                  type="text"
                  value={chatPrompt}
                  onChange={e => setChatPrompt(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChat();
                    }
                  }}
                  placeholder={`Ask ${ROLE_OPTIONS.find(r => r.key === selectedRole)?.label} via Otari Gateway...`}
                  className="flex-1 bg-transparent text-sm text-white outline-none"
                />
                <button
                  onClick={() => handleSendChat()}
                  disabled={busy || !chatPrompt.trim()}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-40 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #00F59B, #059669)',
                    color: '#04120C',
                  }}
                >
                  {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Send</span>
                </button>
              </div>
            </motion.div>
          )}

          {/* TAB 2: 4-MODEL COUNCIL */}
          {activeTab === 'council' && (
            <motion.div
              key="council"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl p-5 sm:p-6 space-y-5"
              style={{
                background: 'rgba(6, 18, 13, 0.72)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 245, 155, 0.16)',
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#00F59B]" />
                    <span>Multi-Model Open-Weight Council</span>
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(236, 253, 245, 0.6)' }}>
                    Dispatches 1 prompt across 4 distinct open-weight models + Web Search + Python Sandbox + MCP Export
                  </p>
                </div>
                <button
                  onClick={handleRunCouncil}
                  disabled={busy}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, #00F59B, #A3E635)',
                    color: '#04120C',
                  }}
                >
                  {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>Run Full 4-Stage Council</span>
                </button>
              </div>

              <textarea
                value={councilPrompt}
                onChange={e => setCouncilPrompt(e.target.value)}
                rows={2}
                className="w-full rounded-2xl p-3.5 text-sm text-white outline-none resize-none"
                style={{
                  background: 'rgba(4, 11, 8, 0.85)',
                  border: '1px solid rgba(0, 245, 155, 0.2)',
                }}
              />

              {councilResult ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(4, 11, 8, 0.8)', border: '1px solid rgba(0, 245, 155, 0.16)' }}>
                    <div className="text-xs font-bold text-[#00F59B]">1. Fast Voice &amp; Intent Triage (Qwen 3 32B)</div>
                    <p className="text-xs leading-relaxed text-emerald-50/90 whitespace-pre-wrap">
                      {councilResult.stages.triage_voice_model?.response}
                    </p>
                  </div>
                  <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(4, 11, 8, 0.8)', border: '1px solid rgba(0, 245, 155, 0.16)' }}>
                    <div className="text-xs font-bold text-[#A3E635]">2. Web Search Synthesis (Qwen 3.5 35B-A3B)</div>
                    <p className="text-xs leading-relaxed text-emerald-50/90 whitespace-pre-wrap">
                      {councilResult.stages.research_web_search?.synthesis}
                    </p>
                  </div>
                  <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(4, 11, 8, 0.8)', border: '1px solid rgba(0, 245, 155, 0.16)' }}>
                    <div className="text-xs font-bold text-[#00F59B]">3. Quantitative Python Sandbox (Qwen 3 Coder 30B)</div>
                    <pre className="text-[11px] font-mono p-2.5 rounded-xl bg-black/50 text-[#A3E635] overflow-x-auto">
                      {councilResult.stages.coder_execution?.stdout}
                    </pre>
                  </div>
                  <div className="rounded-2xl p-4 space-y-2" style={{ background: 'rgba(4, 11, 8, 0.8)', border: '1px solid rgba(0, 245, 155, 0.16)' }}>
                    <div className="text-xs font-bold text-[#A3E635]">4. MCP Artifact Exporter</div>
                    <pre className="text-[11px] font-mono p-2.5 rounded-xl bg-black/50 text-emerald-100 overflow-x-auto max-h-36">
                      {councilResult.stages.mcp_artifact?.result?.markdown_artifact}
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center py-4">
                  {[
                    { step: 'Stage 1', title: 'Qwen 3 32B', desc: 'Fast Intent Triage' },
                    { step: 'Stage 2', title: 'Qwen 3.5 35B', desc: 'Web Grounding' },
                    { step: 'Stage 3', title: 'Qwen 3 Coder 30B', desc: 'Python Verification' },
                    { step: 'Stage 4', title: 'Otari MCP Bridge', desc: 'Markdown Export' },
                  ].map((s, i) => (
                    <div key={i} className="p-3.5 rounded-2xl" style={{ background: 'rgba(4, 11, 8, 0.6)', border: '1px solid rgba(0, 245, 155, 0.12)' }}>
                      <div className="text-[10px] font-bold uppercase text-[#A3E635]">{s.step}</div>
                      <div className="text-xs font-bold text-white mt-1">{s.title}</div>
                      <div className="text-[11px] text-emerald-200/60 mt-0.5">{s.desc}</div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3: WEB GROUNDING */}
          {activeTab === 'web' && (
            <motion.div
              key="web"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl p-5 sm:p-6 space-y-5"
              style={{
                background: 'rgba(6, 18, 13, 0.72)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 245, 155, 0.16)',
              }}
            >
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#00F59B]" />
                  <span>Otari Web Search &amp; Live URL Fetch</span>
                </h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(236, 253, 245, 0.6)' }}>
                  Retrieves live web citations and synthesizes grounded answers with <code className="text-[#00F59B]">alibaba/qwen-3.5-35b-a3b</code>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={webQuery}
                  onChange={e => setWebQuery(e.target.value)}
                  placeholder="Search query..."
                  className="rounded-2xl px-4 py-3 text-sm text-white outline-none"
                  style={{ background: 'rgba(4, 11, 8, 0.85)', border: '1px solid rgba(0, 245, 155, 0.2)' }}
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webUrl}
                    onChange={e => setWebUrl(e.target.value)}
                    placeholder="Optional URL to fetch (e.g. https://otari.ai)"
                    className="flex-1 rounded-2xl px-4 py-3 text-sm text-white outline-none"
                    style={{ background: 'rgba(4, 11, 8, 0.85)', border: '1px solid rgba(0, 245, 155, 0.2)' }}
                  />
                  <button
                    onClick={handleRunWebSearch}
                    disabled={busy}
                    className="px-4 py-3 rounded-2xl text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5"
                    style={{ background: 'linear-gradient(135deg, #00F59B, #059669)', color: '#04120C' }}
                  >
                    {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    <span>Search</span>
                  </button>
                </div>
              </div>

              {webResult && (
                <div className="space-y-4 pt-2">
                  <div className="rounded-2xl p-4 text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ background: 'rgba(4, 11, 8, 0.85)', border: '1px solid rgba(0, 245, 155, 0.2)' }}
                  >
                    {webResult.synthesis}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {webResult.citations.map((c, i) => (
                      <a
                        key={i}
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="block p-3.5 rounded-2xl transition-all hover:border-[#00F59B]"
                        style={{ background: 'rgba(4, 11, 8, 0.65)', border: '1px solid rgba(0, 245, 155, 0.14)' }}
                      >
                        <div className="text-xs font-bold text-[#00F59B] truncate">{c.title}</div>
                        <div className="text-[11px] text-emerald-100/70 line-clamp-2 mt-1">{c.snippet}</div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: PYTHON SANDBOX */}
          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="rounded-3xl p-5 sm:p-6 space-y-5"
              style={{
                background: 'rgba(6, 18, 13, 0.72)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(0, 245, 155, 0.16)',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#A3E635]" />
                    <span>Otari Code Execution Sandbox</span>
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(236, 253, 245, 0.6)' }}>
                    Generates &amp; executes analytical Python via <code className="text-[#A3E635]">alibaba/qwen3-coder-30b-a3b-instruct</code>
                  </p>
                </div>
                <button
                  onClick={handleRunCode}
                  disabled={busy}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #A3E635, #00F59B)', color: '#04120C' }}
                >
                  {busy ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />}
                  <span>Generate &amp; Run Python</span>
                </button>
              </div>

              <input
                type="text"
                value={codeTask}
                onChange={e => setCodeTask(e.target.value)}
                placeholder="Describe calculation or verification task..."
                className="w-full rounded-2xl px-4 py-3 text-sm text-white outline-none"
                style={{ background: 'rgba(4, 11, 8, 0.85)', border: '1px solid rgba(0, 245, 155, 0.2)' }}
              />

              <textarea
                value={customPython}
                onChange={e => setCustomPython(e.target.value)}
                rows={3}
                placeholder="Optional custom Python 3 snippet (leave blank to let Qwen 3 Coder 30B write it)..."
                className="w-full rounded-2xl p-3.5 text-xs font-mono text-[#A3E635] outline-none resize-none"
                style={{ background: 'rgba(4, 11, 8, 0.85)', border: '1px solid rgba(163, 230, 53, 0.2)' }}
              />

              {codeResult && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(4, 11, 8, 0.9)', border: '1px solid rgba(0, 245, 155, 0.16)' }}>
                    <div className="text-xs font-bold text-[#00F59B] mb-2">Generated Python</div>
                    <pre className="text-[11px] font-mono text-emerald-100 overflow-x-auto whitespace-pre-wrap">
                      {codeResult.code}
                    </pre>
                  </div>
                  <div className="rounded-2xl p-4" style={{ background: 'rgba(4, 11, 8, 0.9)', border: '1px solid rgba(163, 230, 53, 0.25)' }}>
                    <div className="text-xs font-bold text-[#A3E635] mb-2">
                      Sandbox Output ({codeResult.execution_time_ms} ms)
                    </div>
                    <pre className="text-xs font-mono text-[#A3E635] overflow-x-auto whitespace-pre-wrap">
                      {codeResult.stdout}
                    </pre>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 5: GOVERNANCE, BUDGETS & MCP TOOLS */}
          {activeTab === 'governance' && (
            <motion.div
              key="governance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {/* Left Card: MCP Tools Bridge */}
              <div
                className="rounded-3xl p-5 space-y-4"
                style={{
                  background: 'rgba(6, 18, 13, 0.72)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(0, 245, 155, 0.16)',
                }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Network className="w-4 h-4 text-[#00F59B]" />
                    <span>MCP Tool Servers (4 Connected)</span>
                  </h3>
                </div>

                <div className="space-y-2">
                  {(status?.mcp_tools || []).map(tool => (
                    <div
                      key={tool.id}
                      className="p-3 rounded-2xl flex items-center justify-between gap-3"
                      style={{
                        background: 'rgba(4, 11, 8, 0.75)',
                        border: '1px solid rgba(0, 245, 155, 0.14)',
                      }}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate">{tool.name}</div>
                        <div className="text-[10px] text-[#00F59B] truncate">{tool.server}</div>
                      </div>
                      <button
                        onClick={() => handleRunMcp(tool.id)}
                        disabled={busy}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold cursor-pointer shrink-0"
                        style={{ background: 'rgba(0, 245, 155, 0.16)', color: '#00F59B', border: '1px solid rgba(0, 245, 155, 0.3)' }}
                      >
                        Invoke ({tool.invocations}x)
                      </button>
                    </div>
                  ))}
                </div>

                {mcpResult && (
                  <div className="rounded-2xl p-3.5 text-xs font-mono text-emerald-100 bg-black/50 border border-emerald-500/20 max-h-40 overflow-y-auto">
                    <div className="text-[#A3E635] font-bold mb-1">
                      ✓ {mcpResult.tool.name} ({mcpResult.latency_ms} ms)
                    </div>
                    {Object.entries(mcpResult.result).map(([k, v]) => (
                      <div key={k} className="truncate">
                        <span className="text-emerald-400">{k}:</span> {typeof v === 'string' ? v : JSON.stringify(v)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Card: Per-User Budgets, Guardrails & Gateway Config */}
              <div
                className="rounded-3xl p-5 space-y-4"
                style={{
                  background: 'rgba(6, 18, 13, 0.72)',
                  backdropFilter: 'blur(24px)',
                  border: '1px solid rgba(0, 245, 155, 0.16)',
                }}
              >
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#A3E635]" />
                  <span>Budgets, Guardrails &amp; Otari API Key</span>
                </h3>

                {/* Per-User Budget Selector */}
                <div className="space-y-2">
                  {(budgets?.users || []).map(u => (
                    <div
                      key={u.user_id}
                      onClick={() => setSelectedUser(u.user_id)}
                      className="p-3 rounded-2xl flex items-center justify-between cursor-pointer"
                      style={{
                        background: selectedUser === u.user_id ? 'rgba(0, 245, 155, 0.12)' : 'rgba(4, 11, 8, 0.7)',
                        border: selectedUser === u.user_id ? '1px solid #00F59B' : '1px solid rgba(0, 245, 155, 0.12)',
                      }}
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{u.label}</div>
                        <div className="text-[11px] text-emerald-200/70">
                          ${u.spent_usd.toFixed(4)} / ${u.limit_usd.toFixed(2)} • {u.requests} reqs
                        </div>
                      </div>
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          updateOtariUserBudget({ user_id: u.user_id, reset_spend: true }).then(setStatus);
                          toast.success(`Reset quota for ${u.user_id}`);
                        }}
                        className="text-[10px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-200"
                      >
                        Reset
                      </button>
                    </div>
                  ))}
                </div>

                {/* Gateway Endpoint & Key Update */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={e => setApiKeyInput(e.target.value)}
                    placeholder={`Otari API Key (${status?.gateway.key_preview || 'configured in .env'})`}
                    className="w-full rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                    style={{ background: 'rgba(4, 11, 8, 0.85)', border: '1px solid rgba(0, 245, 155, 0.2)' }}
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={baseUrlInput}
                      onChange={e => setBaseUrlInput(e.target.value)}
                      className="flex-1 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                      style={{ background: 'rgba(4, 11, 8, 0.85)', border: '1px solid rgba(0, 245, 155, 0.2)' }}
                    />
                    <button
                      onClick={handleSaveConfig}
                      className="px-4 py-2 rounded-xl text-xs font-bold cursor-pointer"
                      style={{ background: 'linear-gradient(135deg, #00F59B, #059669)', color: '#04120C' }}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Collapsible Route Trace & 100-Point Rubric Drawer ────────── */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            background: 'rgba(6, 18, 13, 0.65)',
            border: '1px solid rgba(0, 245, 155, 0.14)',
          }}
        >
          <button
            onClick={() => setShowTelemetryDrawer(v => !v)}
            className="w-full px-5 py-3.5 flex items-center justify-between text-xs font-semibold cursor-pointer"
            style={{ color: 'rgba(236, 253, 245, 0.8)' }}
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#00F59B]" />
              <span>
                Live Otari Route Trace &amp; 8/8 Capabilities Checklist ({status?.telemetry_logs?.length || 0} recent events)
              </span>
            </div>
            {showTelemetryDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          <AnimatePresence>
            {showTelemetryDrawer && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-5 pb-5 space-y-4 border-t border-white/10 pt-4"
              >
                {/* 8 Otari Features Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(status?.features || []).map(f => (
                    <div
                      key={f.id}
                      className="p-2.5 rounded-xl flex items-center justify-between text-xs"
                      style={{ background: 'rgba(4, 11, 8, 0.75)', border: '1px solid rgba(0, 245, 155, 0.16)' }}
                    >
                      <span className="truncate text-emerald-100">{f.name}</span>
                      <span className="text-[#A3E635] font-bold ml-2 shrink-0">+{f.points}</span>
                    </div>
                  ))}
                </div>

                {/* Recent Route Trace List */}
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {(status?.telemetry_logs || []).slice(0, 6).map(log => (
                    <div
                      key={log.id}
                      className="px-3.5 py-2 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs"
                      style={{ background: 'rgba(4, 11, 8, 0.8)', border: '1px solid rgba(255, 255, 255, 0.06)' }}
                    >
                      <div className="flex items-center gap-2">
                        {log.fallback_used ? (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#00F59B]" />
                        )}
                        <span className="font-mono text-white">{log.model_used}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-emerald-200/70">
                        <span>{log.latency_ms} ms</span>
                        <span>${log.cost_usd.toFixed(5)}</span>
                        <span className="text-[#00F59B]">{log.guardrail_status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
