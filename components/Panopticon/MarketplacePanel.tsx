import React, { useState, useEffect } from 'react';
import { Package, Search, Download } from 'lucide-react';
import { RegistryItem, fetchRegistry } from '../../services/mcpRegistry';
import { cn } from '../../utils/cn';

interface MarketplacePanelProps {
  onSelect: (item: RegistryItem) => void;
}

export function MarketplacePanel({ onSelect }: MarketplacePanelProps) {
  const [items, setItems] = useState<RegistryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadRegistry();
  }, []);

  const loadRegistry = async () => {
    setLoading(true);
    try {
      const data = await fetchRegistry();
      setItems(data);
    } catch (e) {
      console.error("Failed to fetch registry", e);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[350px] flex-shrink-0 flex flex-col border-l border-border/50 bg-background/20 backdrop-blur-sm h-full transition-all">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground font-mono">
          <Package size={14} />
          <span>Marketplace</span>
        </div>
        <div className="text-[10px] font-mono text-muted-foreground/50">
            REGISTRY_V1
        </div>
      </div>

      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative group">
          <Search className="absolute left-3 top-2.5 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-300" size={14} />
          <input 
            type="text" 
            placeholder="Find MCPs..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-secondary/20 border border-border/50 rounded-lg py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all duration-300"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="space-y-3">
             {[1, 2, 3, 4].map((i) => (
               <div key={i} className="h-24 rounded border border-border/10 bg-card/5 animate-pulse" />
             ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground/50 text-xs font-mono text-center">
            <span>No servers found.</span>
          </div>
        ) : (
          filteredItems.map(item => (
            <RegistryCard key={item.id} item={item} onSelect={() => onSelect(item)} />
          ))
        )}
      </div>
    </div>
  );
}

interface RegistryCardProps {
  item: RegistryItem;
  onSelect: () => void;
}

function RegistryCard({ item, onSelect }: RegistryCardProps) {
  return (
    <div 
      onClick={onSelect}
      className="relative group p-3 rounded border border-border/10 bg-card/5 hover:bg-card/10 transition-all duration-300 cursor-pointer overflow-hidden"
    >
       <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />
       
       <div className="flex justify-between items-start mb-1 relative z-10">
          <div className="flex flex-col max-w-[85%]">
            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">{item.name}</h4>
            {item.vendor && <span className="text-[10px] text-muted-foreground/50 font-mono truncate">{item.vendor}</span>}
          </div>
          
          <button 
            className="p-1.5 rounded-md text-muted-foreground/50 hover:text-accent-foreground hover:bg-accent/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-200"
            title="Install Server"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
          >
             <Download size={14} />
          </button>
       </div>
       
       <p className="text-xs text-muted-foreground line-clamp-2 mt-2 pr-4 relative z-10 leading-relaxed">
         {item.description}
       </p>
    </div>
  );
}