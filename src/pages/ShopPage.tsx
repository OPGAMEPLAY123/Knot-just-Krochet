import React, { useState, useMemo } from 'react';
import { Search, Filter, RotateCcw, X, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface ShopPageProps {
  initialCategory?: string;
  onSelectProduct: (productId: string) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ initialCategory, onSelectProduct }) => {
  const { products, categories } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedVariation, setSelectedVariation] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [showFiltersMobile, setShowFiltersMobile] = useState<boolean>(false);

  // Extract all unique colors across active products
  const availableColors = useMemo(() => {
    const colorSet = new Set<string>();
    products.forEach((p) => {
      p.colors?.forEach((c) => {
        // Normalize compound colors or individual color names
        colorSet.add(c.trim());
      });
    });
    return Array.from(colorSet).sort();
  }, [products]);

  // Extract all unique sizes/variations across active products
  const availableVariations = useMemo(() => {
    const varSet = new Set<string>();
    products.forEach((p) => {
      p.variations?.forEach((v) => {
        varSet.add(v.trim());
      });
    });
    return Array.from(varSet).sort();
  }, [products]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (!product.isActive) return false;

        // 1. Search by name and description
        if (searchTerm.trim()) {
          const query = searchTerm.toLowerCase();
          const matchName = product.name.toLowerCase().includes(query);
          const matchDesc = product.description.toLowerCase().includes(query);
          const matchCat = product.category.toLowerCase().includes(query);
          if (!matchName && !matchDesc && !matchCat) return false;
        }

        // 2. Category filter
        if (selectedCategory !== 'all') {
          if (product.category !== selectedCategory) return false;
        }

        // 3. Color filter
        if (selectedColor !== 'all') {
          const matchesColor = product.colors?.some((c) =>
            c.toLowerCase().includes(selectedColor.toLowerCase())
          );
          if (!matchesColor) return false;
        }

        // 4. Size / Variation filter
        if (selectedVariation !== 'all') {
          const matchesVar = product.variations?.some((v) =>
            v.toLowerCase().includes(selectedVariation.toLowerCase())
          );
          if (!matchesVar) return false;
        }

        // 5. In-stock filter
        if (inStockOnly && product.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.discountPrice ?? a.price;
        const priceB = b.discountPrice ?? b.price;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        // default featured
        if (a.isFeatured && !b.isFeatured) return -1;
        if (!a.isFeatured && b.isFeatured) return 1;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, selectedColor, selectedVariation, sortBy, inStockOnly]);

  const hasActiveFilters =
    Boolean(searchTerm) ||
    selectedCategory !== 'all' ||
    selectedColor !== 'all' ||
    selectedVariation !== 'all' ||
    inStockOnly ||
    sortBy !== 'featured';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedColor('all');
    setSelectedVariation('all');
    setSortBy('featured');
    setInStockOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title & Intro */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C28]">
          The Crochet Catalogue
        </h1>
        <p className="text-sm text-[#7A6158] max-w-xl mx-auto">
          Every piece is handcrafted stitch-by-stitch with gentle love. Search by item name or description, and filter by your preferred color, category, or size.
        </p>
      </div>

      {/* Main Filter & Search Control Panel */}
      <div className="bg-[#FFFDF9] rounded-3xl p-4 sm:p-6 border border-[#EFE8DE] shadow-xs space-y-4">
        {/* Top Search & Primary Controls */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Bar (Name & Description) */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#8B6B61] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, bloom type, description (e.g. lavender, tote, daisy)..."
              className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-2xl text-[#3D2C28] placeholder-[#9B8780] focus:outline-none focus:ring-2 focus:ring-[#E8A598]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#8B6B61] hover:text-[#3D2C28]"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="md:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm bg-[#FAF7F2] border border-[#E5DACD] rounded-2xl text-[#3D2C28] focus:outline-none focus:ring-2 focus:ring-[#E8A598]"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* In-Stock Toggle & Mobile Filter Toggle */}
          <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#6E5049] select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#6E5049] accent-[#6E5049] focus:ring-[#E8A598]"
              />
              <span>In-stock only</span>
            </label>

            <button
              onClick={() => setShowFiltersMobile(!showFiltersMobile)}
              className="sm:hidden px-3 py-1.5 rounded-xl border border-[#D8C7B5] text-xs font-semibold text-[#6E5049] flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="pt-2 border-t border-[#F4EFEA] flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-xs text-[#8B6B61] shrink-0 font-medium flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#6E5049] text-white shadow-xs'
                : 'bg-[#FAF7F2] text-[#6E5049] hover:bg-[#EFE8DE]'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all ${
                selectedCategory === cat.name
                  ? 'bg-[#6E5049] text-white shadow-xs'
                  : 'bg-[#FAF7F2] text-[#6E5049] hover:bg-[#EFE8DE]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Color & Size Dropdowns (Desktop + Expandable Mobile) */}
        <div className={`pt-2 border-t border-[#F4EFEA] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 ${showFiltersMobile ? 'block' : 'hidden sm:grid'}`}>
          {/* Color Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#6E5049] uppercase tracking-wider block">
              Filter by Color
            </label>
            <select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-[#3D2C28] focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
            >
              <option value="all">All Colors</option>
              {availableColors.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>

          {/* Size / Variation Filter */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#6E5049] uppercase tracking-wider block">
              Filter by Size / Variation
            </label>
            <select
              value={selectedVariation}
              onChange={(e) => setSelectedVariation(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-[#FAF7F2] border border-[#E5DACD] rounded-xl text-[#3D2C28] focus:outline-none focus:ring-1 focus:ring-[#E8A598]"
            >
              <option value="all">All Sizes / Variations</option>
              {availableVariations.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Active Filters Summary & Reset */}
          <div className="flex items-end justify-between sm:justify-end gap-2 pt-2 sm:pt-0">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl text-xs text-[#8B5E3C] hover:bg-[#F4EFEA] flex items-center gap-1.5 font-semibold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filter Tags Bar */}
        {hasActiveFilters && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-[#8B6B61]">Active Filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE8DE] text-[11px] text-[#6E5049]">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm('')}><X className="w-3 h-3 hover:text-black" /></button>
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE8DE] text-[11px] text-[#6E5049]">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3 hover:text-black" /></button>
              </span>
            )}
            {selectedColor !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE8DE] text-[11px] text-[#6E5049]">
                Color: {selectedColor}
                <button onClick={() => setSelectedColor('all')}><X className="w-3 h-3 hover:text-black" /></button>
              </span>
            )}
            {selectedVariation !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE8DE] text-[11px] text-[#6E5049]">
                Size: {selectedVariation}
                <button onClick={() => setSelectedVariation('all')}><X className="w-3 h-3 hover:text-black" /></button>
              </span>
            )}
            {inStockOnly && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#EFE8DE] text-[11px] text-[#6E5049]">
                In-Stock Only
                <button onClick={() => setInStockOnly(false)}><X className="w-3 h-3 hover:text-black" /></button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#8B6B61] px-1">
        <span>
          Showing <strong>{filteredProducts.length}</strong> {filteredProducts.length === 1 ? 'creation' : 'creations'}
        </span>
      </div>

      {/* Products Grid or Empty State */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={onSelectProduct}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#FFFDF9] rounded-3xl p-12 text-center border border-[#EFE8DE] space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#F4EFEA] flex items-center justify-center mx-auto text-3xl">
            🔍
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#3D2C28]">No crochet creations found</h3>
            <p className="text-xs text-[#7A6158]">
              We couldn't find any products matching your current filters. Try relaxing your color, category, or search criteria.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-full bg-[#6E5049] text-white text-xs font-semibold hover:bg-[#5C433C] transition-all shadow-xs"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};
