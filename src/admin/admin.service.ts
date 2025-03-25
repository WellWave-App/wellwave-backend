import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Habits } from '@/.typeorm/entities/habit.entity';
import { Quest } from '@/.typeorm/entities/quest.entity';
import { ArticleRepository } from '../article-group/article/repositories/article.repository';
import { Article } from '@/.typeorm/entities/article.entity';
import { Achievement } from '@/.typeorm/entities/achievement.entity';
import { ShopItem } from '@/.typeorm/entities/shop-items.entity';

export interface Summary {
  missions: {
    type: {
      dailyHabits: number;
      normalHabits: number;
      quest: number;
    };
    total: number;
    latestMissions: {
      title: string;
      type: string;
      habit_type: string;
      createDate: Date;
    }[];
  };
  articles: {
    type: {
      diabetes: number;
      hypertension: number;
      dyslipidemia: number;
      obesity: number;
    };
    total: number;
  };
  achievements: {
    total: number;
  };
  shop_items: {
    normalItems: {
      expBooster: number;
      gemExchange: number;
      total: number;
    };
    mysteryBoxItems: {
      expBooster: number;
      gemExchange: number;
      total: number;
    };
    total: number;
  };
}
@Injectable()
export class AdminService {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Habits)
    private habitRepository: Repository<Habits>,
    @InjectRepository(Quest)
    private questRepository: Repository<Quest>,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(ShopItem)
    private shopItemsRepository: Repository<ShopItem>,
  ) {}

  async getSummary(): Promise<Summary> {
    const [habits, quest, article] = await Promise.all([
      await this.habitRepository.find(),
      await this.questRepository.find(),
      await this.articleRepository.find({
        relations: ['diseases'],
      }),
    ]);

    // * habit formatting
    const formatHabit = habits.map((habit) => {
      return {
        title: habit.TITLE,
        type: 'habit',
        habit_type: habit.CATEGORY,
        createDate: new Date(habit.CREATED_AT),
      };
    });
    const formatQuest = quest.map((quest) => {
      return {
        title: quest.TITLE,
        type: 'quest',
        habit_type: quest.RELATED_HABIT_CATEGORY,
        createDate: new Date(quest.CREATED_AT),
      };
    });

    // *items formatting
    // shop_items: {
    //   normalItems: {
    //     expBooster: number;
    //     gemExchange: number;
    //     total: number;
    //   };
    //   mysteryBoxItems: number;
    //   total: number;
    // };
    const items = await this.shopItemsRepository.find({
      relations: ['expBooster', 'gemExchange', 'mysteryBoxes'],
    });
    const shop_items = {
      normalItems: {
        expBooster: items.filter(
          (item) => item.mysteryBoxes.length === 0 && item.expBooster !== null,
        ).length,
        gemExchange: items.filter(
          (item) => item.mysteryBoxes.length === 0 && item.gemExchange !== null,
        ).length,
        total: items.filter((item) => item.mysteryBoxes.length === 0).length,
      },
      mysteryBoxItems: {
        expBooster: items.filter(
          (item) => item.mysteryBoxes.length !== 0 && item.expBooster !== null,
        ).length,
        gemExchange: items.filter(
          (item) => item.mysteryBoxes.length !== 0 && item.gemExchange !== null,
        ).length,
        total: items.filter((item) => item.mysteryBoxes.length !== 0).length,
      },
      total: items.length,
    };

    return {
      missions: {
        type: {
          dailyHabits: habits.filter((habit) => habit.IS_DAILY).length,
          normalHabits: habits.filter((habit) => !habit.IS_DAILY).length,
          quest: quest.length,
        },
        total: habits.length + quest.length,
        latestMissions: [...formatHabit, ...formatQuest]
          .sort((a, b) => b.createDate.getTime() - a.createDate.getTime())
          .slice(0, 10),
      },
      articles: {
        type: {
          diabetes: article.filter((article) =>
            article.diseases.some((disease) => disease.ENG_NAME === 'Diabetes'),
          ).length,
          hypertension: article.filter((article) =>
            article.diseases.some(
              (disease) => disease.ENG_NAME === 'Hypertension',
            ),
          ).length, // hypertension
          dyslipidemia: article.filter((article) =>
            article.diseases.some(
              (disease) => disease.ENG_NAME === 'Dyslipidemia',
            ),
          ).length, // dyslipidemia
          obesity: article.filter((article) =>
            article.diseases.some((disease) => disease.ENG_NAME === 'Obesity'),
          ).length, // obesity
        },
        total: article.length,
      },
      achievements: {
        total: await this.achievementRepository.count(),
      },
      shop_items,
    };
  }
}
