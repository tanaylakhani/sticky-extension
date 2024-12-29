export interface StickyNote {
  id: string;
  websiteUrl: string;
  boardId?: string;
  position: {
    x: number;
    y: number;
  };
  text: string | TipTapContent;
  color: string;
}

export interface TipTapContent {
  type: string;
  content: Array<{
    type: string;
    content?: Array<{
      type: string;
      text?: string;
      attrs?: {
        src?: string;
        alt?: string | null;
        title?: string | null;
      };
    }>;
  }>;
}

export interface Board {
  _id: string;
  boardName: string;
}
