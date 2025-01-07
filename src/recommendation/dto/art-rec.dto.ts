export class RecommendationParamsDto {
  userId: number;
  limit?: number = 10;
  includeRead?: boolean = false;
}