import React, { useState, useEffect } from 'react';
import { UnifiedHeader } from '@/components/layout/UnifiedHeader';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { ContentCard } from '@/components/content/ContentCard';
import { ContentLesson } from '@/data/contentRepository';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { Heart, Search, BookOpen, Clock } from 'lucide-react';

export function ContentLibraryPage() {
  const [allContent, setAllContent] = useState<ContentLesson[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentLesson[]>([]);
  const [recommendedContent, setRecommendedContent] = useState<ContentLesson[]>([]);
  const [favoriteContent, setFavoriteContent] = useState<ContentLesson[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  
  // Helper function to get favorite content from localStorage
  const getFavoriteContent = (): ContentLesson[] => {
    try {
      const favorites = localStorage.getItem('ktp_favorite_content');
      return favorites ? JSON.parse(favorites) : [];
    } catch {
      return [];
    }
  };

  // Load content on component mount
  useEffect(() => {
    // For now, we'll set empty arrays - this will be populated with real content
    setAllContent([]);
    setFilteredContent([]);
    setRecommendedContent([]);
    setFavoriteContent(getFavoriteContent());
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    let filtered = allContent;
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.type === typeFilter);
    }
    
    setFilteredContent(filtered);
  }, [searchQuery, categoryFilter, typeFilter, allContent]);
  
  // Get unique categories for filter
  const categories = React.useMemo(() => {
    const categorySet = new Set(allContent.map(item => item.category));
    return ['all', ...Array.from(categorySet)];
  }, [allContent]);
  
  // Get unique types for filter
  const types = React.useMemo(() => {
    const typeSet = new Set(allContent.map(item => item.type));
    return ['all', ...Array.from(typeSet)];
  }, [allContent]);
  
  // Function to refresh favorites (used when toggling favorites)
  const refreshFavorites = () => {
    setFavoriteContent(getFavoriteContent());
  };
  
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <UnifiedHeader title="Content Library" />
      
      <main className="flex-1 container max-w-5xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="category-filter">Category</Label>
            <Select 
              value={categoryFilter} 
              onValueChange={setCategoryFilter}
            >
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="type-filter">Content Type</Label>
            <Select 
              value={typeFilter} 
              onValueChange={setTypeFilter}
            >
              <SelectTrigger id="type-filter">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>All</span>
            </TabsTrigger>
            <TabsTrigger value="recommended" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Recommended</span>
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {filteredContent.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No content found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filters to see more content.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContent.map((item) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recommended">
            {recommendedContent.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No recommendations yet</h3>
                <p className="text-muted-foreground">
                  Recommendations will appear as you explore more content.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedContent.map((item) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="favorites">
            {favoriteContent.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">
                  Click the heart icon on any content to add it to your favorites.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteContent.map((item) => (
                  <ContentCard key={item.id} content={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavigation />
    </div>
  );
}