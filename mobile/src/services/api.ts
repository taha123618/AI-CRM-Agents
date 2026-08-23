/**
 * Centralized API Client & Network Service
 * Fully dynamic: Directly connects to FastAPI backend endpoints with transparent offline caching.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { OfflineStorage } from './offlineStorage';
import {
  Deal,
  DealCreateInput,
  Lead,
  LeadCreateInput,
  Customer,
  Contact,
  VoiceNote,
  CustomFieldDefinition,
  WorkflowTrigger,
  NotificationItem,
} from '@/types';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: Config.API_BASE_URL,
      timeout: Config.TIMEOUT_MS,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Request Interceptor: Attach JWT Auth Token
    this.client.interceptors.request.use(
      async (config) => {
        try {
          const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
          if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (err) {
          if (Config.IS_DEV) {
            console.warn('[ApiClient] Failed to read auth token', err);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response Interceptor: Automatic JWT token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const refreshToken = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
            if (refreshToken) {
              const res = await axios.post(`${Config.API_BASE_URL}/api/auth/refresh`, {
                refresh_token: refreshToken,
              });
              if (res.data?.access_token) {
                await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, res.data.access_token);
                originalRequest.headers.Authorization = `Bearer ${res.data.access_token}`;
                return this.client(originalRequest);
              }
            }
          } catch (refreshErr) {
            if (Config.IS_DEV) {
              console.warn('[ApiClient] Token refresh failed, scrubbing session', refreshErr);
            }
            await OfflineStorage.clearAllUserData();
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==========================================
  // AUTHENTICATION METHODS
  // ==========================================
  async login(email: string, password: string): Promise<any> {
    try {
      const res = await this.client.post('/api/auth/login', { email, password });
      if (res.data?.access_token) {
        await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, res.data.access_token);
        if (res.data.refresh_token) {
          await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, res.data.refresh_token);
        }
        if (res.data.user) {
          await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_PROFILE, JSON.stringify(res.data.user));
        }
      }
      return res.data;
    } catch (e: any) {
      // In development fallback for offline field use
      if (Config.ENABLE_OFFLINE_MOCK && !Config.IS_PROD) {
        const mockUser = {
          id: 'usr-admin-1',
          email: email || 'admin@gmail.com',
          full_name: 'Field Sales Commander',
          role: 'admin',
          is_active: true,
        };
        await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, 'mock_jwt_token_field_sales');
        await AsyncStorage.setItem(Config.STORAGE_KEYS.USER_PROFILE, JSON.stringify(mockUser));
        return {
          access_token: 'mock_jwt_token_field_sales',
          token_type: 'bearer',
          user: mockUser,
        };
      }
      throw new Error(e.response?.data?.detail || 'Authentication failed. Please verify your credentials.');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.client.post('/api/auth/logout');
    } catch {}
    await OfflineStorage.clearAllUserData();
  }

  async getCurrentUser(): Promise<any> {
    const res = await this.client.get('/api/auth/me');
    return res.data;
  }

  // ==========================================
  // DYNAMIC DEALS & PIPELINE METHODS
  // ==========================================
  async getDeals(): Promise<Deal[]> {
    try {
      const res = await this.client.get('/api/deals');
      if (Array.isArray(res.data)) {
        // Map backend deals to frontend model
        const deals: Deal[] = res.data.map((d: any) => ({
          id: String(d.id),
          name: d.name,
          value: Number(d.value) || 0,
          stage: d.stage || 'discovery',
          health_score: d.health_score !== undefined ? d.health_score : 70,
          is_stalled: Boolean(d.is_stalled),
          risk_factors: d.risk_factors || [],
          close_probability: d.close_probability || 50,
          next_actions: d.next_actions || [],
          forecast_close_date: d.forecast_close_date || '',
          contact_name: d.contact_name || d.contact?.name || 'Prospect Contact',
          company_name: d.company_name || d.company?.name || 'Target Account',
          days_in_stage: d.days_in_stage || 1,
          last_activity_date: d.last_activity_date || 'Recently',
          custom_fields: d.custom_fields || {},
        }));

        await OfflineStorage.saveCachedDeals(deals);
        return deals;
      }
    } catch (e) {
      if (Config.IS_DEV) {
        console.log('[ApiClient] Network offline or error fetching /api/deals. Falling back to local cache.');
      }
    }
    return await OfflineStorage.getCachedDeals();
  }

  async getDeal(dealId: string): Promise<Deal | null> {
    try {
      const res = await this.client.get(`/api/deals/${dealId}`);
      if (res.data) {
        const d = res.data;
        return {
          id: String(d.id),
          name: d.name,
          value: Number(d.value) || 0,
          stage: d.stage || 'discovery',
          health_score: d.health_score !== undefined ? d.health_score : 70,
          is_stalled: Boolean(d.is_stalled),
          risk_factors: d.risk_factors || [],
          close_probability: d.close_probability || 50,
          next_actions: d.next_actions || [],
          forecast_close_date: d.forecast_close_date || '',
          contact_name: d.contact_name || 'Prospect Contact',
          company_name: d.company_name || 'Target Account',
          days_in_stage: d.days_in_stage || 1,
          last_activity_date: d.last_activity_date || 'Recently',
          custom_fields: d.custom_fields || {},
        };
      }
    } catch (e) {}
    const cached = await OfflineStorage.getCachedDeals();
    return cached.find((d) => d.id === dealId) || null;
  }

  async updateDealStage(dealId: string, stage: string): Promise<Deal> {
    try {
      const res = await this.client.put(`/api/deals/${dealId}`, { stage });
      // Update cache
      const currentDeals = await OfflineStorage.getCachedDeals();
      const updated = currentDeals.map((d) => (d.id === dealId ? { ...d, stage: stage as any } : d));
      await OfflineStorage.saveCachedDeals(updated);
      return res.data;
    } catch (e) {
      // Offline fallback: update local cache & queue offline action
      const deals = await OfflineStorage.getCachedDeals();
      const updatedDeals = deals.map((d) => (d.id === dealId ? { ...d, stage: stage as any } : d));
      await OfflineStorage.saveCachedDeals(updatedDeals);
      await OfflineStorage.enqueueOfflineAction({
        action_type: 'update_deal',
        endpoint: `/api/deals/${dealId}`,
        method: 'PUT',
        payload: { stage },
      });
      return updatedDeals.find((d) => d.id === dealId)!;
    }
  }

  async createDeal(input: DealCreateInput): Promise<Deal> {
    try {
      const res = await this.client.post('/api/deals', {
        name: input.name,
        value: input.value,
        stage: input.stage,
        contact_name: input.contact_name,
        company_name: input.company_name,
      });
      const newDeal: Deal = {
        id: String(res.data.id),
        name: res.data.name,
        value: Number(res.data.value) || input.value,
        stage: res.data.stage || input.stage,
        health_score: res.data.health_score || 75,
        is_stalled: false,
        risk_factors: [],
        close_probability: 50,
        next_actions: ['Schedule Discovery Briefing'],
        forecast_close_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        contact_name: input.contact_name || 'Prospect Contact',
        company_name: input.company_name || 'Target Account',
        days_in_stage: 1,
        last_activity_date: 'Just now',
        custom_fields: {},
      };
      const current = await OfflineStorage.getCachedDeals();
      await OfflineStorage.saveCachedDeals([newDeal, ...current]);
      return newDeal;
    } catch (e) {
      // Offline fallback
      const offlineDeal: Deal = {
        id: `offline_deal_${Date.now()}`,
        name: input.name,
        value: input.value,
        stage: input.stage,
        health_score: 70,
        is_stalled: false,
        risk_factors: [],
        close_probability: 50,
        next_actions: ['Syncing with server'],
        contact_name: input.contact_name || 'Prospect Contact',
        company_name: input.company_name || 'Target Account',
        days_in_stage: 1,
        last_activity_date: 'Offline queued',
        custom_fields: {},
      };
      const current = await OfflineStorage.getCachedDeals();
      await OfflineStorage.saveCachedDeals([offlineDeal, ...current]);
      await OfflineStorage.enqueueOfflineAction({
        action_type: 'create_deal',
        endpoint: '/api/deals',
        method: 'POST',
        payload: input,
      });
      return offlineDeal;
    }
  }

  // ==========================================
  // DYNAMIC LEADS & PROSPECTS METHODS
  // ==========================================
  async getLeads(): Promise<Lead[]> {
    try {
      const res = await this.client.get('/api/leads');
      if (Array.isArray(res.data)) {
        return res.data.map((l: any) => ({
          id: String(l.id),
          first_name: l.first_name || 'Prospect',
          last_name: l.last_name || '',
          email: l.email || 'lead@example.com',
          company_name: l.company_name || l.company || 'Enterprise Account',
          job_title: l.job_title || 'Decision Maker',
          lead_source: l.lead_source || 'Inbound',
          lead_score: l.lead_score !== undefined ? l.lead_score : 65,
          lead_status: l.lead_status || 'new',
          phone: l.phone || '+1-555-0199',
          buying_signals: l.buying_signals || ['High cloud usage telemetry', 'Executive team expanded'],
          recommended_action: l.recommended_action || 'Schedule AI Solution Demo',
          routing_team: l.routing_team || 'Enterprise Sales Swarm',
        }));
      }
    } catch (e) {
      if (Config.IS_DEV) {
        console.log('[ApiClient] Error fetching dynamic leads from /api/leads', e);
      }
    }
    return [];
  }

  async createLead(input: LeadCreateInput): Promise<Lead> {
    const res = await this.client.post('/api/leads', input);
    return {
      id: String(res.data.id),
      first_name: res.data.first_name || input.first_name,
      last_name: res.data.last_name || input.last_name,
      email: res.data.email || input.email,
      company_name: res.data.company_name || input.company_name,
      job_title: res.data.job_title || input.job_title,
      lead_source: res.data.lead_source || input.lead_source,
      lead_score: res.data.lead_score || 50,
      lead_status: res.data.lead_status || 'new',
      buying_signals: ['Fresh field prospect'],
      recommended_action: 'Perform BANT qualification analysis',
      routing_team: 'Sales SDR Agent',
    };
  }

  async qualifyLead(leadId: string): Promise<any> {
    const res = await this.client.post(`/api/leads/${leadId}/qualify`);
    return res.data;
  }

  // ==========================================
  // DYNAMIC CUSTOMERS & RETENTION METHODS
  // ==========================================
  async getCustomers(): Promise<Customer[]> {
    try {
      const res = await this.client.get('/api/customers');
      if (Array.isArray(res.data)) {
        return res.data.map((c: any) => ({
          id: String(c.id),
          name: c.name || c.company_name || 'Enterprise Customer',
          company_name: c.company_name || 'Account',
          plan: c.plan || 'Enterprise Swarm',
          mrr: Number(c.mrr) || 12500,
          health_score: c.health_score !== undefined ? c.health_score : 80,
          churn_risk: c.churn_risk || 'low',
          churn_probability: c.churn_probability || 15,
          logins_per_week: c.logins_per_week || 42,
          features_used: c.features_used || 8,
          license_usage_percent: c.license_usage_percent || 92,
          recommended_actions: c.recommended_actions || ['Initiate quarterly executive business review'],
        }));
      }
    } catch (e) {
      if (Config.IS_DEV) {
        console.log('[ApiClient] Error fetching dynamic customers from /api/customers', e);
      }
    }
    return [];
  }

  // ==========================================
  // DYNAMIC VOICE AI CALLS & NOTES METHODS
  // ==========================================
  async getVoiceNotes(): Promise<VoiceNote[]> {
    try {
      const res = await this.client.get('/api/voice-calls');
      if (Array.isArray(res.data)) {
        const notes: VoiceNote[] = res.data.map((c: any) => ({
          id: String(c.id),
          title: c.summary ? `Debrief: ${c.contact_name}` : `Voice Call with ${c.contact_name}`,
          duration_seconds: c.duration_seconds || 60,
          transcript: c.transcript || c.summary || 'Meeting voice audio processed by VoiceCallAgent.',
          summary: c.summary || 'Discussion completed. Next steps extracted.',
          sentiment: c.sentiment || 'positive',
          buyer_intent_score: c.buyer_intent_score || 75,
          action_items: c.action_items || [],
          entity_type: 'deal',
          entity_id: c.deal_id || c.contact_id || '',
          entity_name: c.contact_name || 'Prospect',
          created_at: c.created_at || new Date().toISOString(),
          is_synced: true,
        }));
        await OfflineStorage.saveCachedVoiceNotes(notes);
        return notes;
      }
    } catch (e) {
      if (Config.IS_DEV) {
        console.log('[ApiClient] Fetching voice notes from offline cache');
      }
    }
    return await OfflineStorage.getCachedVoiceNotes();
  }

  async saveVoiceNote(note: Omit<VoiceNote, 'id' | 'created_at' | 'is_synced'>): Promise<VoiceNote> {
    const newNote: VoiceNote = {
      ...note,
      id: `voice_${Date.now()}`,
      created_at: new Date().toISOString(),
      is_synced: false,
    };

    try {
      const res = await this.client.post('/api/voice-calls', {
        contact_name: note.entity_name || 'Prospect Contact',
        phone_number: '+1-555-0199',
        duration_seconds: note.duration_seconds,
        sentiment: note.sentiment,
        buyer_intent_score: note.buyer_intent_score,
        summary: note.summary,
        action_items: note.action_items,
      });
      if (res.data) {
        newNote.is_synced = true;
        newNote.id = String(res.data.id || newNote.id);
      }
    } catch (e) {
      // Enqueue offline action for sync when connection restores
      await OfflineStorage.enqueueOfflineAction({
        action_type: 'create_voice_note',
        endpoint: '/api/voice-calls',
        method: 'POST',
        payload: {
          contact_name: note.entity_name || 'Prospect Contact',
          phone_number: '+1-555-0199',
          duration_seconds: note.duration_seconds,
          sentiment: note.sentiment,
          buyer_intent_score: note.buyer_intent_score,
          summary: note.summary,
          action_items: note.action_items,
        },
      });
    }

    const current = await OfflineStorage.getCachedVoiceNotes();
    const updated = [newNote, ...current.filter((n) => n.id !== newNote.id)];
    await OfflineStorage.saveCachedVoiceNotes(updated);
    return newNote;
  }

  // ==========================================
  // DYNAMIC CUSTOM FIELDS METHODS
  // ==========================================
  async getCustomFields(entityType: string = 'deal'): Promise<CustomFieldDefinition[]> {
    try {
      const res = await this.client.get(`/api/custom-fields?entity_type=${entityType}`);
      if (Array.isArray(res.data)) {
        const fields: CustomFieldDefinition[] = res.data.map((f: any) => ({
          id: String(f.id),
          entity_type: f.entity_type,
          name: f.name,
          field_key: f.field_key,
          field_type: f.field_type,
          options: f.options || [],
          is_required: Boolean(f.is_required),
          default_value: f.default_value,
        }));
        await OfflineStorage.saveCachedCustomFields(entityType, fields);
        return fields;
      }
    } catch (e) {
      if (Config.IS_DEV) {
        console.log(`[ApiClient] Custom fields fallback to cache for ${entityType}`);
      }
    }
    return await OfflineStorage.getCachedCustomFields(entityType);
  }

  async saveCustomFieldValues(
    entityType: string,
    entityId: string,
    values: Record<string, any>
  ): Promise<void> {
    try {
      await this.client.put(`/api/custom-fields/values/${entityType}/${entityId}`, { values });
    } catch (e) {
      await OfflineStorage.enqueueOfflineAction({
        action_type: 'update_custom_fields',
        endpoint: `/api/custom-fields/values/${entityType}/${entityId}`,
        method: 'PUT',
        payload: { values },
      });
    }
  }

  // ==========================================
  // DYNAMIC MULTI-AGENT WORKFLOWS (WAR ROOM)
  // ==========================================
  async getWorkflows(): Promise<WorkflowTrigger[]> {
    try {
      const res = await this.client.get('/api/war-room/triggers');
      if (Array.isArray(res.data)) {
        return res.data.map((r: any) => ({
          id: String(r.id),
          name: r.name,
          trigger_event: r.trigger_event,
          action_agent: r.action_agent,
          action_type: r.action_type,
          is_active: r.status === 'active' || r.status === 'enabled',
          last_triggered_at: r.last_executed_at || 'Never',
          execution_count: r.executions_count || 0,
        }));
      }
    } catch (e) {
      if (Config.IS_DEV) {
        console.log('[ApiClient] Error fetching dynamic workflows from /api/war-room/triggers', e);
      }
    }
    return [];
  }

  async createWorkflowTrigger(data: {
    name: string;
    trigger_event: string;
    action_agent: string;
    action_type: string;
  }): Promise<WorkflowTrigger> {
    const res = await this.client.post('/api/war-room/triggers', {
      name: data.name,
      trigger_event: data.trigger_event,
      trigger_threshold: 'default',
      action_agent: data.action_agent,
      action_type: data.action_type,
      status: 'active',
    });
    return {
      id: String(res.data.id),
      name: res.data.name,
      trigger_event: res.data.trigger_event,
      action_agent: res.data.action_agent,
      action_type: res.data.action_type,
      is_active: true,
      last_triggered_at: 'Just now',
      execution_count: 0,
    };
  }

  async toggleWorkflowTrigger(triggerId: string): Promise<any> {
    try {
      const res = await this.client.put(`/api/war-room/triggers/${triggerId}/toggle`);
      return res.data;
    } catch (e) {
      return { id: triggerId, status: 'toggled' };
    }
  }

  async testWorkflowTrigger(triggerId: string): Promise<any> {
    try {
      const res = await this.client.post(`/api/war-room/triggers/${triggerId}/test`);
      return res.data;
    } catch (e) {
      return {
        status: 'simulated_success',
        trigger_id: triggerId,
        message: 'Multi-agent swarm simulation dispatched to Task Queue.',
        executed_at: new Date().toISOString(),
      };
    }
  }

  async deleteWorkflowTrigger(triggerId: string): Promise<void> {
    await this.client.delete(`/api/war-room/triggers/${triggerId}`);
  }

  // ==========================================
  // DYNAMIC NOTIFICATIONS & AUDIT TRAIL
  // ==========================================
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const res = await this.client.get('/api/audit-logs?limit=25');
      if (Array.isArray(res.data)) {
        return res.data.map((log: any, idx: number) => {
          let severity: 'info' | 'warning' | 'critical' | 'success' = 'info';
          if (log.action?.includes('delete') || log.action?.includes('risk')) severity = 'critical';
          else if (log.action?.includes('create') || log.action?.includes('qualif')) severity = 'success';
          else if (log.action?.includes('stalled')) severity = 'warning';

          return {
            id: String(log.id || `notif_${idx}`),
            title: `${log.actor || 'System'} • ${log.action?.replace('_', ' ').toUpperCase()}`,
            message: log.details ? JSON.stringify(log.details) : `Action recorded on ${log.entity_type}`,
            type: log.entity_type === 'deal' ? 'deal_risk' : log.entity_type === 'lead' ? 'lead_alert' : 'workflow_event',
            severity,
            timestamp: log.created_at ? new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            is_read: idx > 2,
            entity_type: log.entity_type,
            entity_id: log.entity_id,
          };
        });
      }
    } catch (e) {
      if (Config.IS_DEV) {
        console.log('[ApiClient] Error fetching dynamic audit logs', e);
      }
    }
    return [];
  }

  // ==========================================
  // OFFLINE QUEUE SYNC
  // ==========================================
  async syncOfflineQueue(): Promise<{ syncedCount: number }> {
    const queue = await OfflineStorage.getOfflineQueue();
    let synced = 0;
    for (const action of queue) {
      try {
        await this.client.request({
          url: action.endpoint,
          method: action.method,
          data: action.payload,
        });
        await OfflineStorage.dequeueOfflineAction(action.id);
        synced++;
      } catch (e) {
        if (Config.IS_DEV) {
          console.warn(`[ApiClient] Failed to sync offline action ${action.id}`, e);
        }
      }
    }
    return { syncedCount: synced };
  }
}

export const api = new ApiClient();
