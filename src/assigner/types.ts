export interface GithubLabel {
  name: string;
}

export interface GithubReviewer {
  login: string;
}

export type ReviewerStatus = "success" | "error" | "info";

export interface AssignReviewersReturn {
  status: ReviewerStatus;
  message: string;
  data?: { url: string; reviewers: string[] };
}
