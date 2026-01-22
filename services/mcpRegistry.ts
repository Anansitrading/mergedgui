export interface RegistryItem {
  id: string;
  name: string;
  description: string;
  homepage?: string;
  vendor?: string;
  downloadCount?: number;
}

const FALLBACK_REGISTRY: RegistryItem[] = [
    { id: 'filesystem', name: 'filesystem', vendor: '@modelcontextprotocol', description: 'Server that provides access to the local file system', downloadCount: 1240 },
    { id: 'memory', name: 'memory', vendor: '@modelcontextprotocol', description: 'Knowledge graph-based persistent memory system for agents', downloadCount: 890 },
    { id: 'github', name: 'github', vendor: '@modelcontextprotocol', description: 'Integration with GitHub API for repository management and PR analysis', downloadCount: 2100 },
    { id: 'postgres', name: 'postgres', vendor: '@modelcontextprotocol', description: 'PostgreSQL database interface for MCP agents to query and manage data', downloadCount: 560 },
    { id: 'brave-search', name: 'brave-search', vendor: '@modelcontextprotocol', description: 'Web search capabilities using Brave Search API for up-to-date information', downloadCount: 3400 },
    { id: 'slack', name: 'slack', vendor: '@modelcontextprotocol', description: 'Slack integration for messaging and channel management', downloadCount: 780 },
    { id: 'linear', name: 'linear', vendor: '@modelcontextprotocol', description: 'Project management via Linear API', downloadCount: 450 },
    { id: 'sqlite', name: 'sqlite', vendor: '@modelcontextprotocol', description: 'Lightweight database interface for local structured data storage', downloadCount: 920 },
    { id: 'google-drive', name: 'google-drive', vendor: '@modelcontextprotocol', description: 'Access and manage files in Google Drive', downloadCount: 1100 },
    { id: 'notion', name: 'notion', vendor: '@modelcontextprotocol', description: 'Integration for Notion pages and databases', downloadCount: 670 },
];

export async function fetchRegistry(): Promise<RegistryItem[]> {
    try {
        // In a production environment, we would fetch from the real registry.
        // const res = await fetch('https://registry.modelcontextprotocol.io/v1/servers');
        // if (!res.ok) throw new Error("Registry fetch failed");
        // const data = await res.json();
        // return data.results || [];
        
        // Simulating network delay for realistic UI behavior
        await new Promise(resolve => setTimeout(resolve, 800));
        return FALLBACK_REGISTRY;
    } catch (error) {
        console.warn("Falling back to mock registry data", error);
        return FALLBACK_REGISTRY;
    }
}