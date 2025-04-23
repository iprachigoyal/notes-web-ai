'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, deleteNote, Note } from '@/services/noteService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, TrashIcon, PencilIcon, SparklesIcon, SearchIcon, BookOpenIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  // Fetch notes
  const { data: notes = [], isLoading, isError } = useQuery({
    queryKey: ['notes'],
    queryFn: getNotes,
  });

  // Delete note mutation
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success('Your note has been deleted successfully.');
    },
    onError: (error) => {
      toast.error(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  // Handle delete
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter notes based on search term
  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (note.summary && note.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center">
          <BookOpenIcon className="h-8 w-8 mr-2 text-blue-600" />
          My Notes
        </h1>
        <div className="flex gap-2">
          <div className="flex border border-blue-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 ${
                view === 'grid' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-3 py-1.5 ${
                view === 'list' ? 'bg-blue-500 text-white' : 'bg-white text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>
          
          <Link href="/notes/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Note
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          placeholder="Search notes..."
          className="w-full p-3 pl-10 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-300 transition-all duration-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon className="h-5 w-5 absolute left-3 top-3.5 text-blue-400" />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-red-50 rounded-lg border border-red-100">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-red-700 font-medium text-lg">Error loading notes</p>
          <p className="text-red-600 mt-2">Please try again later or contact support if the issue persists.</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-16 bg-blue-50 bg-opacity-50 rounded-lg border border-blue-100">
          <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <PlusIcon className="h-8 w-8 text-blue-600" />
          </div>
          <p className="text-blue-800 font-medium text-lg">No notes found</p>
          <p className="text-blue-600 mt-1">Create your first note to get started!</p>
          <Link href="/notes/new" className="mt-4 inline-block">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create Note
            </Button>
          </Link>
        </div>
      ) : (
        <div className={view === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "flex flex-col gap-4"
        }>
          {filteredNotes.map((note) => (
            <NoteCard 
              key={note.id} 
              note={note} 
              onDelete={handleDelete} 
              view={view}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  view: 'grid' | 'list';
}

function NoteCard({ note, onDelete, view }: NoteCardProps) {
  // Generate a random pastel blue color for the card background
  const getRandomBlueShade = () => {
    const shades = [
      'bg-gradient-to-br from-blue-50 to-white',
      'bg-gradient-to-br from-indigo-50 to-white',
      'bg-gradient-to-br from-sky-50 to-white',
      'bg-gradient-to-tr from-blue-50 to-white',
      'bg-gradient-to-r from-blue-50 to-white',
    ];
    return shades[note.id.charCodeAt(0) % shades.length];
  };

  const cardClass = view === 'list' 
    ? "flex flex-row gap-4 p-4 border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 " + getRandomBlueShade()
    : "h-full flex flex-col border border-blue-100 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 " + getRandomBlueShade();

  if (view === 'list') {
    return (
      <div className={cardClass}>
        <div className="flex-grow">
          <h3 className="text-xl font-semibold text-blue-900 mb-1">{note.title}</h3>
          <p className="text-sm text-blue-500 mb-2">
            Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </p>
          <p className="text-gray-600 line-clamp-2">{note.content}</p>
          {note.summary && (
            <div className="mt-3 p-2 bg-white bg-opacity-70 rounded-md border border-blue-100 max-w-md">
              <div className="flex items-center text-sm text-blue-600 mb-1">
                <SparklesIcon className="h-4 w-4 mr-1" />
                <span>AI Summary</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-1">{note.summary}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2 min-w-24">
          <Link href={`/notes/${note.id}`} className="w-full">
            <Button variant="ghost" size="sm" className="w-full justify-center text-blue-600 hover:bg-blue-100 hover:text-blue-700">
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-center text-red-500 hover:bg-red-50 hover:text-red-600" 
            onClick={() => onDelete(note.id)}
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold truncate text-blue-900">{note.title}</CardTitle>
        <p className="text-sm text-blue-500">
          Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent className="flex-grow pt-2">
        <p className="text-gray-600 line-clamp-3">{note.content}</p>
        {note.summary && (
          <div className="mt-3 p-3 bg-white bg-opacity-70 rounded-md border border-blue-100">
            <div className="flex items-center text-sm text-blue-600 mb-1">
              <SparklesIcon className="h-4 w-4 mr-1" />
              <span>AI Summary</span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{note.summary}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t border-blue-100 pt-3 flex justify-between">
        <Link href={`/notes/${note.id}`}>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100 hover:text-blue-700">
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-red-500 hover:bg-red-50 hover:text-red-600" 
          onClick={() => onDelete(note.id)}
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}