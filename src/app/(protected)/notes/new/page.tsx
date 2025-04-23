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
import { ArrowLeftIcon, SparklesIcon, PenIcon } from 'lucide-react';
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
      toast.success('Note created successfully!'); // Minimal success toast
      router.push('/notes');
    },
    onError: (error) => {
      toast.error(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`); // Minimal error toast
    },
  });

  const handleSubmit = async (e: React.FormEvent, withSummary = false) => {
    e.preventDefault();
  
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required.'); // Minimal error toast
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
  
      toast.success('Note created successfully!'); // Success toast with minimal message
    } catch (error) {
      toast.error(`Failed to create note: ${error instanceof Error ? error.message : 'Unknown error'}`); // Error toast
    } finally {
      setIsSubmitting(false);
      setIsSummarizing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-blue-200 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link href="/notes" className="flex items-center text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-200 transition-colors">
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            <span className="font-medium">Back to Notes</span>
          </Link>
        </div>
        
        <Card className="border-0 shadow-xl overflow-hidden bg-white dark:bg-gray-900 rounded-xl border-t-4 border-t-blue-500 dark:border-t-blue-400 transition-colors duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-blue-700 dark:from-blue-400 dark:to-blue-600" />
          
          <CardHeader className="pb-2 pt-6 bg-blue-50 dark:bg-gray-950 border-b border-blue-100 dark:border-gray-800 transition-colors duration-300">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center mr-3 shadow-md">
                <PenIcon className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-300">Create New Note</CardTitle>
            </div>
          </CardHeader>
          
          <form onSubmit={(e) => handleSubmit(e, false)}>
            <CardContent className="space-y-5 pt-6 dark:bg-gray-900 transition-colors duration-300">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-semibold text-blue-800 dark:text-blue-100">
                  Title
                </label>
                <Input
                  id="title"
                  placeholder="Enter note title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="border-blue-200 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-semibold text-blue-800 dark:text-blue-100">
                  Content
                </label>
                <Textarea
                  id="content"
                  placeholder="Write your note here..."
                  className="min-h-[240px] resize-y border-blue-200 dark:border-gray-700 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 shadow-sm dark:bg-gray-800 dark:text-gray-100"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 pt-4 pb-6 bg-blue-50 dark:bg-gray-950 border-t border-blue-100 dark:border-gray-800 transition-colors duration-300">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push('/notes')}
                className="w-full sm:w-auto border-blue-300 dark:border-gray-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-gray-800 hover:text-blue-800 dark:hover:text-blue-200"
              >
                Cancel
              </Button>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  type="button" 
                  onClick={(e) => handleSubmit(e, true)}
                  disabled={isSubmitting || isSummarizing || !content.trim() || !title.trim()}
                  className="w-full sm:w-auto bg-blue-100 dark:bg-gray-800 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-gray-700 border border-blue-300 dark:border-gray-700 flex items-center justify-center disabled:opacity-50"
                >
                  <SparklesIcon className="h-4 w-4 mr-2" />
                  {isSummarizing ? 'Summarizing...' : 'Save & Summarize'}
                </Button>
                
                <Button 
                  type="submit"
                  disabled={isSubmitting || !content.trim() || !title.trim()}
                  className="w-full sm:w-auto bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 text-white shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Note'}
                </Button>
              </div>
            </CardFooter>
          </form>
        </Card>
        
        {/* Example Note Preview Card */}
        <Card className="border-0 shadow-lg overflow-hidden bg-white dark:bg-gray-900 rounded-xl mt-8 transition-colors duration-300">
          <div className="p-4 bg-blue-600 dark:bg-blue-500 text-white">
            <h3 className="text-lg font-semibold">Note Preview</h3>
          </div>
          
          <div className="p-6">
            <div className={`${title ? 'text-blue-900 dark:text-blue-50' : 'text-blue-400 dark:text-blue-400 italic'} text-xl font-bold mb-4`}>
              {title || 'Your note title will appear here'}
            </div>
            
            <div className={`${content ? 'text-gray-700 dark:text-gray-100' : 'text-gray-400 dark:text-gray-400 italic'} mb-6 max-h-48 overflow-y-auto`}>
              {content || 'Your note content preview will appear here as you type...'}
            </div>
            
            <div className="mt-4 pt-4 border-t border-blue-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="text-xs text-blue-600 dark:text-blue-300">
                  Created: {new Date().toLocaleDateString()}
                </div>
                <div className="flex space-x-2">
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full">Note</span>
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 text-xs rounded-full">Draft</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}