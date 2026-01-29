import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react';

// Types
export interface SourceFile {
  id: string;
  name: string;
  extension: string;
  size: number; // in bytes
  type: 'typescript' | 'javascript' | 'json' | 'markdown' | 'css' | 'html' | 'python' | 'other' | 'folder';
  isFolder?: boolean;
  parentId?: string | null; // null or undefined = root level
  order?: number; // for drag & drop ordering
}

interface SourceFilesState {
  files: SourceFile[];
  selectedFileIds: Set<string>;
  isLoading: boolean;
}

type SourceFilesAction =
  | { type: 'SET_FILES'; payload: SourceFile[] }
  | { type: 'ADD_FILES'; payload: SourceFile[] }
  | { type: 'REMOVE_FILE'; payload: string }
  | { type: 'TOGGLE_FILE_SELECTION'; payload: string }
  | { type: 'SELECT_ALL' }
  | { type: 'DESELECT_ALL' }
  | { type: 'SET_SELECTED_FILES'; payload: string[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RENAME_FILE'; payload: { id: string; newName: string } }
  | { type: 'CREATE_FOLDER'; payload: { name: string; parentId?: string | null } }
  | { type: 'MOVE_FILE'; payload: { fileId: string; targetFolderId: string | null } }
  | { type: 'REORDER_FILES'; payload: { fileId: string; newOrder: number; parentId?: string | null } };

// Local storage key
const SOURCE_FILES_STORAGE_KEY = 'source_files_selection';

// Get file type from extension
function getFileType(extension: string): SourceFile['type'] {
  const ext = extension.toLowerCase();
  switch (ext) {
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'json':
      return 'json';
    case 'md':
    case 'mdx':
      return 'markdown';
    case 'css':
    case 'scss':
    case 'sass':
    case 'less':
      return 'css';
    case 'html':
    case 'htm':
      return 'html';
    case 'py':
      return 'python';
    default:
      return 'other';
  }
}

// Load selection from localStorage
function loadSelectionFromStorage(): string[] {
  try {
    const stored = localStorage.getItem(SOURCE_FILES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load selection from storage:', error);
  }
  return [];
}

// Save selection to localStorage
function saveSelectionToStorage(selectedIds: string[]): void {
  try {
    localStorage.setItem(SOURCE_FILES_STORAGE_KEY, JSON.stringify(selectedIds));
  } catch (error) {
    console.error('Failed to save selection to storage:', error);
  }
}

// Empty initial state - files are added via ingestion
const INITIAL_SOURCE_FILES: SourceFile[] = [];

// Initial state
const initialState: SourceFilesState = {
  files: INITIAL_SOURCE_FILES,
  selectedFileIds: new Set<string>(),
  isLoading: false,
};

// Reducer
function sourceFilesReducer(state: SourceFilesState, action: SourceFilesAction): SourceFilesState {
  switch (action.type) {
    case 'SET_FILES':
      return {
        ...state,
        files: action.payload,
      };
    case 'ADD_FILES':
      return {
        ...state,
        files: [...state.files, ...action.payload],
      };
    case 'REMOVE_FILE': {
      const newSelectedIds = new Set(state.selectedFileIds);
      newSelectedIds.delete(action.payload);
      saveSelectionToStorage(Array.from(newSelectedIds));
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.payload),
        selectedFileIds: newSelectedIds,
      };
    }
    case 'TOGGLE_FILE_SELECTION': {
      const newSelectedIds = new Set(state.selectedFileIds);
      if (newSelectedIds.has(action.payload)) {
        newSelectedIds.delete(action.payload);
      } else {
        newSelectedIds.add(action.payload);
      }
      saveSelectionToStorage(Array.from(newSelectedIds));
      return {
        ...state,
        selectedFileIds: newSelectedIds,
      };
    }
    case 'SELECT_ALL': {
      const allIds = state.files.map((f) => f.id);
      saveSelectionToStorage(allIds);
      return {
        ...state,
        selectedFileIds: new Set(allIds),
      };
    }
    case 'DESELECT_ALL': {
      saveSelectionToStorage([]);
      return {
        ...state,
        selectedFileIds: new Set(),
      };
    }
    case 'SET_SELECTED_FILES': {
      saveSelectionToStorage(action.payload);
      return {
        ...state,
        selectedFileIds: new Set(action.payload),
      };
    }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'RENAME_FILE': {
      const { id, newName } = action.payload;
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === id
            ? {
                ...f,
                name: newName,
                extension: f.isFolder ? '' : newName.split('.').pop() || f.extension,
              }
            : f
        ),
      };
    }
    case 'CREATE_FOLDER': {
      const { name, parentId } = action.payload;
      const newFolder: SourceFile = {
        id: `folder-${Date.now()}`,
        name,
        extension: '',
        size: 0,
        type: 'folder',
        isFolder: true,
        parentId: parentId || null,
        order: state.files.filter((f) => f.parentId === (parentId || null)).length,
      };
      return {
        ...state,
        files: [...state.files, newFolder],
      };
    }
    case 'MOVE_FILE': {
      const { fileId, targetFolderId } = action.payload;
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === fileId ? { ...f, parentId: targetFolderId } : f
        ),
      };
    }
    case 'REORDER_FILES': {
      const { fileId, newOrder, parentId } = action.payload;
      const filesInSameParent = state.files
        .filter((f) => f.parentId === (parentId || null))
        .sort((a, b) => (a.order || 0) - (b.order || 0));

      const fileToMove = state.files.find((f) => f.id === fileId);
      if (!fileToMove) return state;

      // Reorder files in the same parent
      const updatedFiles = state.files.map((f) => {
        if (f.id === fileId) {
          return { ...f, order: newOrder, parentId: parentId || null };
        }
        if (f.parentId === (parentId || null) && f.id !== fileId) {
          const currentOrder = f.order || 0;
          const oldOrder = fileToMove.order || 0;

          if (oldOrder < newOrder && currentOrder > oldOrder && currentOrder <= newOrder) {
            return { ...f, order: currentOrder - 1 };
          }
          if (oldOrder > newOrder && currentOrder >= newOrder && currentOrder < oldOrder) {
            return { ...f, order: currentOrder + 1 };
          }
        }
        return f;
      });

      return {
        ...state,
        files: updatedFiles,
      };
    }
    default:
      return state;
  }
}

