export interface WarRoomDeal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  probability: number;
  health_score: number;
  closing_date: string | null;
  win_probability_pct: number;
}

export interface AgentPerspective {
  agent_name: string;
  role: string;
  rating: number;
  insight: string;
}

export interface SwotAnalysis {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface CompetitorBattleCard {
  competitor: string;
  vulnerabilities: string;
  counter_objection: string;
  kill_shot: string;
}

export interface StakeholderInfluence {
  name: string;
  role: string;
  stance: string;
  influence: string;
  strategy: string;
}

export interface DealStrategyMatrix {
  deal_id: string;
  deal_title: string;
  company: string;
  value: number;
  stage: string;
  consensus_health_score: number;
  cross_agent_verdict: string;
  agent_perspectives: AgentPerspective[];
  swot_analysis: SwotAnalysis;
  competitor_battle_cards: CompetitorBattleCard[];
  stakeholder_influence_map: StakeholderInfluence[];
  recommended_win_actions: string[];
}

export interface GenerateProposalPayload {
  deal_id: string;
  tier: 'starter' | 'growth' | 'enterprise';
  custom_discount_pct: number;
  include_sla_guarantee: boolean;
  custom_terms?: string;
}

export interface GeneratedProposal {
  proposal_id: string;
  deal_id: string;
  deal_title: string;
  company: string;
  tier: string;
  pricing: {
    currency: string;
    base_arr: number;
    discount_pct: number;
    discount_amount: number;
    final_arr: number;
    billing_cadence: string;
  };
  executive_summary: string;
  modules_included: string[];
  sla_terms: string;
  custom_notes: string;
  status: string;
  esign_url: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger_event: string;
  trigger_threshold: any;
  action_agent: string;
  action_type: string;
  status: 'active' | 'paused';
  executions_count: number;
}
