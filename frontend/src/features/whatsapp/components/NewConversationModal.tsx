import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { whatsappApi } from '../api/whatsappApi';
import { X, Phone, User, Send } from 'lucide-react';

interface NewConversationModalProps {
  onClose: () => void;
}

export function NewConversationModal({ onClose }: NewConversationModalProps) {
  const queryClient = useQueryClient();
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [firstMessage, setFirstMessage] = useState('');

  const sendMutation = useMutation({
    mutationFn: () =>
      whatsappApi.sendMessage({
        phone_number: phoneNumber,
        contact_name: contactName || 'Prospect',
        text: firstMessage,
        sender_type: 'agent',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-conversations'] });
      queryClient.invalidateQueries({ queryKey: ['whatsapp-stats'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !firstMessage.trim()) return;
    sendMutation.mutate();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl shadow-emerald-500/10">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <h2 className="text-sm font-black text-white flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Phone className="w-3.5 h-3.5" />
            </div>
            New WhatsApp Conversation
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3 h-3" /> Contact Name
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Phone Number *
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Opening Message *
            </label>
            <textarea
              rows={3}
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="Hi [Name], I'm reaching out from AI CRM..."
              required
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
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
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500"
              isLoading={sendMutation.isPending}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Send Message
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
