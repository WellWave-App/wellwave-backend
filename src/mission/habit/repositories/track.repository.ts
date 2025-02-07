// import {
//   DailyHabitTrack,
//   DailyStatus,
// } from '@/.typeorm/entities/daily-habit-track.entity';
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, Between } from 'typeorm';
// import { TrackHabitDto, UpdateDailyTrackDto } from '../dto/track-habit.dto';

// @Injectable()
// export class DailyHabitTrackRepository {
//   constructor(
//     @InjectRepository(DailyHabitTrack)
//     private readonly repository: Repository<DailyHabitTrack>,
//   ) {}

//   // Create a new daily track record
//   async create(dto: TrackHabitDto): Promise<DailyHabitTrack> {
//     const track = this.repository.create({
//       ...dto,
//       TRACK_DATE: new Date(dto.TRACK_DATE) || new Date(),
//       STATUS: dto.STATUS || DailyStatus.ACTIVE,
//     });

//     return await this.repository.save(track);
//   }

//   // Get a specific daily track by challenge ID and date
//   async findOne(
//     CHALLENGE_ID: number,
//     TRACK_DATE: Date,
//   ): Promise<DailyHabitTrack> {
//     const track = await this.repository.findOne({
//       where: {
//         CHALLENGE_ID,
//         TRACK_DATE,
//       },
//       relations: ['UserHabits'],
//     });

//     if (!track) {
//       throw new NotFoundException(
//         `Daily track for challenge ${CHALLENGE_ID} on ${TRACK_DATE} not found`,
//       );
//     }

//     return track;
//   }

//   // Get all tracks for a specific challenge
//   async findAllByChallenge(CHALLENGE_ID: number): Promise<DailyHabitTrack[]> {
//     return await this.repository.find({
//       where: { CHALLENGE_ID },
//       relations: ['UserHabits'],
//       order: { TRACK_DATE: 'DESC' },
//     });
//   }

//   // Get tracks within a date range for a challenge
//   async findByDateRange(
//     CHALLENGE_ID: number,
//     startDate: Date,
//     endDate: Date,
//   ): Promise<DailyHabitTrack[]> {
//     return await this.repository.find({
//       where: {
//         CHALLENGE_ID,
//         TRACK_DATE: Between(startDate, endDate),
//       },
//       relations: ['UserHabits'],
//       order: { TRACK_DATE: 'DESC' },
//     });
//   }

//   // Update a daily track
//   async update(
//     CHALLENGE_ID: number,
//     TRACK_DATE: Date,
//     updateDto: UpdateDailyTrackDto,
//   ): Promise<DailyHabitTrack> {
//     const track = await this.findOne(CHALLENGE_ID, TRACK_DATE);

//     Object.assign(track, updateDto);

//     // update log

//     return await this.repository.save(track);
//   }

//   // Delete a daily track
//   async remove(CHALLENGE_ID: number, TRACK_DATE: Date): Promise<void> {
//     const track = await this.findOne(CHALLENGE_ID, TRACK_DATE);
//     await this.repository.remove(track);
//   }

//   // Get completion statistics for a challenge
//   async getCompletionStats(CHALLENGE_ID: number): Promise<{
//     totalDays: number;
//     completedDays: number;
//     failedDays: number;
//     completionRate: number;
//   }> {
//     const tracks = await this.findAllByChallenge(CHALLENGE_ID);

//     const totalDays = tracks.length;
//     const completedDays = tracks.filter(
//       (track) => track.STATUS === DailyStatus.COMPLETE,
//     ).length;
//     const failedDays = tracks.filter(
//       (track) => track.STATUS === DailyStatus.FAILED,
//     ).length;
//     const completionRate =
//       totalDays > 0 ? (completedDays / totalDays) * 100 : 0;

//     return {
//       totalDays,
//       completedDays,
//       failedDays,
//       completionRate,
//     };
//   }

//   // Get mood statistics for a challenge
//   async getMoodStats(CHALLENGE_ID: number): Promise<{
//     moodDistribution: Record<string, number>;
//     averageMood: string;
//   }> {
//     const tracks = await this.findAllByChallenge(CHALLENGE_ID);
//     const moodTracks = tracks.filter((track) => track.MOOD_FEEDBACK);

//     const moodDistribution = moodTracks.reduce(
//       (acc, track) => {
//         acc[track.MOOD_FEEDBACK] = (acc[track.MOOD_FEEDBACK] || 0) + 1;
//         return acc;
//       },
//       {} as Record<string, number>,
//     );

//     // Find the most frequent mood
//     const averageMood = Object.entries(moodDistribution).reduce((a, b) =>
//       a[1] > b[1] ? a : b,
//     )[0];

//     return {
//       moodDistribution,
//       averageMood,
//     };
//   }
// }
