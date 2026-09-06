import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';

export interface AgentStatusInfo {
  configured: boolean;
  reachable: boolean;
  mockMode: boolean;
  agent?: {
    id: string;
    version: string;
    environment: string;
  };
}

export type AgentStatusState = 'connecting' | 'connected' | 'unavailable' | 'config_error';

export function useAgentStatus() {
  const [status, setStatus] = useState<AgentStatusState>('connecting');
  const [info, setInfo] = useState<AgentStatusInfo | null>(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const res = await client.get<AgentStatusInfo>('/ai/status');
      setInfo(res.data);
      if (!res.data.configured) {
        setStatus('config_error');
      } else if (res.data.reachable) {
        setStatus('connected');
      } else {
        setStatus('unavailable');
      }
    } catch {
      setStatus('unavailable');
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    status,
    info,
    checking,
    refreshStatus: checkStatus,
  };
}

export default useAgentStatus;
