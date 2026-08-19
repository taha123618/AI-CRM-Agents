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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 font-mono">
      <div className="w-full max-w-lg bg-card border border-border rounded-none shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background shrink-0">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <div className="p-1.5 rounded-none bg-background border border-primary/50 text-primary">
              <Megaphone className="w-3.5 h-3.5" />
            </div>
            BROADCAST CAMPAIGN STUDIO
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-none text-muted-foreground hover:text-white transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono">
          {/* Template Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              SELECT TEMPLATE
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
                  className={`p-2.5 rounded-none text-left text-xs uppercase font-mono border transition-none ${selectedTemplate.name === tmpl.name
                      ? 'bg-background border-primary text-primary'
                      : 'bg-background border-border text-muted-foreground hover:text-white'
                    }`}
                >
                  {tmpl.name}
                </button>
              ))}
            </div>
          </div>

          {/* Message Text */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              MESSAGE CONTENT
            </label>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-background border border-border rounded-none px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Recipients */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              RECIPIENTS ({phoneList.length})
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {phoneList.map((p) => (
                <div
                  key={p}
                  className="flex items-center justify-between px-2.5 py-1.5 rounded-none bg-background border border-border text-xs text-foreground/80 font-mono"
                >
                  <span>{p}</span>
                  <button
                    type="button"
                    onClick={() => removePhone(p)}
                    className="text-muted-foreground/60 hover:text-destructive transition-none"
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
                className="flex-1 bg-background border border-border rounded-none px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-primary"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPhone}
                className="text-xs h-8"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-border flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            onClick={onClose}
          >
            CANCEL
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            className="flex-1 text-xs"
            isLoading={broadcastMutation.isPending}
            onClick={() => broadcastMutation.mutate()}
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            DISPATCH TO {phoneList.length} RECIPIENTS
          </Button>
        </div>
      </div>
    </div>
  );
}
