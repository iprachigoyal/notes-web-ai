'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createNote, summarizeText } from '@/services/noteService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeftIcon, SparklesIcon } from 'lucide-react';
import Link from 'next/link';

export default function NewNotePage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: async ({ title, content, summary }: { title: string; content: string; summary?: string }) => {
      const note = await createNote(title, content);
      if (summary) {
        // If we have a summary, update the note with it
        const { updateNote } = await import('@/services/noteService');
        await updateNote(note.id, { summary });
        return { ...note, summary };
      }
      return note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast({
        title: 'Note created',
        description: 'Your note has been created successfully.',
      });
      router.push('/notes');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent, withSummary = false) => {
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
      if (withSummary) {
        setIsSummarizing(true);
        const summary = await summarizeText(content);
        await createNoteMutation.mutateAsync({ title, content, summary });
      } else {
        await createNoteMutation.mutateAsync({ title, content });
      }
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setIsSubmitting(false);
      setIsSummarizing(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <Link href="/notes" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Notes
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Create New Note</CardTitle>
        </CardHeader>
        <form onSubmit={(e) => handleSubmit(e, false)}>
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
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push('/notes')}>
              Cancel
            </Button>
            <div className="space-x-2">
              <Button 
                type="button" 
                onClick={(e) => handleSubmit(e, true)}
                disabled={isSubmitting || isSummarizing || !content.trim() || !title.trim()}
                className="flex items-center"
              >
                <SparklesIcon className="h-4 w-4 mr-1" />
                {isSummarizing ? 'Summarizing...' : 'Save & Summarize'}
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting || !content.trim() || !title.trim()}
              >
                {isSubmitting ? 'Saving...' : 'Save Note'}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}