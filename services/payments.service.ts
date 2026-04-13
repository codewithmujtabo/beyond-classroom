import { apiRequest } from "./api";

export interface SnapTokenResponse {
  snapToken:   string;
  redirectUrl: string;
  paymentId:   string;
  orderId:     string;
}

/**
 * Request a Midtrans Snap token for a pending registration.
 * Returns the redirect URL to open in the WebBrowser.
 */
export async function createSnapToken(
  registrationId: string
): Promise<SnapTokenResponse> {
  return apiRequest<SnapTokenResponse>("/payments/snap", {
    method: "POST",
    body: { registrationId },
  });
}
