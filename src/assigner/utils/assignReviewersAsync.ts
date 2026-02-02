import { context } from "@actions/github";
import type { Config } from "../config";
import type { AssignReviewersReturn } from "../types";
import { setReviewersAsync } from "./setReviewersAsync";
import * as common from "../../common/common";

type WebhookPayload = typeof context.payload;

interface Options {
  client: common.ClientType;
  labelReviewers: Config["assign"];
  contextDetails: common.PullRequestDetails;
  contextPayload: WebhookPayload;
}

export async function assignReviewersAsync({
  client,
  labelReviewers,
  contextDetails,
  contextPayload,
}: Options): Promise<AssignReviewersReturn> {
  if (contextDetails == null) {
    return {
      status: "error",
      message: "No action context",
    };
  }

  if (contextDetails.reviewers.length > 0) {
    return {
      status: "info",
      message: "Already has reviewers",
    };
  }

  const labels = Object.keys(labelReviewers);
  const reviewersByLabels: string[] = [];

  for (const label of labels) {
    if (contextDetails.labels.includes(label)) {
      reviewersByLabels.push(...labelReviewers[label]);
    }
  }

  const reviewersToAssign = [...new Set(reviewersByLabels)];

  if (reviewersToAssign.length === 0) {
    return {
      status: "info",
      message: "No reviewers to assign from the labels provided",
    };
  }

  const diffNewReviewers = reviewersToAssign.filter(
    (reviewer) => !contextDetails.reviewers.includes(reviewer)
  );

  if (diffNewReviewers.length === 0) {
    return {
      status: "info",
      message: "No new reviewers to assign",
    };
  }

  const result = await setReviewersAsync({
    client: client,
    reviewers: reviewersToAssign,
    contextPayload: contextPayload,
    pullRequestDetails: contextDetails,
    // action: "assign",
  });

  if (result == null) {
    return {
      status: "info",
      message: "No reviewers to assign",
    };
  }

  return {
    status: "success",
    message: "Reviewers have been assigned",
    data: { url: result.url, reviewers: reviewersToAssign },
  };
}
