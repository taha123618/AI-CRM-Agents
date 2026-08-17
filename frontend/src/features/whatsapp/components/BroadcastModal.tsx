import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { whatsappApi } from '../api/whatsappApi';
import { X, Megaphone, Plus, Trash2, Send } from 'lucide-react';

interface BroadcastModalProps {
  onClose: () => void;
}

const TEMPLATES = [
  {
    name: 'Enterprise Pricing',
    text: "Hi! 👋 We'd love to share our enterprise pricing tiers and custom ROI analysis. Would you like a tailored proposal this week?",
  },
  {
    name: 'Demo Invite',
    text: "Hello! 🚀 I'd like to invite you to a personalized 15-minute live demo of our AI CRM agent fleet. Does this week work for you?",
  },
  {
    name: 'Follow-Up Nudge',
    text: "Hi there! Just following up on our last conversation. Have you had a chance to review the proposal? Happy to answer any questions!",
  },
  {
    name: 'Customer Check-In',
    text: "Hey! 🌟 Quick check-in from your AI CRM success team. How are things going? Any feedback or requests we can help with?",
  },
];

export function BroadcastModal({ onClose }: BroadcastModalProps) {
  const queryClient = useQueryClient();
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [customText, setCustomText] = useState(TEMPLATES[0].text);
  const [phoneList, setPhoneList] = useState(['+1 (415) 555-0001', '+1 (415) 555-0002']);
  const [newPhone, setNewPhone] = useState('');

  const broadcastMutation = useMutation({
    mutationFn: () =>
      whatsappApi.sendBroadcast({
        phone_numbers: phoneList,
        template_text: customText,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-stats'] });
      alert(`✅ Broadcast sent to ${data.recipients} recipients!`);
      onClose();
    },
  });

  const addPhone = () => {
    if (newPhone.trim() && !phoneList.includes(newPhone.trim())) {
      setPhoneList([...phoneList, newPhone.trim()]);
      setNewPhone('');
    }
  };

  const removePhone = (p: string) => setPhoneList(phoneList.filter((x) => x !== p));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-emerald-500/10 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 shrink-0">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            Broadcast Message Campaign
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Template Selector */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Select Template
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.name}
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(tmpl);
                    setCustomText(tmpl.text);
                  }}
                  className={`p-2.5 rounded-xl text-left text-xs border transition-all ${
                    selectedTemplate.name === tmpl.name
                      ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Message Text */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Message Content
            </label>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Recipients */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Recipients ({phoneList.length})
            </label>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {phoneList.map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono"
                >
                  <span>{p}</span>
                  <button
                    type="button"
                    onClick={() => removePhone(p)}
                    className="text-slate-600 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addPhone()}
                placeholder="+1 (555) 000-0000"
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhone}
                className="border-slate-700 text-slate-400"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 border-slate-700 text-slate-400"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-500"
            isLoading={broadcastMutation.isPending}
            onClick={() => broadcastMutation.mutate()}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send to {phoneList.length} Recipients
          </Button>
        </div>
      </div>
    </div>
  );
}
