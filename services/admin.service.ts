import { API_URL } from "@/constants/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export interface CompetitionRound {
  roundName: string;
  roundType: "Online" | "On-site" | "Hybrid";
  startDate?: string;
  registrationDeadline?: string;
  examDate?: string;
  resultsDate?: string;
  fee: number;
  location?: string;
}

export interface CompetitionFormData {
  name: string;
  organizerName: string;
  category: string;
  gradeLevel: string;
  websiteUrl?: string;
  registrationStatus: "On Going" | "Closed" | "Coming Soon";
  posterUrl?: string;
  isInternational: boolean;
  detailedDescription?: string;
  description?: string;
  fee: number;
  quota?: number;
  regOpenDate?: string;
  regCloseDate?: string;
  competitionDate?: string;
  requiredDocs?: string[];
  imageUrl?: string;
  rounds: CompetitionRound[];
}

export const getCompetitions = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/admin/competitions`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch competitions");
  }

  return response.json();
};

export const createCompetition = async (data: CompetitionFormData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/admin/competitions`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create competition");
  }

  return response.json();
};

export const updateCompetition = async (id: string, data: CompetitionFormData) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/admin/competitions/${id}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update competition");
  }

  return response.json();
};

export const deleteCompetition = async (id: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/admin/competitions/${id}`, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete competition");
  }

  return response.json();
};

export const getCompetitionRegistrations = async (compId: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/admin/competitions/${compId}/registrations`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch registrations");
  }

  return response.json();
};

export const exportRegistrationsCSV = async (compId: string) => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/admin/competitions/${compId}/registrations/export`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to export registrations");
  }

  return response.blob();
};

export const getStats = async () => {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }

  return response.json();
};
