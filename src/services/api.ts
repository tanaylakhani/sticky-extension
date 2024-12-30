// const API_BASE_URL = 'http://localhost:3008/api';
const API_BASE_URL = 'https://sticky-staging-web.vercel.app/api';

interface NoteData {
  id: string;
  type: 'note';
  position: { x: number; y: number };
  positionAbsolute: { x: number; y: number };
  position_on_webpage: { x: number; y: number };
  boardId?: string;
  data: {
    content: any;
    color: string;
    title: string;
  };
}

interface CreateNoteRequest {
  websiteUrl: string;
  boardId: string;
  data: NoteData;
}

interface UpdateNoteRequest {
  websiteUrl: string;
  boardId?: string;
  data: Partial<NoteData>;
}

export const fetchNotes = async () => {
  const { code } = await chrome.storage.local.get('code');
  const response = await fetch(`${API_BASE_URL}/extension/notes?code=${code}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
};

export const createNote = async (noteData: CreateNoteRequest) => {
  const { code } = await chrome.storage.local.get('code');
  const response = await fetch(`${API_BASE_URL}/extension/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      note: noteData,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create note');
  }

  return response.json();
};

export const updateNote = async (
  noteId: string,
  noteData: UpdateNoteRequest
) => {
  const { code } = await chrome.storage.local.get('code');
  const response = await fetch(`${API_BASE_URL}/extension/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      note: {
        ...noteData,
        data: {
          ...noteData.data,
          id: noteId,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to update note');
  }

  return response.json();
};

export const deleteNote = async (noteId: string) => {
  const { code } = await chrome.storage.local.get('code');
  const response = await fetch(`${API_BASE_URL}/extension/notes`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      noteId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete note');
  }

  return response.json();
};

export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/cloudinary`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload image');
  }

  return response.json();
};

export const deleteImage = async (publicId: string) => {
  const response = await fetch(
    `${API_BASE_URL}/cloudinary?publicId=${publicId}`,
    {
      method: 'PUT',
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete image');
  }

  return response.json();
};

export const fetchBoards = async () => {
  const { code } = await chrome.storage.local.get('code');
  const response = await fetch(`${API_BASE_URL}/extension/boards?code=${code}`);
  if (!response.ok) {
    throw new Error('Failed to fetch boards');
  }
  return response.json();
};
