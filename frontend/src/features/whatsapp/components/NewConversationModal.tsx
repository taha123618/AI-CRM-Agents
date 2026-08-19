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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 font-mono">
      <div className="w-full max-w-md bg-[#1F2833] border border-[#3A4552] rounded-none shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#3A4552] bg-[#0B0C10]">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
            <div className="p-1 rounded-none bg-[#0B0C10] border border-[#FFB800]/50 text-[#FFB800]">
              <Phone className="w-3.5 h-3.5" />
            </div>
            NEW WHATSAPP CONVERSATION
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-none text-slate-400 hover:text-white transition-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3 font-mono">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <User className="w-3 h-3 text-[#FFB800]" /> CONTACT NAME
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="E.G. SARAH JOHNSON"
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#FFB800] uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Phone className="w-3 h-3 text-[#FFB800]" /> PHONE NUMBER *
            </label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 (555) 000-0000"
              required
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#FFB800]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              OPENING MESSAGE *
            </label>
            <textarea
              rows={3}
              value={firstMessage}
              onChange={(e) => setFirstMessage(e.target.value)}
              placeholder="HI [NAME], I'M REACHING OUT FROM AI CRM..."
              required
              className="w-full bg-[#0B0C10] border border-[#3A4552] rounded-none px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#FFB800] resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-[#3A4552]">
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
              type="submit"
              variant="primary"
              size="sm"
              className="flex-1 text-xs"
              isLoading={sendMutation.isPending}
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              DISPATCH
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
