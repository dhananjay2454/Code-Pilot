import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Brain,
  Zap,
  Sparkles,
  Cloud,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  KeyRound,
  Loader2,
  Laptop
} from 'lucide-react';
import {
  AiConfig,
  AiProvider,
  getStoredAiConfig,
  saveAiConfig,
} from '@/services/aiEvaluator';
import { useToast } from '@/hooks/use-toast';

interface AiSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigSaved?: (config: AiConfig) => void;
}

export default function AiSettingsModal({
  open,
  onOpenChange,
  onConfigSaved,
}: AiSettingsModalProps) {
  const [config, setConfig] = useState<AiConfig>(getStoredAiConfig);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const handleSave = () => {
    const saved = saveAiConfig(config);
    if (onConfigSaved) onConfigSaved(saved);
    toast({
      title: 'AI Settings Saved',
      description: `Provider set to ${config.provider.toUpperCase()}.`,
    });
    onOpenChange(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      if (config.provider === 'offline') {
        setTestResult({
          success: true,
          message: 'Smart Offline Mode is built-in and always ready. No network required!',
        });
        return;
      }

      if (config.provider === 'groq') {
        if (!config.groqApiKey?.trim()) {
          throw new Error('Please enter a Groq API Key first.');
        }

        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.groqApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: config.groqModel || 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'respond with: {"ping":"pong"}' }],
            max_tokens: 30,
            temperature: 0.1,
          }),
        });

        if (!res.ok) {
          const t = await res.text();
          let msg = t;
          try {
            msg = JSON.parse(t)?.error?.message || t;
          } catch {}
          throw new Error(`Groq rejected key (${res.status}): ${msg}`);
        }

        setTestResult({
          success: true,
          message: `Connected successfully to Groq (${config.groqModel || 'llama-3.3-70b-versatile'})!`,
        });
        return;
      }

      if (config.provider === 'gemini') {
        if (!config.geminiApiKey?.trim()) {
          throw new Error('Please enter a Google Gemini API Key first.');
        }

        const model = config.geminiModel || 'gemini-2.0-flash';
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.geminiApiKey.trim()}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'respond with pong' }] }],
            }),
          }
        );

        if (!res.ok) {
          const t = await res.text();
          let msg = t;
          try {
            msg = JSON.parse(t)?.error?.message || t;
          } catch {}
          throw new Error(`Gemini rejected key (${res.status}): ${msg}`);
        }

        setTestResult({
          success: true,
          message: `Connected successfully to Google Gemini (${model})!`,
        });
        return;
      }

      if (config.provider === 'supabase' || config.provider === 'auto') {
        setTestResult({
          success: true,
          message: 'Default provider configured. If the backend is offline, Auto-Fallback will instantly engage.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Connection test failed.',
      });
    } finally {
      setTesting(false);
    }
  };

  const providers: { id: AiProvider; title: string; desc: string; icon: any; badge?: string }[] = [
    {
      id: 'auto',
      title: 'Auto (Recommended)',
      desc: 'Tries Groq/Gemini key if available, else Supabase backend, with automatic Smart Offline fallback',
      icon: Sparkles,
      badge: 'Smartest',
    },
    {
      id: 'groq',
      title: 'Groq Cloud',
      desc: 'Ultra-fast inference with Llama 3.3 70B directly from your browser',
      icon: Zap,
      badge: 'Direct API',
    },
    {
      id: 'gemini',
      title: 'Google Gemini',
      desc: 'Direct calls to Google Gemini 2.0 / 1.5 Flash',
      icon: Brain,
      badge: 'Direct API',
    },
    {
      id: 'offline',
      title: 'Smart Offline Mode',
      desc: '100% free, runs entirely in browser without any API key or backend',
      icon: Laptop,
      badge: 'No Key Needed',
    },
    {
      id: 'supabase',
      title: 'Supabase Backend',
      desc: 'Uses project remote edge function (may require edge function deployment)',
      icon: Cloud,
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl gradient-primary text-primary-foreground">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">AI Evaluation Settings</DialogTitle>
              <DialogDescription>
                Configure which AI engine evaluates your code reverse engineering
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Provider Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Select AI Engine
            </label>
            <div className="grid sm:grid-cols-2 gap-2.5">
              {providers.map((p) => {
                const Icon = p.icon;
                const isSelected = config.provider === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setConfig((prev) => ({ ...prev, provider: p.id }));
                      setTestResult(null);
                    }}
                    className={`flex flex-col text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/10 shadow-sm ring-1 ring-primary/40'
                        : 'border-border/60 bg-secondary/30 hover:bg-secondary/60'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="font-semibold text-sm text-foreground">{p.title}</span>
                      </div>
                      {p.badge && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-primary/20 text-primary">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{p.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provider Specific Inputs */}
          {(config.provider === 'groq' || config.provider === 'auto') && (
            <div className="p-4 rounded-xl bg-secondary/40 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Groq API Key</span>
                </div>
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Get free key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <Input
                type="password"
                placeholder="gsk_..."
                value={config.groqApiKey}
                onChange={(e) => setConfig({ ...config, groqApiKey: e.target.value })}
                className="font-mono text-xs bg-background"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Model</span>
                <select
                  value={config.groqModel}
                  onChange={(e) => setConfig({ ...config, groqModel: e.target.value })}
                  className="text-xs bg-background border border-border/60 rounded-lg px-2.5 py-1 text-foreground"
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Best)</option>
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                </select>
              </div>
            </div>
          )}

          {(config.provider === 'gemini' || (config.provider === 'auto' && !config.groqApiKey)) && (
            <div className="p-4 rounded-xl bg-secondary/40 border border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">Google Gemini API Key</span>
                </div>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  Get free key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <Input
                type="password"
                placeholder="AIzaSy..."
                value={config.geminiApiKey}
                onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                className="font-mono text-xs bg-background"
              />
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-muted-foreground">Model</span>
                <select
                  value={config.geminiModel}
                  onChange={(e) => setConfig({ ...config, geminiModel: e.target.value })}
                  className="text-xs bg-background border border-border/60 rounded-lg px-2.5 py-1 text-foreground"
                >
                  <option value="gemini-2.0-flash">gemini-2.0-flash (Fast & Accurate)</option>
                  <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                </select>
              </div>
            </div>
          )}

          {/* Fallback Option */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-primary/5 border border-primary/20">
            <div className="space-y-0.5 pr-4">
              <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Smart Offline Fallback
              </div>
              <p className="text-xs text-muted-foreground">
                If the selected API or Supabase backend encounters an error, automatically generate realistic offline evaluation so you never get stuck.
              </p>
            </div>
            <Switch
              checked={config.autoFallback}
              onCheckedChange={(checked) => setConfig({ ...config, autoFallback: checked })}
            />
          </div>

          {/* Test Status feedback */}
          {testResult && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-primary/10 border-primary/30 text-foreground'
                  : 'bg-destructive/10 border-destructive/30 text-destructive'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <p className="leading-relaxed">{testResult.message}</p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing}
              className="w-full sm:w-auto rounded-full gap-2 text-xs"
            >
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
              Test Connection
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="rounded-full text-xs"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleSave}
                className="rounded-full px-5 text-xs shadow-md shadow-primary/20"
              >
                Save & Apply
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
