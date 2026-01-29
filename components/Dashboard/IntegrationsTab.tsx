// Integrations Tab - Dashboard Tab Component
// Redesigned with sub-tab navigation, custom connectors, and improved filtering
// Task 1_4: Integrations Tab Migration + Redesign

import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { LayoutGrid, List, ChevronDown, Search, X, Filter, Check } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  IntegrationCard,
  CustomConnectorModal,
  EmptyState,
  FilterSidebar,
  DEFAULT_SIDEBAR_FILTERS,
  IntegrationDetailPanel,
} from './integrations';
import type { SidebarFilters } from './integrations';
import type {
  IntegrationProvider,
  ConnectedIntegration,
  IntegrationsFilterState,
  IntegrationCardData,
  CustomConnector,
  CreateCustomConnectorData,
} from '../../types/settings';
import { INTEGRATION_APPS, INTEGRATION_CATEGORIES } from '../../types/settings';
import type { IntegrationCategory } from '../../types/settings';

// Sub-tabs removed - sidebar now handles My Integrations view

// Sort options
const SORT_OPTIONS: { id: IntegrationsFilterState['sortBy']; label: string }[] = [
  { id: 'recent', label: 'Most recent' },
  { id: 'popular', label: 'Popular' },
  { id: 'name', label: 'Name' },
];

// Default filter state
const DEFAULT_FILTERS: IntegrationsFilterState = {
  search: '',
  category: 'all',
  statusFilter: 'all',
  sortBy: 'popular',
  showConnectedOnly: false,
};

// Filter options for dropdown
const STATUS_OPTIONS: { value: SidebarFilters['selectedStatuses'][number]; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'connected', label: 'Connected' },
  { value: 'warning', label: 'Warning' },
  { value: 'disconnected', label: 'Disconnected' },
];

const TYPE_OPTIONS: { value: SidebarFilters['selectedTypes'][number]; label: string }[] = [
  { value: 'pre-built', label: 'Pre-built' },
  { value: 'custom', label: 'Custom' },
];

const CATEGORY_OPTIONS: { value: IntegrationCategory; label: string }[] = Object.entries(
  INTEGRATION_CATEGORIES
).map(([value, label]) => ({
  value: value as IntegrationCategory,
  label: label as string,
}));

function toggleItem<T>(arr: T[], item: T): T[] {
  return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
}