// Context interface
interface SourceFilesContextValue {
  files: SourceFile[];
  selectedFileIds: Set<string>;
  selectedFiles: SourceFile[];
  selectedCount: number;
  totalCount: number;
  totalSize: number;
  selectedSize: number;
  isAllSelected: boolean;
  isLoading: boolean;
  toggleFileSelection: (fileId: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  addFiles: (files: SourceFile[]) => void;
  removeFile: (fileId: string) => void;
  setFiles: (files: SourceFile[]) => void;
  renameFile: (fileId: string, newName: string) => void;
  createFolder: (name: string, parentId?: string | null) => void;
  moveFile: (fileId: string, targetFolderId: string | null) => void;
  reorderFiles: (fileId: string, newOrder: number, parentId?: string | null) => void;
  getFilesInFolder: (folderId: string | null) => SourceFile[];
  getFolders: () => SourceFile[];
}

// Create context
const SourceFilesContext = createContext<SourceFilesContextValue | undefined>(undefined);

// Provider
interface SourceFilesProviderProps {
  children: React.ReactNode;
}

export function SourceFilesProvider({ children }: SourceFilesProviderProps) {
  const [state, dispatch] = useReducer(sourceFilesReducer, initialState);

  // Load selection from storage on mount
  useEffect(() => {
    const storedSelection = loadSelectionFromStorage();
    if (storedSelection.length > 0) {
      // Only select files that exist
      const validSelection = storedSelection.filter((id) =>
        state.files.some((f) => f.id === id)
      );
      dispatch({ type: 'SET_SELECTED_FILES', payload: validSelection });
    }
  }, []);

  const toggleFileSelection = useCallback((fileId: string) => {
    dispatch({ type: 'TOGGLE_FILE_SELECTION', payload: fileId });
  }, []);

  const selectAll = useCallback(() => {
    dispatch({ type: 'SELECT_ALL' });
  }, []);

  const deselectAll = useCallback(() => {
    dispatch({ type: 'DESELECT_ALL' });
  }, []);

  const addFiles = useCallback((files: SourceFile[]) => {
    dispatch({ type: 'ADD_FILES', payload: files });
  }, []);

  const removeFile = useCallback((fileId: string) => {
    dispatch({ type: 'REMOVE_FILE', payload: fileId });
  }, []);

  const setFiles = useCallback((files: SourceFile[]) => {
    dispatch({ type: 'SET_FILES', payload: files });
  }, []);

  const renameFile = useCallback((fileId: string, newName: string) => {
    dispatch({ type: 'RENAME_FILE', payload: { id: fileId, newName } });
  }, []);

  const createFolder = useCallback((name: string, parentId?: string | null) => {
    dispatch({ type: 'CREATE_FOLDER', payload: { name, parentId } });
  }, []);

  const moveFile = useCallback((fileId: string, targetFolderId: string | null) => {
    dispatch({ type: 'MOVE_FILE', payload: { fileId, targetFolderId } });
  }, []);

  const reorderFiles = useCallback((fileId: string, newOrder: number, parentId?: string | null) => {
    dispatch({ type: 'REORDER_FILES', payload: { fileId, newOrder, parentId } });
  }, []);

  const getFilesInFolder = useCallback((folderId: string | null) => {
    return state.files
      .filter((f) => f.parentId === folderId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [state.files]);

  const getFolders = useCallback(() => {
    return state.files.filter((f) => f.isFolder);
  }, [state.files]);

  // Computed values
  const selectedFiles = useMemo(
    () => state.files.filter((f) => state.selectedFileIds.has(f.id)),
    [state.files, state.selectedFileIds]
  );

  const selectedCount = state.selectedFileIds.size;
  const totalCount = state.files.length;

  const totalSize = useMemo(
    () => state.files.reduce((sum, f) => sum + f.size, 0),
    [state.files]
  );

  const selectedSize = useMemo(
    () => selectedFiles.reduce((sum, f) => sum + f.size, 0),
    [selectedFiles]
  );

  const isAllSelected = selectedCount === totalCount && totalCount > 0;

  const value = useMemo(
    () => ({
      files: state.files,
      selectedFileIds: state.selectedFileIds,
      selectedFiles,
      selectedCount,
      totalCount,
      totalSize,
      selectedSize,
      isAllSelected,
      isLoading: state.isLoading,
      toggleFileSelection,
      selectAll,
      deselectAll,
      addFiles,
      removeFile,
      setFiles,
      renameFile,
      createFolder,
      moveFile,
      reorderFiles,
      getFilesInFolder,
      getFolders,
    }),
    [
      state.files,
      state.selectedFileIds,
      state.isLoading,
      selectedFiles,
      selectedCount,
      totalCount,
      totalSize,
      selectedSize,
      isAllSelected,
      toggleFileSelection,
      selectAll,
      deselectAll,
      addFiles,
      removeFile,
      setFiles,
      renameFile,
      createFolder,
      moveFile,
      reorderFiles,
      getFilesInFolder,
      getFolders,
    ]
  );

  return (
    <SourceFilesContext.Provider value={value}>
      {children}
    </SourceFilesContext.Provider>
  );
}

// Hook
export function useSourceFiles() {
  const context = useContext(SourceFilesContext);
  if (context === undefined) {
    throw new Error('useSourceFiles must be used within a SourceFilesProvider');
  }
  return context;
}

// Helper to format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Export for use in other files
export { getFileType, SourceFilesContext };
