import { apiRequest } from "./api";
import { Registration } from "@/context/AuthContext";

interface CreateParams {
  id: string;
  compId: string;
  status?: string;
  meta?: Record<string, any>;
}

function mapRow(raw: any): Registration {
  const meta = raw.meta ?? {};
  return {
    id: raw.id,
    compId: raw.compId,
    competitionName: meta.competitionName ?? "Unknown",
    fee: meta.fee ?? 0,
    status: raw.status,
    createdAt: raw.createdAt,
    meta,
  };
}

export async function list(): Promise<Registration[]> {
  const data = await apiRequest<any[]>("/registrations");
  return (data ?? []).map(mapRow);
}

export async function create(params: CreateParams): Promise<{ status: string }> {
  return apiRequest<{ status: string }>("/registrations", {
    method: "POST",
    body: params,
  });
}

export async function updateStatus(
  id: string,
  status: string
): Promise<void> {
  await apiRequest(`/registrations/${id}`, {
    method: "PUT",
    body: { status },
  });
}

export async function remove(id: string): Promise<void> {
  await apiRequest(`/registrations/${id}`, { method: "DELETE" });
}
