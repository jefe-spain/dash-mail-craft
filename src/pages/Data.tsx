import { useState, useMemo } from 'react';
import type { JSONValue } from '@/components/JSONViewer';
import { JSONViewer } from '@/components/JSONViewer';
import { MarkdownViewer } from '@/components/MarkdownViewer';
import { filterJSONData } from '@/lib/json-filter';
import { contextData } from '@/data/context-data';
import { contextRulesMarkdown } from '@/data/context-rules';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, FileJson, Search, X, Filter, ListFilter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


const DataPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);

  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  const handleToggleMode = () => {
    setIsFilterMode(!isFilterMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
              <Code className="h-8 w-8" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Contexto
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Información contextual para referencia
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-6">
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <CardTitle className="flex items-center gap-2">
                  <FileJson className="h-5 w-5" />
                  Base de Conocimiento - Catalogo
                </CardTitle>
                
                <div className="relative w-full sm:w-auto max-w-sm space-y-2">
                  <div className="flex items-center relative">
                    {isFilterMode ? 
                      <ListFilter className="absolute left-2.5 h-4 w-4 text-primary" /> :
                      <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
                    }
                    <Input 
                      type="text"
                      placeholder={isFilterMode ? "Filtrar JSON..." : "Buscar en JSON..."}
                      className={cn(
                        "pl-8 pr-8 h-9 w-full sm:w-[260px]", 
                        isFilterMode && "border-primary focus-visible:ring-primary"
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 absolute right-2"
                        onClick={handleClearSearch}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center space-x-2">
                              <Switch 
                                id="filter-mode" 
                                checked={isFilterMode} 
                                onCheckedChange={handleToggleMode}
                              />
                              <Label htmlFor="filter-mode" className="text-xs font-medium cursor-pointer">
                                Modo filtro
                              </Label>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">
                            <p className="text-xs">{isFilterMode ? 
                              "Muestra solo las partes del JSON que coinciden con la búsqueda" : 
                              "Resalta coincidencias en todo el JSON"}                        
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    
                    {searchTerm && (
                      <div className="text-xs text-muted-foreground">
                        {isFilterMode ? "Filtrando" : "Buscando"}: <span className="font-medium">{searchTerm}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className={cn(
                "bg-white dark:bg-gray-900 p-6 rounded-md overflow-auto border border-gray-100 dark:border-gray-800",
                searchTerm ? "h-[680px]" : "h-[700px]"
              )}>
                {isFilterMode && searchTerm && Object.keys(filterJSONData(contextData, searchTerm) || {}).length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-12 text-muted-foreground">
                    <div className="rounded-full bg-muted/50 p-3 mb-4">
                      <ListFilter className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No hay resultados</h3>
                    <p className="text-center max-w-md">
                      No se encontraron coincidencias para <span className="font-medium">"{searchTerm}"</span>.
                      <br />Intenta con otro término de búsqueda.
                    </p>
                  </div>
                ) : (
                  <JSONViewer 
                    data={contextData} 
                    rootLabel="contexto" 
                    defaultExpanded={true} 
                    className="text-base"
                    searchTerm={searchTerm}
                    filterTerm={searchTerm}
                    filterMode={isFilterMode}
                  />
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Context Rules - Markdown Viewer */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="h-5 w-5"
                >
                  <path d="M14 3v4a1 1 0 0 0 1 1h4" />
                  <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z" />
                  <path d="M9 17h6" />
                  <path d="M9 13h6" />
                </svg>
                Reglas de Contexto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white dark:bg-gray-900 p-6 rounded-md overflow-auto border border-gray-100 dark:border-gray-800 h-[500px]">
                <MarkdownViewer content={contextRulesMarkdown} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataPage;
