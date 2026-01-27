import { useCallback, useState, useRef } from 'react';
import { IngestionWizard } from '../../../../components/Hypervisa/IngestionWizard';
import { useIngestion, formatFileSizeFromBytes, SelectedFile } from '../../../../contexts/IngestionContext';
import { addIngestionEntry } from '../../../../services/compressionService';
import { IngestionConfig } from '../../../../types';
import type { IngestionSourceType } from '../../../../types/contextInspector';
import { X, Upload, FileText, GitBranch, AlignLeft, ArrowLeft } from 'lucide-react';

type SourceView = 'picker' | 'repo' | 'text';

interface IngestionModalProps {
  projectName: string;
  projectId: string;
}

export function IngestionModal({ projectName, projectId }: IngestionModalProps) {
  const { isModalOpen, selectedFile, closeIngestionModal, openIngestionModal } = useIngestion();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [sourceView, setSourceView] = useState<SourceView>('picker');

  // Repo state
  const [repoUrl, setRepoUrl] = useState('');
  const [repoBranch, setRepoBranch] = useState('');

  // Plain text state
  const [plainTextTitle, setPlainTextTitle] = useState('');
  const [plainTextContent, setPlainTextContent] = useState('');

  const resetSourceState = useCallback(() => {
    setSourceView('picker');
    setRepoUrl('');
    setRepoBranch('');
    setPlainTextTitle('');
    setPlainTextContent('');
  }, []);

  const handleClose = useCallback(() => {
    resetSourceState();
    closeIngestionModal();
  }, [resetSourceState, closeIngestionModal]);

  const handleSubmit = useCallback(
    async (config: IngestionConfig) => {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Derive source type from the file id prefix
      let sourceType: IngestionSourceType = 'file';
      if (selectedFile?.id.startsWith('repo-')) sourceType = 'repo';
      else if (selectedFile?.id.startsWith('text-')) sourceType = 'text';

      // Add an ingestion entry to the right panel's ingestion history
      await addIngestionEntry(
        projectId,
        1,
        0,
        config.displayName,
        0,
        sourceType,
        config.processingMode === 'compress',
        config.neverCompress
      );

      // Close the modal after successful ingestion
      resetSourceState();
      closeIngestionModal();
    },
    [projectId, selectedFile, closeIngestionModal, resetSourceState]
  );

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    const newSelectedFile: SelectedFile = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: formatFileSizeFromBytes(file.size),
      sizeBytes: file.size,
    };

    openIngestionModal(newSelectedFile);
  }, [openIngestionModal]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleRepoSubmit = useCallback(() => {
    if (!repoUrl.trim()) return;

    // Extract repo name from URL
    const urlParts = repoUrl.trim().replace(/\.git$/, '').split('/');
    const repoName = urlParts[urlParts.length - 1] || 'repository';
    const estimatedSize = '~unknown';

    const newSelectedFile: SelectedFile = {
      id: `repo-${Date.now()}`,
      name: repoName,
      size: estimatedSize,
      sizeBytes: 0,
    };

    openIngestionModal(newSelectedFile);
  }, [repoUrl, openIngestionModal]);

  const handlePlainTextSubmit = useCallback(() => {
    if (!plainTextContent.trim()) return;

    const title = plainTextTitle.trim() || 'Plain text';
    const sizeBytes = new Blob([plainTextContent]).size;

    const newSelectedFile: SelectedFile = {
      id: `text-${Date.now()}`,
      name: title,
      size: formatFileSizeFromBytes(sizeBytes),
      sizeBytes,
    };

    openIngestionModal(newSelectedFile);
  }, [plainTextTitle, plainTextContent, openIngestionModal]);

  if (!isModalOpen) {
    return null;
  }

  // Show wizard when file is selected
  if (selectedFile) {
    return (
      <IngestionWizard
        isOpen={isModalOpen}
        onClose={handleClose}
        file={{
          id: selectedFile.id,
          name: selectedFile.name,
          size: selectedFile.size,
        }}
        projectName={projectName}
        onSubmit={handleSubmit}
      />
    );
  }

  // Show source picker / sub-views when no file is selected
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            {sourceView !== 'picker' && (
              <button
                onClick={() => setSourceView('picker')}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {sourceView === 'picker' && 'New Ingestion'}
                {sourceView === 'repo' && 'Connect Repository'}
                {sourceView === 'text' && 'Plain Text'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {sourceView === 'picker' && `Add sources to ${projectName}`}
                {sourceView === 'repo' && 'Enter a Git repository URL to ingest'}
                {sourceView === 'text' && 'Paste or type text content to ingest'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {sourceView === 'picker' && (
            <>
              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-8 text-center transition-all
                  ${dragActive
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-muted-foreground/50 hover:bg-muted/30'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  accept=".ts,.tsx,.js,.jsx,.json,.md,.mdx,.css,.scss,.html,.py,.txt,.yaml,.yml"
                />

                <div className="flex flex-col items-center gap-4">
                  <div className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-colors
                    ${dragActive ? 'bg-primary/10' : 'bg-muted'}
                  `}>
                    <Upload size={28} className={dragActive ? 'text-primary' : 'text-muted-foreground'} />
                  </div>

                  <div>
                    <p className="text-foreground font-medium">
                      Drop files here or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-primary hover:underline"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Supports code files, documents, and data files
                    </p>
                  </div>
                </div>
              </div>

              {/* Source Type Options */}
              <div className="mt-6 space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Or choose a source</p>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center gap-2.5 p-4 bg-muted/50 hover:bg-muted rounded-lg border border-border hover:border-blue-500/30 transition-colors text-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <FileText size={20} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">File</p>
                      <p className="text-[11px] text-muted-foreground">Upload from disk</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSourceView('repo')}
                    className="flex flex-col items-center gap-2.5 p-4 bg-muted/50 hover:bg-muted rounded-lg border border-border hover:border-purple-500/30 transition-colors text-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                      <GitBranch size={20} className="text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Repository</p>
                      <p className="text-[11px] text-muted-foreground">Git repo URL</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setSourceView('text')}
                    className="flex flex-col items-center gap-2.5 p-4 bg-muted/50 hover:bg-muted rounded-lg border border-border hover:border-emerald-500/30 transition-colors text-center"
                  >
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <AlignLeft size={20} className="text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Plain Text</p>
                      <p className="text-[11px] text-muted-foreground">Paste content</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}

          {sourceView === 'repo' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Repository URL *</label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/user/repo.git"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRepoSubmit();
                  }}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  Branch <span className="text-muted-foreground/60">(optional, defaults to main)</span>
                </label>
                <input
                  type="text"
                  value={repoBranch}
                  onChange={(e) => setRepoBranch(e.target.value)}
                  placeholder="main"
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-purple-500 transition-colors"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRepoSubmit();
                  }}
                />
              </div>

              <button
                onClick={handleRepoSubmit}
                disabled={!repoUrl.trim()}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <GitBranch size={16} />
                Continue
              </button>
            </div>
          )}

          {sourceView === 'text' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">
                  Title <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <input
                  type="text"
                  value={plainTextTitle}
                  onChange={(e) => setPlainTextTitle(e.target.value)}
                  placeholder="e.g. API documentation, meeting notes..."
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-muted-foreground font-medium">Content *</label>
                <textarea
                  value={plainTextContent}
                  onChange={(e) => setPlainTextContent(e.target.value)}
                  placeholder="Paste or type your text content here..."
                  rows={8}
                  className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-500 transition-colors resize-y min-h-[120px]"
                  autoFocus
                />
                {plainTextContent.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {plainTextContent.length.toLocaleString()} characters &middot; {formatFileSizeFromBytes(new Blob([plainTextContent]).size)}
                  </p>
                )}
              </div>

              <button
                onClick={handlePlainTextSubmit}
                disabled={!plainTextContent.trim()}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <AlignLeft size={16} />
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default IngestionModal;
