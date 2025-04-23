'use client';

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
  const id = params.id;
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
      toast({
        title: 'Note updated',
        description: 'Your note has been updated successfully.',
      });
      router.push('/notes');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to update note: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: 'Note deleted',
        description: 'Your note has been deleted successfully.',
      });
      router.push('/notes');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Validation error',
        description: 'Title and content are required.',
      });
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
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Note content is required for summarization.',
      });
      return;
    }

    setIsSummarizing(true);
    
    try {
      const newSummary = await summarizeText(content);
      setSummary(newSummary);
      toast({
        title: 'Summary generated',
        description: 'AI summary has been generated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate summary. Please try again.',
      });
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">Error loading note. The note may not exist or you don't have permission to view it.</p>
        <Link href="/notes" className="mt-4 inline-block">
          <Button variant="outline">Back to Notes</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link href="/notes" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Notes
        </Link>
      </div>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Note</CardTitle>
          <Button variant="destructive" size="sm" onClick={handleDelete} className="flex items-center">
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                placeholder="Note title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                placeholder="Write your note here..."
                className="min-h-[200px] resize-y"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>
            {summary && (
              <div className="space-y-2">
                <div className="flex items-center text-sm font-medium">
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  <span>AI Summary</span>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-gray-700">{summary}</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/notes')}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleGenerateSummary}
                disabled={isSummarizing || !content.trim()}
              >
                <SparklesIcon className="h-4 w-4 mr-1" />
                {isSummarizing ? 'Generating...' : 'Generate Summary'}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !content.trim() || !title.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}