export interface NoteDto {
  id: string;
  subjectType: string;
  subjectId: string;
  bodyMarkdown: string;
  bodyHtmlSanitized: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  history: NoteHistoryEntry[];
}

export interface NoteHistoryEntry {
  id: string;
  bodyMarkdown: string;
  bodyHtmlSanitized: string;
  createdAt: string;
  createdBy: string;
}
