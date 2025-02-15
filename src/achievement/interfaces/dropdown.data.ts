import {
  RequirementEntity,
  TrackableProperty,
  RequirementTrackingType,
} from '@/.typeorm/entities/achievement.entity';

export const dropdownData = {
  [RequirementEntity.USER_LOGIN_STREAK]: [
    {
      property: TrackableProperty.CURRENT_STREAK,
      trackingType: RequirementTrackingType.STREAK,
    },
  ],
  [RequirementEntity.USER]: [
    {
      property: TrackableProperty.TOTAL_EXP,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
  ],
  [RequirementEntity.USER_READ_HISTORY]: [
    {
      property: TrackableProperty.TOTAL_READ,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
  ],
  [RequirementEntity.USER_REACTIONS]: [
    {
      property: TrackableProperty.TOTAL_REACTIONS,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
  ],
  [RequirementEntity.USER_FOLLOWS]: [
    {
      property: TrackableProperty.FOLLOWING_COUNT,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
  ],
  [RequirementEntity.USER_HABIT_CHALLENGES]: [
    {
      property: TrackableProperty.TOTAL_COMPLETED_HABIT,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
    {
      property: TrackableProperty.TOTAL_EXERCISE_MINUTE,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
    {
      property: TrackableProperty.CONSECUTIVE_WEEKS,
      trackingType: RequirementTrackingType.STREAK,
    },
  ],
  [RequirementEntity.USER_LEADERBOARD]: [
    {
      property: TrackableProperty.CURRENT_RANK,
      trackingType: RequirementTrackingType.MILESTONE,
    },
    {
      property: TrackableProperty.CURRENT_LEAGUE,
      trackingType: RequirementTrackingType.MILESTONE,
    },
    {
      property: TrackableProperty.LEAGUE_REACHED,
      trackingType: RequirementTrackingType.MILESTONE,
    },
  ],
  [RequirementEntity.USER_GEM_USAGE]: [
    {
      property: TrackableProperty.TOTAL_GEMS_SPENT,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
  ],
  [RequirementEntity.USER_LOGS]: [
    {
      property: TrackableProperty.CONSECUTIVE_WEEKS,
      trackingType: RequirementTrackingType.STREAK,
    },
  ],
  [RequirementEntity.USER_MISSIONS]: [
    {
      property: TrackableProperty.COMPLETED_MISSION,
      trackingType: RequirementTrackingType.CUMULATIVE,
    },
  ],
};
