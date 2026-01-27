import { useState, useEffect } from 'react';
import { cn } from '../../../../utils/cn';
import { PageOverviewTab } from './PageOverviewTab';
import { KnowledgeBaseTab } from '../../../../components/ContextDetailInspector/tabs/KnowledgeBaseTab';
import { KnowledgeGraphTab } from '../../../../components/ContextDetailInspector/tabs/KnowledgeGraphTab';
import type { TabType, ContextItem } from '../../../../types/contextInspector';

interface MainContentProps {
  className?: string;
  style?: React.CSSProperties;
  projectName?: string;
  projectId?: string;
  activeTab: TabType;
  selectedIngestionNumbers?: number[];
  onViewFullGraph?: () => void;
}

// Create a mock context item from project data
// In a real app, this would come from a context or prop
function createContextItem(projectId: string, projectName: string): ContextItem {
  return {
    id: projectId,
    name: projectName,
    type: 'repo',
    size: 0,
    fileCount: 0,
    lastUpdated: new Date(),
    status: 'cached',
  };
}

export function MainContent({
  className,
  style,
  projectName = 'Project',
  projectId = 'default',
  activeTab,
  selectedIngestionNumbers = [],
  onViewFullGraph,
}: MainContentProps) {
  // Project name state for editing
  const [currentProjectName, setCurrentProjectName] = useState(projectName);

  // Sync project name when prop changes
  useEffect(() => {
    setCurrentProjectName(projectName);
  }, [projectName]);

  // Create context item for tab components
  const contextItem = createContextItem(projectId, currentProjectName);

  // Render the active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <PageOverviewTab contextItem={contextItem} />;
      case 'knowledgebase':
        return <KnowledgeBaseTab contextId={contextItem.id} selectedIngestionNumbers={selectedIngestionNumbers} />;
      case 'knowledgegraph':
        return <KnowledgeGraphTab contextId={contextItem.id} onViewFullGraph={onViewFullGraph} />;
      default:
        return <PageOverviewTab contextItem={contextItem} />;
    }
  };

  return (
    <main
      className={cn(
        'h-full bg-[#0a0e1a] flex flex-col overflow-hidden',
        className
      )}
      style={style}
    >
      {/* Tab Content Area */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>
    </main>
  );
}

export default MainContent;
