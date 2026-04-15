import { apiRequest } from "./api";

export interface Competition {
  id: string;
  name: string;
  organizerName: string;
  category: string;
  gradeLevel: string;   // comma-separated e.g. "SD,SMP"
  fee: number;
  quota: number | null;
  regOpenDate: string | null;
  regCloseDate: string | null;
  competitionDate: string | null;
  requiredDocs: string[];
  description: string | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface ListParams {
  category?: string;
  grade?: string;
  search?: string;
}

function mapRow(raw: any): Competition {
  return {
    id: raw.id,
    name: raw.name,
    organizerName: raw.organizer_name,
    category: raw.category,
    gradeLevel: raw.grade_level ?? "",
    fee: raw.fee ?? 0,
    quota: raw.quota ?? null,
    regOpenDate: raw.reg_open_date ?? null,
    regCloseDate: raw.reg_close_date ?? null,
    competitionDate: raw.competition_date ?? null,
    requiredDocs: raw.required_docs ?? [],
    description: raw.description ?? null,
    imageUrl: raw.image_url ?? null,
    createdAt: raw.created_at,
  };
}

export async function list(params: ListParams = {}): Promise<Competition[]> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.grade) qs.set("grade", params.grade);
  if (params.search) qs.set("search", params.search);

  const query = qs.toString() ? `?${qs.toString()}` : "";
  const data = await apiRequest<any[]>(`/competitions${query}`, { auth: false });
  return (data ?? []).map(mapRow);
}

export async function get(id: string): Promise<Competition> {
  const data = await apiRequest<any>(`/competitions/${id}`, { auth: false });
  return mapRow(data);
}
