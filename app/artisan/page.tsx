'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, CheckCircle, XCircle, AlertCircle, FileText, Image as ImageIcon, File, RefreshCw } from 'lucide-react';
import { AppShell } from '@/components/AppShell';

interface QueueItem {
  id: string;
  file_name: string;
  status: 'pending' | 'downloaded' | 'processing' | 'completed' | 'failed';
  result_deck_id?: string;
  error_message?: string;
  created_at: string;
}

interface UploadState {
  progress: number;
  status: 'idle' | 'uploading' | 'animating' | 'success' | 'error';
  errorMessage?: string;
  queueItemId?: string;
  resultDeckId?: string;
}

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const FILE_TYPE_LABELS: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/jpeg': 'JPEG afbeelding',
  'image/png': 'PNG afbeelding',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word document',
};

export default function ArtisanPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>({ progress: 0, status: 'idle' });
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const channelRef = useRef<any>(null);

  // Fetch queue items
  const fetchQueueItems = useCallback(async () => {
    if (!user) return;

    const { data, error } = await (supabase as any)
      .from('artisan_queue')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setQueueItems(data);
    }
  }, [user, supabase]);

  // Set up Realtime subscription
  useEffect(() => {
    if (!user) return;

    fetchQueueItems();

    const channel = supabase
      .channel('artisan_queue_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artisan_queue',
          filter: `user_id=eq.${user.id}`,
        },
        (payload: any) => {
          console.log('Realtime update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setQueueItems(prev => [payload.new as QueueItem, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setQueueItems(prev =>
              prev.map(item =>
                item.id === payload.new.id ? (payload.new as QueueItem) : item
              )
            );

            // Update upload state if this is the current upload
            if (uploadState.queueItemId === payload.new.id) {
              if (payload.new.status === 'completed') {
                setUploadState({
                  progress: 100,
                  status: 'success',
                  queueItemId: payload.new.id,
                  resultDeckId: payload.new.result_deck_id,
                });
              } else if (payload.new.status === 'failed') {
                setUploadState({
                  progress: 100,
                  status: 'error',
                  errorMessage: payload.new.error_message || 'Verwerking mislukt',
                  queueItemId: payload.new.id,
                });
              }
            }
          } else if (payload.eventType === 'DELETE') {
            setQueueItems(prev => prev.filter(item => item.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase, fetchQueueItems]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Dit bestandstype wordt niet ondersteund. Toegestane formaten: PDF, JPEG, PNG, Word document.';
    }

    if (file.size > MAX_FILE_SIZE) {
      return 'Bestand is te groot. Maximale grootte is 50MB.';
    }

    return null;
  };

  const uploadFile = async (file: File, attempt: number = 0): Promise<void> => {
    if (!user) return;

    const validationError = validateFile(file);
    if (validationError) {
      setUploadState({ progress: 0, status: 'error', errorMessage: validationError });
      return;
    }

    setUploadState({ progress: 0, status: 'uploading' });
    setRetryCount(attempt);

    const fileUuid = crypto.randomUUID();
    const storagePath = `${user.id}/${fileUuid}_${file.name}`;

    try {
      // Upload to Supabase Storage with progress tracking
      const uploadResult = await new Promise<any>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = Math.round((e.loaded / e.total) * 90); // Cap at 90% until complete
            setUploadState({ progress, status: 'uploading' });
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ data: {}, error: null });
          } else {
            reject(new Error(`Upload mislukt met status ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload mislukt door netwerkfout'));
        });

        xhr.addEventListener('abort', () => {
          reject(new Error('Upload geannuleerd'));
        });

        xhr.open('POST', `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${storagePath}`);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.setRequestHeader('x-upsert', 'false');
        
        xhr.send(file);
      });

      if (uploadResult.error) throw uploadResult.error;

      // Insert into artisan_queue
      const { data: queueData, error: queueError } = await (supabase as any)
        .from('artisan_queue')
        .insert({
          user_id: user.id,
          file_name: file.name,
          storage_path: storagePath,
          file_size_bytes: file.size,
          status: 'pending',
        })
        .select()
        .single();

      if (queueError) throw queueError;

      // Show "Labor Illusion" animation
      setUploadState({ progress: 100, status: 'animating', queueItemId: queueData.id });

      // Wait 15 seconds for the animation
      await new Promise(resolve => setTimeout(resolve, 15000));

      // After animation, show pending state
      setUploadState({ progress: 100, status: 'success', queueItemId: queueData?.id });
      setRetryCount(0);

    } catch (error: any) {
      console.error('Upload error:', error);

      if (attempt < 3) {
        // Exponential backoff: 2s, 4s, 8s
        const backoffDelay = Math.pow(2, attempt + 1) * 1000;
        setTimeout(() => uploadFile(file, attempt + 1), backoffDelay);
      } else {
        setUploadState({
          progress: 100,
          status: 'error',
          errorMessage: error.message || 'Upload mislukt na 3 pogingen',
        });
        setRetryCount(0);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  }, [user]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  }, [user]);

  const handleRetry = () => {
    if (fileInputRef.current?.files?.[0]) {
      uploadFile(fileInputRef.current.files[0], 0);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/pdf') return <FileText className="w-8 h-8 text-destructive" />;
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-primary" />;
    return <File className="w-8 h-8 text-muted-foreground" />;
  };

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-primary animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-warning" />;
    }
  };

  const getStatusLabel = (status: QueueItem['status']) => {
    switch (status) {
      case 'pending':
        return 'In de werkplaats';
      case 'downloaded':
        return 'Gedownload';
      case 'processing':
        return 'Wordt verwerkt';
      case 'completed':
        return 'Voltooid';
      case 'failed':
        return 'Mislukt';
      default:
        return status;
    }
  };

  return (
    <AppShell>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="font-display text-4xl font-semibold mb-2 text-foreground">
          Artisan Werkplaats
        </h1>
        <p className="text-muted-foreground mb-8">
          Upload je studiemateriaal en wij maken er leersets van
        </p>

        {/* Dropzone */}
        <div
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-all ${
            dragActive
              ? 'border-primary bg-primary/10'
              : 'border-border bg-card'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={ALLOWED_TYPES.join(',')}
            className="hidden"
          />

          <AnimatePresence mode="wait">
            {uploadState.status === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Upload className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <p className="text-lg font-semibold text-foreground mb-2">
                    Sleep je bestand hierheen
                  </p>
                  <p className="text-sm text-muted-foreground mb-4">
                    of klik om te selecteren
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-10 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                >
                  Bestand kiezen
                </button>
                <div className="text-xs text-muted-foreground mt-4">
                  <p>Toegestane formaten: PDF, JPEG, PNG, Word document</p>
                  <p>Maximale grootte: 50MB</p>
                </div>
              </motion.div>
            )}

            {uploadState.status === 'uploading' && (
              <motion.div
                key="uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="w-full bg-secondary rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadState.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <p className="text-lg font-semibold text-foreground">
                  Uploaden... {uploadState.progress}%
                </p>
                {retryCount > 0 && (
                  <p className="text-sm text-warning">
                    Poging {retryCount + 1} van 4
                  </p>
                )}
              </motion.div>
            )}

            {uploadState.status === 'animating' && (
              <motion.div
                key="animating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="space-y-6"
              >
                <motion.div
                  animate={{
                    rotate: 360,
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: 'linear' },
                    scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                  }}
                  className="w-20 h-20 mx-auto"
                >
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                    <RefreshCw className="w-10 h-10 text-primary-foreground" />
                  </div>
                </motion.div>
                <div>
                  <p className="text-xl font-bold text-foreground mb-2">
                    Onze ambachten zijn aan het werk...
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Dit kan even duren. Je bestand wordt zorgvuldig verwerkt.
                  </p>
                </div>
                <div className="flex justify-center space-x-2">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-3 h-3 rounded-full bg-primary"
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.2,
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {uploadState.status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <CheckCircle className="w-16 h-16 mx-auto text-success" />
                <div>
                  <p className="text-xl font-bold text-foreground mb-2">
                    {uploadState.resultDeckId ? 'Voltooid!' : 'In de werkplaats'}
                  </p>
                  <p className="text-muted-foreground">
                    {uploadState.resultDeckId
                      ? 'Je leerset is klaar!'
                      : 'Je bestand wordt verwerkt. Je ontvangt een melding zodra het klaar is.'}
                  </p>
                </div>
                {uploadState.resultDeckId && (
                  <a
                    href={`/leersets/${uploadState.resultDeckId}`}
                    className="inline-block h-10 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  >
                    Bekijk leerset
                  </a>
                )}
                <button
                  onClick={() => {
                    setUploadState({ progress: 0, status: 'idle' });
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="block mx-auto text-sm text-primary hover:opacity-80"
                >
                  Nog een bestand uploaden
                </button>
              </motion.div>
            )}

            {uploadState.status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <XCircle className="w-16 h-16 mx-auto text-destructive" />
                <div>
                  <p className="text-xl font-bold text-foreground mb-2">
                    Upload mislukt
                  </p>
                  <p className="text-destructive">
                    {uploadState.errorMessage || 'Er is een fout opgetreden'}
                  </p>
                </div>
                <div className="flex justify-center space-x-3">
                  <button
                    onClick={handleRetry}
                    className="h-10 px-6 py-3 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
                  >
                    Opnieuw proberen
                  </button>
                  <button
                    onClick={() => {
                      setUploadState({ progress: 0, status: 'idle' });
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="h-10 px-6 py-3 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
                  >
                    Annuleren
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Queue Items */}
        {queueItems.length > 0 && (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-semibold mb-4 text-foreground">
              Je uploads
            </h2>
            <div className="space-y-3">
              {queueItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-card rounded-lg shadow-sm p-4 flex items-center justify-between border border-border"
                >
                  <div className="flex items-center space-x-4">
                    <File className="w-8 h-8 text-muted-foreground" />
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.file_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString('nl-NL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(item.status)}
                    <span className="text-sm font-medium text-foreground">
                      {getStatusLabel(item.status)}
                    </span>
                    {item.status === 'completed' && item.result_deck_id && (
                      <a
                        href={`/leersets/${item.result_deck_id}`}
                        className="h-8 px-4 py-2 bg-primary text-primary-foreground text-sm rounded-md hover:opacity-90 transition-opacity"
                      >
                        Bekijk
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    </AppShell>
  );
}
