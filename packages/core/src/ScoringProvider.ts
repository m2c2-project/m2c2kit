import { ActivityKeyValueData } from "./ActivityKeyValueData";

/**
 * Assessments that generate scoring data must implement the ScoringProvider
 * interface
 */
export interface ScoringProvider {
  /**
   * Calculates scores based on the provided activity data and optional
   * additional parameters.
   *
   * @param data - Activity data from which to calculate scores.
   * @param extras - Optional additional parameters that are needed for an
   * activity's scoring calculations. This can include things like
   * game parameters, user context, or other metadata that is relevant
   * to the scoring logic. The structure of this object is not
   * defined by this interface, as it can vary widely between different
   * activities.
   * @returns The calculated scores object or an array of such objects. If an
   * array of is returned, it should have length 1.
   */
  calculateScores(
    data: ActivityKeyValueData[],
    extras?: {
      [key: string]: unknown;
    },
  ): ActivityKeyValueData | Array<ActivityKeyValueData>;
}
