import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CallTranscriptModal } from '../components/CallTranscriptModal';
import { VoiceCall } from '../types/voiceAi.types';

const mockVoiceCall: VoiceCall = {
  id: 'call-test-123',
  contact_name: 'Marcus Vance',
  phone_number: '+1 (555) 234-8901',
  status: 'completed',
  direction: 'outbound',
  duration_seconds: 145,
  recording_url: 'https://example.com/recording.mp3',
  summary: 'Discussed inbound lead qualification pain points and competitor pricing against Salesforce.',
  buyer_intent_score: 85,
  sentiment: 'positive',
  action_items: [
    'Send custom enterprise proposal with 3-tier SLA breakdown',
    'Follow up with VP of Sales next Tuesday at 2 PM EST',
  ],
  objections_handled: ['Pricing vs Salesforce', 'Security / Data sovereignty'],
  created_at: '2026-08-20T10:00:00Z',
};

describe('Voice AI Feature & Call Intelligence Suite', () => {
  it('renders CallTranscriptModal with contact metadata and summary', () => {
    const handleClose = vi.fn();
    render(<CallTranscriptModal call={mockVoiceCall} onClose={handleClose} />);

    expect(screen.getAllByText(/Marcus Vance/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/\+1 \(555\) 234-8901/i)).toBeInTheDocument();
    expect(screen.getByText(/2M 25S/i)).toBeInTheDocument();
  });

  it('renders speech turn transcripts and dynamic coaching tips in modal', () => {
    const handleClose = vi.fn();
    render(<CallTranscriptModal call={mockVoiceCall} onClose={handleClose} />);

    expect(screen.getByText(/Hi Marcus! Thanks for hopping on the line/i)).toBeInTheDocument();
    expect(screen.getByText(/Pain detected — pivot to automation ROI/i)).toBeInTheDocument();
  });

  it('triggers onClose when close button is clicked', () => {
    const handleClose = vi.fn();
    const { container } = render(<CallTranscriptModal call={mockVoiceCall} onClose={handleClose} />);
    
    // Find header close button
    const closeBtn = container.querySelector('button');
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalled();
    }
  });
});
