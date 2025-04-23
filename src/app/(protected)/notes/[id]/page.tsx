'use client';
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNoteById, updateNote, summarizeText, deleteNote } from '@/services/noteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeftIcon, SparklesIcon, TrashIcon } from 'lucide-react';
import Link from 'next/link';

export default function EditNotePage({ params }: { params: { id: string } }) {
  const unwrappedParams = React.use(params);
  const id = unwrappedParams.id;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();


  // Fetch the note
  const { data: note, isLoading, isError } = useQuery({
    queryKey: ['note', id],
    queryFn: () => getNoteById(id),
  });

  // Update note details when data is loaded
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setSummary(note.summary);
    }
  }, [note]);

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, title, content, summary }: { id: string; title: string; content: string; summary?: string }) => {
      return updateNote(id, { title, content, summary });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', id] });
      toast.success('Note updated successfully!');
      router.push('/notes');
    },
    onError: (error) => {
      toast.error(`Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    
      toast.success('Your note has been deleted successfully.');
    
      router.push('/notes');
    },
    onError: (error) => {
      toast.error(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Validation error: Title and content are required.');

      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateNoteMutation.mutateAsync({ id, title, content, summary });
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      toast.error('Note content is required for summarization.');
      return;
    }

    setIsSummarizing(true);
    
    try {
      const newSummary = await summarizeText(content);
      setSummary(newSummary);
      toast.success('AI summary has been generated successfully.');
    } catch (error) {
      toast.error('Failed to generate summary. Please try again.');
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNoteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 dark:bg-gray-950 dark:text-gray-200">
        <p className="text-red-500 dark:text-red-400">Error loading note. The note may not exist or you don't have permission to view it.</p>
        <Link href="/notes" className="mt-4 inline-block">
          <Button variant="outline" className="text-blue-600 dark:text-blue-300 border-blue-300 dark:border-blue-700 hover:bg-blue-50 dark:hover:bg-gray-800">Back to Notes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 min-h-screen p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/notes" className="flex items-center text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Notes
          </Link>
        </div>
        
        <Card className="border border-blue-200 dark:border-gray-800 shadow-lg dark:shadow-xl overflow-hidden dark:bg-gray-900 transition-colors duration-300">
          <CardHeader className="flex flex-row items-center justify-between text-blue-900 bg-blue-50 dark:bg-gray-950 dark:text-blue-300 p-6">
            <CardTitle className="text-2xl font-bold ">Edit Note</CardTitle>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 flex items-center shadow"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6 p-6 dark:bg-gray-900">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium text-blue-800 dark:text-blue-100">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Note title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-blue-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium text-blue-800 dark:text-blue-100">
                  Content
                </label>
                <div className="relative">
                  <Textarea
                    id="content"
                    placeholder="Write your note here..."
                    className="min-h-64 resize-y border-blue-200 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400">
                    {content.length} characters
                  </div>
                </div>
              </div>
              {summary && (
                <div className="space-y-2">
                  <div className="flex items-center text-sm font-medium text-blue-800 dark:text-blue-100">
                    <SparklesIcon className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-400" />
                    <span>AI Summary</span>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-700">
                    <p className="text-gray-700 dark:text-gray-200">{summary}</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 p-6 border-t border-blue-100 dark:border-gray-800 bg-blue-50 dark:bg-gray-900">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/notes')}
                className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-800"
              >
                Cancel
              </Button>
              <div className="flex flex-col space-y-2 sm:space-y-0 sm:flex-row sm:space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleGenerateSummary}
                  disabled={isSummarizing || !content.trim()}
                  className="border-blue-300 dark:border-blue-700 bg-blue-100 dark:bg-gray-800 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-gray-700"
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  {isSummarizing ? 'Generating...' : 'Generate Summary'}
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting || !content.trim() || !title.trim()}
                  className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 bg-blue-800 dark:bg-blue-950 text-white p-6 rounded-xl shadow-lg transition-colors duration-300">
          <h3 className="text-lg font-bold mb-3">Note Tips</h3>
          <ul className="space-y-2 text-blue-100">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Use the AI summary feature to quickly generate key points from your note.</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>Remember to save your changes before navigating away.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}