import { supabase } from '@/lib/supabaseClient';

// Define the Note type
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  summary?: string;
  created_at: string;
  updated_at: string;
}

// Function to fetch all notes for the current user
export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Note[];
}

// Function to fetch a single note by ID
export async function getNoteById(id: string): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Note;
}

// Function to create a new note
export async function createNote(title: string, content: string): Promise<Note> {
  // Get the current user's ID
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("User not authenticated");
  }
  
  const { data, error } = await supabase
    .from('notes')
    .insert([{ 
      title, 
      content, 
      user_id: user.id // Add the user_id field
    }])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Note;
}

// Function to update an existing note
export async function updateNote(id: string, updates: { title?: string; content?: string; summary?: string }): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Note;
}

// Function to delete a note
export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(error.message);
  }
}

// Function to get AI summary for a note's content
export async function summarizeText(text: string): Promise<string> {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to summarize text');
  }

  const data = await response.json();
  return data.summary;
}