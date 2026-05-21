export type OasisFeedUpdate = {
  addInterests?: string[];
  removeInterests?: string[];
  addMarkets?: string[];
  location?: string;
};

export const OASIS_UPDATE_MARKER = /<!--OASIS_UPDATE:([\s\S]*?)-->/;