export function IntegrationsTab() {
  // Filter state
  const [filters, setFilters] = useState<IntegrationsFilterState>(DEFAULT_FILTERS);

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Current sort label
  const currentSortLabel = SORT_OPTIONS.find((o) => o.id === filters.sortBy)?.label || 'Sort';

  // Connected apps state (mock data - replace with actual API calls)
  const [connectedApps, setConnectedApps] = useState<ConnectedIntegration[]>([
    {
      id: '0',
      provider: 'kijko-file-storage',
      scopes: ['read_files', 'write_files', 'delete_files', 'manage_folders'],
      connectedAt: new Date('2024-01-01'),
      lastSyncAt: new Date(),
      status: 'active',
    },
    {
      id: '0b',
      provider: 'kijko-knowledge-graph',
      scopes: ['read_graph', 'write_graph', 'manage_entities', 'manage_relations'],
      connectedAt: new Date('2024-01-01'),
      lastSyncAt: new Date(),
      status: 'active',
    },
    {
      id: '1',
      provider: 'slack',
      scopes: ['send_messages', 'read_channels'],
      connectedAt: new Date('2024-01-15'),
      lastSyncAt: new Date('2024-01-20'),
      status: 'active',
    },
    {
      id: '2',
      provider: 'github',
      scopes: ['read_repos', 'write_repos'],
      connectedAt: new Date('2024-01-10'),
      status: 'active',
    },
    {
      id: '3',
      provider: 'hubspot',
      scopes: ['read_contacts', 'write_contacts'],
      connectedAt: new Date('2024-01-05'),
      status: 'error',
    },
  ]);

  // Custom connectors state (mock data)
  const [customConnectors, setCustomConnectors] = useState<CustomConnector[]>([
    {
      id: 'custom-1',
      name: 'Internal CRM',
      description: 'Custom connector to internal CRM system',
      remoteMcpServerUrl: 'https://api.internal.com/mcp',
      category: 'crm',
      authType: 'api_key',
      createdAt: new Date('2024-01-12'),
      updatedAt: new Date('2024-01-12'),
      status: 'active',
    },
  ]);

  // Sidebar filter state
  const [sidebarFilters, setSidebarFilters] = useState<SidebarFilters>(DEFAULT_SIDEBAR_FILTERS);

  // Filter dropdown state
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [filterDropdownPosition, setFilterDropdownPosition] = useState({ top: 0, left: 0 });
  const filterButtonRef = useRef<HTMLButtonElement>(null);

  const activeFilterCount =
    sidebarFilters.selectedCategories.length +
    sidebarFilters.selectedStatuses.length +
    sidebarFilters.selectedTypes.length;

  const openFilterDropdown = useCallback(() => {
    if (filterButtonRef.current) {
      const rect = filterButtonRef.current.getBoundingClientRect();
      setFilterDropdownPosition({
        top: rect.bottom + 8,
        left: rect.right - 220,
      });
    }
    setIsFilterDropdownOpen(true);
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (filterButtonRef.current && !filterButtonRef.current.contains(target)) {
        const dropdown = document.getElementById('integrations-filter-dropdown');
        if (dropdown && !dropdown.contains(target)) {
          setIsFilterDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal states
  const [isCustomConnectorModalOpen, setIsCustomConnectorModalOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<CustomConnector | undefined>();

  // Selected integration for detail panel
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  // Transform pre-built apps to unified card data
  const transformAppToCardData = useCallback(
    (app: (typeof INTEGRATION_APPS)[0]): IntegrationCardData => {
      const connection = connectedApps.find((c) => c.provider === app.id);
      return {
        id: app.id,
        name: app.name,
        description: app.description,
        category: app.category,
        icon: app.icon,
        isPopular: app.isPopular,
        isConnected: !!connection,
        connectionStatus: connection
          ? connection.status === 'error'
            ? 'warning'
            : app.id.startsWith('kijko-')
              ? 'default'
              : 'connected'
          : undefined,
        lastSynced: connection?.lastSyncAt,
        permissions: app.permissions,
        isCustom: false,
      };
    },
    [connectedApps]
  );

  // Transform custom connector to unified card data
  const transformConnectorToCardData = useCallback(
    (connector: CustomConnector): IntegrationCardData => ({
      id: connector.id,
      name: connector.name,
      description: connector.description || 'Custom MCP server integration',
      category: connector.category,
      icon: 'custom',
      iconUrl: connector.iconUrl,
      isConnected: connector.status === 'active',
      connectionStatus:
        connector.status === 'active'
          ? 'connected'
          : connector.status === 'error'
            ? 'disconnected'
            : 'warning',
      lastSynced: connector.lastUsedAt,
      isCustom: true,
    }),
    []
  );

  // Filter and sort integrations
  const filteredIntegrations = useMemo(() => {
    // Show all integrations (pre-built + custom connectors)
    let items: IntegrationCardData[] = [
      ...INTEGRATION_APPS.map(transformAppToCardData),
      ...customConnectors.map(transformConnectorToCardData),
    ];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category !== 'all') {
      items = items.filter((item) => item.category === filters.category);
    }

    if (filters.showConnectedOnly) {
      items = items.filter((item) => item.isConnected);
    }

    // Apply sidebar filters
    if (sidebarFilters.selectedCategories.length > 0) {
      items = items.filter(
        (item) =>
          item.category !== 'custom' &&
          sidebarFilters.selectedCategories.includes(item.category)
      );
    }

    if (sidebarFilters.selectedStatuses.length > 0) {
      items = items.filter((item) => {
        if (!item.isConnected && !item.connectionStatus) {
          // Unconnected items: show only if 'disconnected' is selected
          return sidebarFilters.selectedStatuses.includes('disconnected');
        }
        return (
          item.connectionStatus &&
          sidebarFilters.selectedStatuses.includes(item.connectionStatus)
        );
      });
    }

    if (sidebarFilters.selectedTypes.length > 0) {
      items = items.filter((item) => {
        if (item.isCustom) return sidebarFilters.selectedTypes.includes('custom');
        return sidebarFilters.selectedTypes.includes('pre-built');
      });
    }

    // Apply sorting
    return items.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular':
          if (a.isPopular && !b.isPopular) return -1;
          if (!a.isPopular && b.isPopular) return 1;
          return a.name.localeCompare(b.name);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'recent':
          // Custom connectors first, then by name
          if (a.isCustom && !b.isCustom) return -1;
          if (!a.isCustom && b.isCustom) return 1;
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });
  }, [
    filters,
    sidebarFilters,
    connectedApps,
    customConnectors,
    transformAppToCardData,
    transformConnectorToCardData,
  ]);

  // Selected integration for detail panel
  const selectedIntegration = useMemo(
    () => filteredIntegrations.find((i) => i.id === selectedIntegrationId) || null,
    [filteredIntegrations, selectedIntegrationId]
  );

  // Handlers for connected apps
  const handleConnect = async (id: string) => {
    console.log('Connecting to:', id);
    const app = INTEGRATION_APPS.find((a) => a.id === id);
    if (app) {
      const newConnection: ConnectedIntegration = {
        id: Date.now().toString(),
        provider: id as IntegrationProvider,
        scopes: app.permissions,
        connectedAt: new Date(),
        status: 'active',
      };
      setConnectedApps((prev) => [...prev, newConnection]);
    }
  };

  const handleDisconnect = async (id: string) => {
    setConnectedApps((prev) => prev.filter((c) => c.provider !== id));
  };

  const handleManage = (id: string) => {
    console.log('Managing:', id);
    // TODO: Open management modal
  };

  const handleViewLogs = (id: string) => {
    console.log('Viewing logs for:', id);
    // TODO: Open logs modal
  };

  const handleReconnect = async (id: string) => {
    console.log('Reconnecting:', id);
    // Update the connection status
    setConnectedApps((prev) =>
      prev.map((c) =>
        c.provider === id ? { ...c, status: 'active', lastSyncAt: new Date() } : c
      )
    );
  };

  // Handlers for custom connectors
  const handleCreateCustomConnector = async (data: CreateCustomConnectorData) => {
    const newConnector: CustomConnector = {
      id: `custom-${Date.now()}`,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'active',
    };
    setCustomConnectors((prev) => [...prev, newConnector]);
  };

  const handleUpdateCustomConnector = async (data: CreateCustomConnectorData) => {
    if (!editingConnector) return;
    setCustomConnectors((prev) =>
      prev.map((c) =>
        c.id === editingConnector.id ? { ...c, ...data, updatedAt: new Date() } : c
      )
    );
    setEditingConnector(undefined);
  };

  const handleDeleteCustomConnector = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this custom connector?')) {
      setCustomConnectors((prev) => prev.filter((c) => c.id !== id));
    }
  };

  // Determine if we should show empty states
  const showEmptyState = filteredIntegrations.length === 0 && !filters.search;

  return (
    <div
      role="tabpanel"
      id="tabpanel-integrations"
      aria-labelledby="tab-integrations"
      className="flex flex-col h-full"
    >
      {/* Controls Bar - with border like Projects */}
      <div className="shrink-0 border-b border-border bg-card/30 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Title */}
          <h1 className="text-lg font-semibold text-foreground">All Integrations</h1>

          {/* Search and View Controls */}
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-muted-foreground pointer-events-none" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search integrations..."
                className="w-64 pl-9 pr-8 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              {filters.search && (
                <button
                  onClick={() => setFilters({ ...filters, search: '' })}
                  className="absolute right-2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filter Button */}
            <div className="relative">
              <button
                ref={filterButtonRef}
                onClick={() => isFilterDropdownOpen ? setIsFilterDropdownOpen(false) : openFilterDropdown()}
                className={cn(
                  'flex items-center justify-center p-2 border rounded-lg transition-colors',
                  activeFilterCount > 0
                    ? 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'
                    : 'bg-muted/50 border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
                title="Filter integrations"
              >
                <Filter size={18} />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Filter Dropdown */}
              {isFilterDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                  <div
                    id="integrations-filter-dropdown"
                    className="fixed min-w-[220px] bg-card border border-border rounded-lg shadow-xl z-50 py-3 max-h-[70vh] overflow-y-auto"
                    style={{ top: filterDropdownPosition.top, left: filterDropdownPosition.left }}
                  >
                    {/* Header with clear button */}
                    <div className="flex items-center justify-between px-4 pb-3 border-b border-border mb-3">
                      <span className="text-sm font-medium text-foreground">Filters</span>
                      {activeFilterCount > 0 && (
                        <button
                          onClick={() => setSidebarFilters(DEFAULT_SIDEBAR_FILTERS)}
                          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X size={12} />
                          Clear all
                        </button>
                      )}
                    </div>

                    {/* Status Filters */}
                    <div className="px-4 mb-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Status
                      </span>
                      <div className="flex flex-col gap-1">
                        {STATUS_OPTIONS.map((option) => {
                          const isActive = sidebarFilters.selectedStatuses.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                setSidebarFilters({
                                  ...sidebarFilters,
                                  selectedStatuses: toggleItem(sidebarFilters.selectedStatuses, option.value),
                                })
                              }
                              className={cn(
                                'flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                                isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                  isActive ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                                )}
                              >
                                {isActive && <Check size={12} className="text-primary-foreground" />}
                              </span>
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Type Filters */}
                    <div className="px-4 mb-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Type
                      </span>
                      <div className="flex flex-col gap-1">
                        {TYPE_OPTIONS.map((option) => {
                          const isActive = sidebarFilters.selectedTypes.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                setSidebarFilters({
                                  ...sidebarFilters,
                                  selectedTypes: toggleItem(sidebarFilters.selectedTypes, option.value),
                                })
                              }
                              className={cn(
                                'flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                                isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                  isActive ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                                )}
                              >
                                {isActive && <Check size={12} className="text-primary-foreground" />}
                              </span>
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category Filters */}
                    <div className="px-4">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                        Categories
                      </span>
                      <div className="flex flex-col gap-1">
                        {CATEGORY_OPTIONS.map((option) => {
                          const isActive = sidebarFilters.selectedCategories.includes(option.value);
                          return (
                            <button
                              key={option.value}
                              onClick={() =>
                                setSidebarFilters({
                                  ...sidebarFilters,
                                  selectedCategories: toggleItem(sidebarFilters.selectedCategories, option.value),
                                })
                              }
                              className={cn(
                                'flex items-center gap-3 w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                                isActive ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                              )}
                            >
                              <span
                                className={cn(
                                  'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0',
                                  isActive ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                                )}
                              >
                                {isActive && <Check size={12} className="text-primary-foreground" />}
                              </span>
                              <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-muted/50 border border-border rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'grid'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="Grid view"
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  viewMode === 'list'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                title="List view"
              >
                <List size={18} />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="flex items-center gap-2 px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <span>{currentSortLabel}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    'transition-transform',
                    isSortDropdownOpen && 'rotate-180'
                  )}
                />
              </button>

              {isSortDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsSortDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-xl z-50 py-1">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => {
                          setFilters({ ...filters, sortBy: option.id });
                          setIsSortDropdownOpen(false);
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-sm text-left transition-colors',
                          filters.sortBy === option.id
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        )}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className={cn(
        'flex-1 p-6',
        selectedIntegration ? 'overflow-hidden' : 'overflow-y-auto'
      )}>
        <div className="flex gap-6 h-full">
          {/* Filter Sidebar */}
          <FilterSidebar
            filters={sidebarFilters}
            onFiltersChange={setSidebarFilters}
            onCreateNew={() => {
              setEditingConnector(undefined);
              setIsCustomConnectorModalOpen(true);
            }}
            integrations={filteredIntegrations}
            onIntegrationClick={(id) => setSelectedIntegrationId(id)}
            selectedIntegrationId={selectedIntegrationId}
          />

          {/* Content - Show either cards grid OR detail panel */}
          {selectedIntegration ? (
            /* Integration Detail Panel - Full width when selected */
            <IntegrationDetailPanel
              integration={selectedIntegration}
              onClose={() => setSelectedIntegrationId(null)}
              onConnect={handleConnect}
              onDisconnect={
                selectedIntegration.isCustom
                  ? () => handleDeleteCustomConnector(selectedIntegration.id)
                  : handleDisconnect
              }
              onReconnect={handleReconnect}
            />
          ) : (
            /* Cards Grid */
            <div className="flex-1 min-w-0">
              {/* Content */}
              {showEmptyState ? (
                <EmptyState
                  variant="no-integrations"
                  onAction={() => setIsCustomConnectorModalOpen(true)}
                />
              ) : filteredIntegrations.length === 0 && filters.search ? (
                <EmptyState
                  variant="no-results"
                  searchQuery={filters.search}
                  onAction={() => setIsCustomConnectorModalOpen(true)}
                />
              ) : (
                <div className={cn(
                  'gap-4',
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
                    : 'flex flex-col'
                )}>
                  {/* Integration Cards */}
                  {filteredIntegrations.map((integration) => (
                    <IntegrationCard
                      key={integration.id}
                      integration={integration}
                      viewMode={viewMode}
                      onConnect={handleConnect}
                      onDisconnect={
                        integration.isCustom
                          ? () => handleDeleteCustomConnector(integration.id)
                          : handleDisconnect
                      }
                      onManage={handleManage}
                      onViewLogs={handleViewLogs}
                      onReconnect={handleReconnect}
                      onCardClick={(id) => setSelectedIntegrationId(id)}
                    />
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      {/* Custom Connector Modal */}
      <CustomConnectorModal
        isOpen={isCustomConnectorModalOpen}
        connector={editingConnector}
        onClose={() => {
          setIsCustomConnectorModalOpen(false);
          setEditingConnector(undefined);
        }}
        onSubmit={editingConnector ? handleUpdateCustomConnector : handleCreateCustomConnector}
      />
    </div>
  );
}

export default IntegrationsTab;
