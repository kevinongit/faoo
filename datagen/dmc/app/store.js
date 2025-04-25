import { create } from "zustand";

const SERVER_URL = "http://localhost:3400";

export const useStore = create((set) => ({
  users: [],
  genDataStatus: {},
  genComparisonStatus: {},
  bankingAppMappings: { bankingApp1: "none", bankingApp2: "none" },

  // Fetch users from server
  fetchUsers: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/users`);
      const data = await response.json();
      set({ users: data });
      return data;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  },

  // Check if data was generated today for a business number
  checkGenData: async (businessNumber) => {
    try {
      const response = await fetch(`${SERVER_URL}/check-gen-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ businessNumber }),
      });
      const data = await response.json();
      set((state) => ({
        genDataStatus: { ...state.genDataStatus, [businessNumber]: data },
      }));
      return data;
    } catch (error) {
      console.error("Error checking gen data:", error);
      return false;
    }
  },

  // Check if data exists for a specific address and sector
  checkGenComparison: async (
    zone_nm,
    smb_sector,
    zoneRange,
    sectorRange,
    revenueRange
  ) => {
    try {
      const response = await fetch(`${SERVER_URL}/check-gen-comparison`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zone_nm,
          smb_sector,
          zoneRange,
          sectorRange,
          revenueRange,
        }),
      });
      const data = await response.json();
      set((state) => ({
        genComparisonStatus: {
          ...state.genComparisonStatus,
          [`${zone_nm}-${smb_sector}`]: data,
        },
      }));
      return data.success;
    } catch (error) {
      console.error("Error checking gen comparison:", error);
      return false;
    }
  },

  setBankingAppMappings: (mappings) => set({ bankingAppMappings: mappings }),

  // 뱅킹앱 매핑 정보 로드 함수 수정
  loadBankingAppMappings: async () => {
    try {
      const response = await fetch(
        "http://localhost:3400/api/banking-app-mappings"
      );
      const data = await response.json();
      set({ bankingAppMappings: data.mappings });
      return data.mappings;
    } catch (error) {
      console.error("Error loading banking app mappings:", error);
      return { bankingApp1: "none", bankingApp2: "none" };
    }
  },
}));
