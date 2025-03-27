export enum RiskLevel {
  LOW = 'LOW',
  MODERATE = 'MODERATE',
  HIGH = 'HIGH',
  VERY_HIGH = 'VERY_HIGH',
}

export class RiskCalculator {
  // Converts numerical scores to normalized weights for recommendation
  static calculateDiabetesWeight(score: number): number {
    // Based on RiskDiseaseCondition logic
    // ต่ำ 0 - 2
    // กลาง 3 - 5
    // สูง 6 - 8
    // สูงมาก 9+
    if (score <= 2) {
      return 0.25; // Low risk
    } else if (score >= 3 && score <= 5) {
      return 0.5; // Moderate risk
    } else if (score >= 6 && score <= 8) {
      return 0.75; // High risk
    } else {
      return 1.0; // Very high risk
    }
  }

  static calculateHypertensionWeight(score: number): number {
    // Based on RiskHypertensionCondition logic
    // ต่ำ 0-1
    // สูง 2+
    return score <= 1 ? 0.25 : 1.0; // Either low or high risk
  }

  static calculateDyslipidemiaWeight(score: number): number {
    // Based on RiskDyslipidemiaCondition logic
    // ต่ำ 0-1
    // กลาง 2
    // สูง 3-4
    if (score <= 1) {
      return 0.25; // Low risk
    } else if (score === 2) {
      return 0.5; // Moderate risk
    } else {
      return 1.0; // High risk
    }
  }

  static calculateObesityWeight(score: number): number {
    // Based on RiskObesityCondition logic
    // ต่ำ 0
    // สูง 1
    return score === 0 ? 0.25 : 1.0; // Either low or high risk
  }

  // Calculates the overall risk level based on all scores
  static calculateOverallRiskLevel(scores: {
    diabetes: number;
    hypertension: number;
    dyslipidemia: number;
    obesity: number;
  }): RiskLevel {
    // Convert individual scores to 0-1 range for averaging
    const normalizedScores = {
      diabetes: this.calculateDiabetesWeight(scores.diabetes),
      hypertension: this.calculateHypertensionWeight(scores.hypertension),
      dyslipidemia: this.calculateDyslipidemiaWeight(scores.dyslipidemia),
      obesity: this.calculateObesityWeight(scores.obesity),
    };

    // Calculate average risk score
    const averageRiskScore =
      Object.values(normalizedScores).reduce((sum, score) => sum + score, 0) /
      4;

    // Based on RiskTextCondition logic
    if (averageRiskScore > 0.8) {
      return RiskLevel.VERY_HIGH;
    } else if (averageRiskScore > 0.6) {
      return RiskLevel.HIGH;
    } else if (averageRiskScore > 0.4) {
      return RiskLevel.MODERATE;
    } else {
      return RiskLevel.LOW;
    }
  }
}
