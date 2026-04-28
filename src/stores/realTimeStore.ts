/** Zustand real-time store: agentStatuses, activityStream, setAgentStatus, addActivityItem. */

import { create } from "zustand";

export type AgentStatus = "online" | "offline" | "idle";

interface AgentStatusEntry {
  deviceId: string;
  userId: string;
  status: AgentStatus;
  lastSeen: string;
}

interface ActivityStreamItem {
  id: string;
  deviceId: string;
  userId: string;
  sessionType: string;
  timestamp: string;
}

const MAX_ACTIVITY_STREAM_SIZE = 100;

interface RealTimeState {
  agentStatuses: Map<string, AgentStatusEntry>;
  activityStream: ActivityStreamItem[];
  setAgentStatus: (entry: AgentStatusEntry) => void;
  removeAgentStatus: (deviceId: string) => void;
  addActivityItem: (item: ActivityStreamItem) => void;
  clearActivityStream: () => void;
  getOnlineCount: () => number;
}

export const useRealTimeStore = create<RealTimeState>((set, get) => ({
  agentStatuses: new Map(),
  activityStream: [],

  setAgentStatus: (entry: AgentStatusEntry): void => {
    set((state) => {
      const newStatuses = new Map(state.agentStatuses);
      newStatuses.set(entry.deviceId, entry);
      return { agentStatuses: newStatuses };
    });
  },

  removeAgentStatus: (deviceId: string): void => {
    set((state) => {
      const newStatuses = new Map(state.agentStatuses);
      newStatuses.delete(deviceId);
      return { agentStatuses: newStatuses };
    });
  },

  addActivityItem: (item: ActivityStreamItem): void => {
    set((state) => {
      const stream = [item, ...state.activityStream].slice(0, MAX_ACTIVITY_STREAM_SIZE);
      return { activityStream: stream };
    });
  },

  clearActivityStream: (): void => {
    set({ activityStream: [] });
  },

  getOnlineCount: (): number => {
    const { agentStatuses } = get();
    let count = 0;
    for (const entry of agentStatuses.values()) {
      if (entry.status === "online") {
        count += 1;
      }
    }
    return count;
  },
}));
