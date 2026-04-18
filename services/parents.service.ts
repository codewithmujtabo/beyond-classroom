import { apiRequest } from "./api";

export interface ParentStudentLink {
  linkId: string;
  linkStatus: string;
  linkedAt: string;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  school: string;
  grade: number;
  nisn: string;
  registrations: Array<{
    registrationId: string;
    competitionId: string;
    competitionName: string;
    category: string;
    level: string;
    status: string;
    registeredAt: string;
    regCloseDate: string;
  }>;
}

export interface PendingInvitation {
  linkId: string;
  parentId: string;
  parentName: string;
  parentEmail: string;
  createdAt: string;
}

/**
 * Send invitation to parent email (Student action)
 */
export async function inviteParent(parentEmail: string): Promise<{ invitationId: string; message: string }> {
  return await apiRequest("/parents/invite-parent", {
    method: "POST",
    body: { parentEmail },
  });
}

/**
 * Accept invitation with PIN (Parent action)
 */
export async function acceptInvitation(email: string, pin: string): Promise<{ linkId: string; status: string; message: string }> {
  return await apiRequest("/parents/accept-invitation", {
    method: "POST",
    body: { email, pin },
  });
}

/**
 * Get linked children (Parent action)
 */
export async function getMyChildren(status?: string): Promise<ParentStudentLink[]> {
  const params = status ? `?status=${status}` : '';
  return await apiRequest(`/parents/my-children${params}`);
}

/**
 * Get pending invitations (Student action)
 */
export async function getPendingInvitations(): Promise<PendingInvitation[]> {
  return await apiRequest("/parents/pending-invitations");
}

/**
 * Approve or reject parent link (Student action)
 */
export async function approveLink(linkId: string, status: 'active' | 'rejected'): Promise<{ linkId: string; status: string; message: string }> {
  return await apiRequest(`/parents/links/${linkId}/approve`, {
    method: "PUT",
    body: { status },
  });
}
