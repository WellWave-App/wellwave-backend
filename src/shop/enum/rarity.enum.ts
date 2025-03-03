// rarity.enum.ts
export enum Rarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

// You can also add helper functions to the enum file
export const RarityProbability = {
  [Rarity.COMMON]: 0.95,     // 95% chance
  [Rarity.UNCOMMON]: 0.9,    // 90% chance
  [Rarity.RARE]: 0.15,       // 15% chance
  [Rarity.EPIC]: 0.1,        // 10% chance
  [Rarity.LEGENDARY]: 0.025   // 2.5% chance
};

export const RarityMultiplier = {
  [Rarity.COMMON]: 1.05,     // 1.05x multiplier
  [Rarity.UNCOMMON]: 1.25,   // 1.25x multiplier
  [Rarity.RARE]: 1.5,        // 1.5x multiplier
  [Rarity.EPIC]: 1.75,       // 1.75x multiplier
  [Rarity.LEGENDARY]: 2.0    // 2.0x multiplier
};

// Helper function to get a random rarity based on probability
export function getRandomRarity(isPremium: boolean = false): Rarity {
  const random = Math.random();
  const rarityBoost = isPremium ? 2 : 1; // Premium boxes double rare chances
  
  if (random < (RarityProbability[Rarity.LEGENDARY] * rarityBoost)) {
    return Rarity.LEGENDARY;
  } else if (random < (RarityProbability[Rarity.EPIC] * rarityBoost)) {
    return Rarity.EPIC;
  } else if (random < (RarityProbability[Rarity.RARE] * rarityBoost)) {
    return Rarity.RARE;
  } else if (random < (RarityProbability[Rarity.UNCOMMON] * rarityBoost)) {
    return Rarity.UNCOMMON;
  } else {
    return Rarity.COMMON;
  }
}