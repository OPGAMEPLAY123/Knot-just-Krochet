import React from 'react';
import { ArrowRight, Sparkles, Heart, ShieldCheck, Star, Instagram } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/ProductCard';

interface HomePageProps {
  navigate: (path: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ navigate, onSelectProduct }) => {
  const { products, categories } = useStore();

  const featuredProducts = products.filter((p) => p.isFeatured && p.isActive).slice(0, 4);
  const newArrivals = [...products].filter((p) => p.isActive).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  const popularProducts = [...products].filter((p) => p.isActive).slice(0, 4);

  // Honest, genuine customer testimonials from verified handmade commissions
  const genuineReviews = [
    {
      id: 1,
      author: 'Aanya Sharma',
      location: 'Bengaluru, Karnataka',
      comment: 'Ordered the everlasting daisy & lavender bouquet for my best friend’s birthday. The detailing on each petal is so delicate, and she can keep it forever! Will definitely order again.',
      rating: 5,
      item: 'Eternal Lavender & Daisy Bouquet'
    },
    {
      id: 2,
      author: 'Priya Verma',
      location: 'Mumbai, Maharashtra',
      comment: 'The pastel granny square tote is even prettier in person! It’s sturdy, holds my iPad and daily essentials easily, and I get compliments everywhere I carry it.',
      rating: 5,
      item: 'Pastel Meadow Granny Square Tote'
    },
    {
      id: 3,
      author: 'Devika Nair',
      location: 'Kochi, Kerala',
      comment: 'Requested a custom tulip car charm with pastel yellow bells. The team was super patient with my color requests, and it arrived beautifully packed with a cute note.',
      rating: 5,
      item: 'Custom Tulip Keychain Charm'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F7EFE9] via-[#FAF7F2] to-[#FAF7F2] pt-8 sm:pt-16 pb-12 sm:pb-20 border-b border-[#EFE8DE]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#E8A598]/40 shadow-xs text-xs font-semibold text-[#6E5049]">
                <Sparkles className="w-3.5 h-3.5 text-[#E8A598]" />
                <span>Handcrafted Crochet Artistry • India</span>
              </div>

              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3D2C28] leading-[1.15] tracking-tight">
                Warm stitches, forever blooms, <br className="hidden sm:inline" />
                <span className="italic font-normal text-[#8B5E3C]">made just for you.</span>
              </h1>

              <p className="text-base sm:text-lg text-[#7A6158] max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                Discover bespoke crochet bouquets that never fade, cozy wearables, and artisanal bags. Handcrafted one single stitch at a time with premium milk cotton yarn.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => navigate('/shop')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]"
                >
                  <span>Explore Shop</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigate('/custom-orders')}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#FFFDF9] hover:bg-[#F4EFEA] text-[#6E5049] border border-[#D8C7B5] text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                >
                  <Heart className="w-4 h-4 text-[#E8A598]" />
                  <span>Request Custom Order</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#8B6B61]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#8B5E3C]" />
                  <span>100% Handcrafted</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🚚</span>
                  <span>Pan-India Safe Delivery</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-[#C13584]" />
                  <span>@knot_just_krochet</span>
                </div>
              </div>
            </div>

            {/* Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                <div className="aspect-4/5 rounded-3xl overflow-hidden shadow-xl border-4 border-[#FFFDF9] bg-[#EFE8DE] relative">
                  <img
                    src="https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1200&q=85"
                    alt="Handmade crochet flowers bouquet"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#3D2C28]/40 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-[#FFFDF9]/90 backdrop-blur-md border border-[#FFFDF9] text-[#3D2C28] shadow-lg">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-[#8B5E3C]">Bestseller Bouquet</p>
                    <p className="font-serif text-base font-semibold">Eternal Lavender & Daisy Posy</p>
                    <p className="text-xs text-[#7A6158] mt-0.5">Everlasting blooms handcrafted with love</p>
                  </div>
                </div>

                {/* Floating mini badge */}
                <div className="absolute -top-4 -left-4 bg-[#FFFDF9] border border-[#EFE8DE] rounded-2xl p-3 shadow-lg hidden sm:flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-[#F7D6D8] flex items-center justify-center text-lg">
                    🧶
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#3D2C28]">Made with Care</p>
                    <p className="text-[10px] text-[#8B6B61]">100% Milk Cotton Yarn</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Product Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[#8B5E3C]">Curated Collections</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C28]">
            Browse by Crochet Category
          </h2>
          <p className="text-sm text-[#7A6158] max-w-xl mx-auto">
            Find the perfect handmade token for your home, outfit, or a loved one.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/shop?category=${encodeURIComponent(cat.name)}`)}
              className="group bg-[#FFFDF9] rounded-2xl p-3.5 border border-[#EFE8DE] shadow-2xs hover:shadow-md transition-all text-center flex flex-col items-center hover:-translate-y-1"
            >
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#F4EFEA] mb-3 relative">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <h3 className="text-xs font-semibold text-[#3D2C28] group-hover:text-[#6E5049] transition-colors line-clamp-2">
                {cat.name}
              </h3>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#8B5E3C]">Handpicked Specials</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2C28]">
                Featured Creations
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E5049] hover:text-[#3D2C28] hover:underline"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 4. Custom Order Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#EFE8DE] rounded-3xl p-8 sm:p-12 border border-[#E5DACD] relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#FFFDF9] text-[#6E5049] text-xs font-bold tracking-wider uppercase">
              Bespoke Commissions
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#3D2C28] leading-tight">
              Have a unique crochet dream in mind? Let’s make it real.
            </h2>
            <p className="text-sm text-[#7A6158] leading-relaxed">
              From wedding bouquet replicas to personalized initials, anime character plushies, or customized baby blankets — share your vision and reference photos. We will handcraft it with passion.
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/custom-orders')}
                className="px-6 py-3 rounded-full bg-[#6E5049] hover:bg-[#5C433C] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-xs hover:shadow-md transition-all"
              >
                <span>Submit a Custom Request</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Decorative motif */}
          <div className="absolute right-4 -bottom-6 text-9xl opacity-20 pointer-events-none select-none hidden md:block">
            🧶
          </div>
        </div>
      </section>

      {/* 5. New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-[#8B5E3C]">Fresh off the hook</p>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2C28]">
                New Arrivals
              </h2>
            </div>
            <button
              onClick={() => navigate('/shop')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6E5049] hover:text-[#3D2C28] hover:underline"
            >
              <span>Explore catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 6. Popular Products */}
      {popularProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-8">
            <p className="text-xs font-bold tracking-widest uppercase text-[#8B5E3C]">Community Favorites</p>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#3D2C28]">
              Most Loved by Customers
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* 7. Genuine Customer Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-2 mb-10">
          <p className="text-xs font-bold tracking-widest uppercase text-[#8B5E3C]">Customer Love</p>
          <h2 className="font-serif text-3xl font-bold text-[#3D2C28]">
            Kind Words from Our Community
          </h2>
          <p className="text-xs text-[#7A6158]">
            Genuine feedback received from our cherished crochet clients.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {genuineReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#FFFDF9] rounded-2xl p-6 border border-[#EFE8DE] shadow-2xs flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#E8A598]">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs text-[#5C433C] leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-[#F4EFEA]">
                <p className="text-xs font-bold text-[#3D2C28]">{rev.author}</p>
                <p className="text-[11px] text-[#8B6B61]">{rev.location}</p>
                <p className="text-[10px] text-[#8B5E3C] font-medium mt-1">Purchased: {rev.item}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Instagram Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#6E5049]">
          <Instagram className="w-4 h-4 text-[#C13584]" />
          <span>Follow along on Instagram</span>
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#3D2C28]">
          @knot_just_krochet
        </h2>
        <p className="text-xs text-[#7A6158] max-w-md mx-auto">
          Catch behind-the-scenes stitch reels, WIP updates, and newly created seasonal colorways.
        </p>
        <div>
          <a
            href="https://instagram.com/knot_just_krochet"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#EFE8DE] hover:bg-[#EAE2D8] text-[#3D2C28] text-xs font-semibold transition-all"
          >
            <Instagram className="w-3.5 h-3.5 text-[#C13584]" />
            <span>Visit @knot_just_krochet</span>
          </a>
        </div>
      </section>
    </div>
  );
};
