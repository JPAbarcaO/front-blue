export interface Image {
  source: string;
  sourceId: string;
  name: string;
  image: string;
}

export interface VoteRequest {
  source: string;
  sourceId: string;
  name: string;
  image: string;
  vote: 'like' | 'dislike';
}

export interface VoteResponse {
  success: boolean;
  message: string;
}

export interface EvaluatedItem {
  source: 'pokemon' | 'rickandmorty' | 'superhero' | 'dragonball';
  sourceId: string;
  name: string;
  image: string;
  likes: number;
  dislikes: number;
  lastEvaluatedAt: string | null;
}

export interface ProtectedItemResponse {
  item: EvaluatedItem | null;
}
