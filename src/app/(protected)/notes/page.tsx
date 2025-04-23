'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, deleteNote, Note } from '@/services/noteService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusIcon, TrashIcon, PencilIcon, SparklesIcon, SearchIcon } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [selectedSummary, setSelectedSummary] = useState<{ title: string; summary: string } | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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

  // Handle summary click
  const handleSummaryClick = (title: string, summary: string) => {
    setSelectedSummary({ title, summary });
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
        <h1 className={`text-3xl font-bold flex items-center ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
          My Notes
        </h1>
        <div className="flex gap-2">
          <div className={`flex border rounded-lg overflow-hidden ${
            isDark ? 'border-gray-700' : 'border-blue-200'
          }`}>
            <button
              onClick={() => setView('grid')}
              className={`px-3 py-1.5 ${
                view === 'grid' 
                  ? isDark ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-blue-50'
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
                view === 'list' 
                  ? isDark ? 'bg-blue-700 text-white' : 'bg-blue-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-blue-600 hover:bg-blue-50'
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
            <Button className={isDark ? "bg-blue-700 hover:bg-blue-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}>
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
          className={`w-full p-3 pl-10 rounded-lg transition-all duration-200 ${
            isDark 
              ? 'bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-700'
              : 'border border-blue-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-300'
          }`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <SearchIcon className={`h-5 w-5 absolute left-3 top-3.5 ${isDark ? 'text-gray-400' : 'text-blue-400'}`} />
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-blue-400' : 'border-blue-600'}`}></div>
        </div>
      ) : isError ? (
        <div className={`text-center py-16 rounded-lg border ${
          isDark ? 'bg-red-900/30 border-red-900' : 'bg-red-50 border-red-100'
        }`}>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-12 w-12 mx-auto mb-4 ${isDark ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className={`font-medium text-lg ${isDark ? 'text-red-300' : 'text-red-700'}`}>Error loading notes</p>
          <p className={isDark ? 'text-red-400 mt-2' : 'text-red-600 mt-2'}>Please try again later or contact support if the issue persists.</p>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className={`text-center py-16 rounded-lg border ${
          isDark ? 'bg-blue-900/20 border-blue-900' : 'bg-blue-50 bg-opacity-50 border-blue-100'
        }`}>
          <div className={`inline-flex justify-center items-center w-16 h-16 rounded-full mb-4 ${
            isDark ? 'bg-blue-900/50' : 'bg-blue-100'
          }`}>
            <PlusIcon className={`h-8 w-8 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} />
          </div>
          <p className={`font-medium text-lg ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>No notes found</p>
          <p className={isDark ? 'text-blue-400 mt-1' : 'text-blue-600 mt-1'}>Create your first note to get started!</p>
          <Link href="/notes/new" className="mt-4 inline-block">
            <Button className={isDark ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'}>
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
              onSummaryClick={handleSummaryClick}
              isDark={isDark}
            />
          ))}
        </div>
      )}

      {/* Summary Dialog */}
      <Dialog open={!!selectedSummary} onOpenChange={(open) => !open && setSelectedSummary(null)}>
        <DialogContent className={`max-w-md ${isDark ? 'bg-gray-900 border-gray-700' : ''}`}>
          <DialogHeader>
            <DialogTitle className={`flex items-center ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
              <SparklesIcon className={`h-5 w-5 mr-2 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              AI Summary: {selectedSummary?.title}
            </DialogTitle>
          </DialogHeader>
          <div className={`mt-4 p-4 rounded-lg border ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-100'
          }`}>
            <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>{selectedSummary?.summary}</p>
          </div>
          <DialogClose asChild>
            <Button className={`mt-4 w-full ${
              isDark ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
            }`}>
              Close
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface NoteCardProps {
  note: Note;
  onDelete: (id: string) => void;
  view: 'grid' | 'list';
  onSummaryClick: (title: string, summary: string) => void;
  isDark: boolean;
}

function NoteCard({ note, onDelete, view, onSummaryClick, isDark }: NoteCardProps) {
  // Generate a random background color based on the theme
  const getRandomBackgroundShade = () => {
    if (isDark) {
      const darkShades = [
        'bg-gradient-to-br from-gray-800 to-gray-900',
        'bg-gradient-to-br from-gray-800 to-blue-900',
        'bg-gradient-to-br from-blue-900 to-gray-900',
        'bg-gradient-to-tr from-gray-800 to-gray-900',
        'bg-gradient-to-r from-gray-800 to-gray-900',
      ];
      return darkShades[note.id.charCodeAt(0) % darkShades.length];
    } else {
      const lightShades = [
        'bg-gradient-to-br from-blue-50 to-white',
        'bg-gradient-to-br from-indigo-50 to-white',
        'bg-gradient-to-br from-sky-50 to-white',
        'bg-gradient-to-tr from-blue-50 to-white',
        'bg-gradient-to-r from-blue-50 to-white',
      ];
      return lightShades[note.id.charCodeAt(0) % lightShades.length];
    }
  };

  const cardClass = view === 'list' 
    ? `flex flex-row gap-4 p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${getRandomBackgroundShade()} ${
        isDark ? 'border border-gray-700' : 'border border-blue-100'
      }`
    : `h-full flex flex-col rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${getRandomBackgroundShade()} ${
        isDark ? 'border border-gray-700' : 'border border-blue-100'
      }`;

  if (view === 'list') {
    return (
      <div className={cardClass}>
        <div className="flex-grow">
          <h3 className={`text-xl font-semibold mb-1 ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
            {note.title}
          </h3>
          <p className={`text-sm mb-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
            Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
          </p>
          <p className={isDark ? 'text-gray-300 line-clamp-2' : 'text-gray-600 line-clamp-2'}>
            {note.content}
          </p>
          {note.summary && (
            <div 
              className={`mt-3 p-2 rounded-md max-w-l cursor-pointer transition-colors ${
                isDark 
                  ? 'bg-gray-800 bg-opacity-70 border border-gray-700 hover:bg-gray-700' 
                  : 'bg-white bg-opacity-70 border border-blue-100 hover:bg-blue-50'
              }`}
              onClick={() => onSummaryClick(note.title, note.summary || '')}
            >
              <div className={`flex items-center text-sm mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <SparklesIcon className="h-4 w-4 mr-1" />
                <span>AI Summary</span>
              </div>
              <p className={`text-sm line-clamp-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {note.summary}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-col justify-center gap-2 min-w-24">
          <Link href={`/notes/${note.id}`} className="w-full">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`w-full justify-center ${
                isDark 
                  ? 'text-blue-400 hover:bg-blue-900/40 hover:text-blue-300' 
                  : 'text-blue-600 hover:bg-blue-100 hover:text-blue-700'
              }`}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className={`w-full justify-center ${
              isDark 
                ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
                : 'text-red-500 hover:bg-red-50 hover:text-red-600'
            }`}
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
      <CardHeader className={`pb-2 ${isDark ? 'border-gray-700' : ''}`}>
        <CardTitle className={`text-xl font-semibold truncate ${isDark ? 'text-blue-300' : 'text-blue-900'}`}>
          {note.title}
        </CardTitle>
        <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-500'}`}>
          Updated {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
        </p>
      </CardHeader>
      <CardContent className="flex-grow pt-2">
        <p className={isDark ? 'text-gray-300 line-clamp-3' : 'text-gray-600 line-clamp-3'}>
          {note.content}
        </p>
        {note.summary && (
          <div 
            className={`mt-3 p-3 rounded-md cursor-pointer transition-colors ${
              isDark 
                ? 'bg-gray-800 bg-opacity-70 border border-gray-700 hover:bg-gray-700' 
                : 'bg-white bg-opacity-70 border border-blue-100 hover:bg-blue-50'
            }`}
            onClick={() => onSummaryClick(note.title, note.summary || '')}
          >
            <div className={`flex items-center text-sm mb-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              <SparklesIcon className="h-4 w-4 mr-1" />
              <span>AI Summary</span>
            </div>
            <p className={`text-sm line-clamp-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {note.summary}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className={`pt-3 flex justify-between border-t ${isDark ? 'border-gray-700' : 'border-blue-100'}`}>
        <Link href={`/notes/${note.id}`}>
          <Button 
            variant="ghost" 
            size="sm" 
            className={
              isDark 
                ? 'text-blue-400 hover:bg-blue-900/40 hover:text-blue-300' 
                : 'text-blue-600 hover:bg-blue-100 hover:text-blue-700'
            }
          >
            <PencilIcon className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </Link>
        <Button 
          variant="ghost" 
          size="sm" 
          className={
            isDark 
              ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300' 
              : 'text-red-500 hover:bg-red-50 hover:text-red-600'
          }
          onClick={() => onDelete(note.id)}
        >
          <TrashIcon className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
}