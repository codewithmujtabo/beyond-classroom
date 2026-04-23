import { apiRequest } from "./api";

export interface Province {
  code: string;
  name: string;
}

export interface Regency {
  code: string;
  name: string;
  province_code?: string;
}

/**
 * Fetch all Indonesian provinces
 */
export async function getProvinces(): Promise<Province[]> {
  const response = await apiRequest<{ data: Province[] }>("/regions/provinces", {
    auth: false
  });
  return response.data;
}

/**
 * Fetch regencies (cities/kabupaten) for a given province
 */
export async function getRegencies(provinceCode: string): Promise<Regency[]> {
  const response = await apiRequest<{ data: Regency[] }>(
    `/regions/regencies/${provinceCode}`,
    { auth: false }
  );
  return response.data;
}
