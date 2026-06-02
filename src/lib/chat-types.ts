export type OasisFeedUpdate = {
  addInterests?: string[];
  removeInterests?: string[];
  addMarkets?: string[];
  addTickers?: string[];
  removeTickers?: string[];
  location?: string;
  /** Optional — sets the user's X handle for X Voices */
  xUsername?: string;
};

export const OASIS_UPDATE_MARKER = /<!--OASIS_UPDATE:([\s\S]*?)-->/;
