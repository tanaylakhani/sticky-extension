import { API_BASE_URL } from '../constants';
import { INoteSize } from '../enums';

interface NoteData {
  id: string;
  type: 'note';
  position: { x: number; y: number };
  positionAbsolute?: { x: number; y: number };
  position_on_webpage?: { x: number; y: number };
  boardId?: string;
  data: {
    content: any;
    color: string;
    title: string;
    size?: INoteSize;
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

interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

export const fetchNotes = async () => {
  const { code } = await chrome.storage.local.get('code');
  if (!code) return;

  const response = await fetch(`${API_BASE_URL}/extension/notes?code=${code}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
};

export const createNote = async (noteData: CreateNoteRequest) => {
  const { code } = await chrome.storage.local.get('code');
  if (!code) return;

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
  if (!code) return;

  const response = await fetch(`${API_BASE_URL}/extension/boards?code=${code}`);
  if (!response.ok) {
    throw new Error('Failed to fetch boards');
  }
  return response.json();
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  const { code } = await chrome.storage.local.get('code');
  if (!code) throw new Error('No code found');

  const response = await fetch(
    `${API_BASE_URL}/extension/profile?code=${code}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
};

export const fetchUserPaymentStatus = async () => {
  const { code } = await chrome.storage.local.get('code');
  if (!code) throw new Error('No code found');

  const response = await fetch(`${API_BASE_URL}/extension/payments?code=${code}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch payment status');
  }
  
  return response.json();
};