export enum MemoryType {
  TEXT = 'TEXT',
  DRAWING = 'DRAWING',
  AUDIO = 'AUDIO'
}

export enum ShapeType {
  RECT = 'RECT',
  CIRCLE = 'CIRCLE',
  STAR = 'STAR',
  HEART = 'HEART'
}

export interface Memory {
  id: string;
  type: MemoryType;
  content: string; // Text content or Base64 data URI
  timestamp: number;
  shape: ShapeType;
  styleColor: string; // Hex code for background
}

export interface OracleResponse {
  interpretation: string;
  mood: string;
}