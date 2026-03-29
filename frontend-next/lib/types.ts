export type ClaimStatus = "submitted" | "under_review" | "approved" | "rejected";

export type ClaimRecord = {
  id: string;
  policyId: string;
  submittedAt: string;
  status: ClaimStatus;
  documentName: string;
  /** Backend indicates whether the stored file exists (e.g. seed rows may be missing files). */
  documentAvailable?: boolean;
};
