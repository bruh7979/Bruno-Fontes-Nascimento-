import React, { useState, useEffect } from 'react';
import { ViewState, Product, CartItem, Banner, User, Order } from './types';
import { Hero } from './components/Hero';
import { ProductList } from './components/ProductList';
import { Admin } from './components/Admin';
import { Cart } from './components/Cart';
import { UserArea } from './components/UserArea';
import { ChatWidget } from './components/ChatWidget';
import { ShoppingBag, User as UserIcon, Settings, MessageCircle, Menu, X, Lock, ArrowLeft, LogIn } from 'lucide-react';

// MOCK DATA
const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Camisa Linho Branca',
    price: 189.90,
    category: 'Casual',
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=600',
    description: 'Elegância natural com nosso linho puro. Perfeita para dias de verão e ocasiões semi-formais.'
  },
  {
    id: '2',
    name: 'Camisa Oxford Azul',
    price: 249.00,
    category: 'Social',
    image: 'https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&q=80&w=600',
    description: 'Um clássico indispensável. Corte moderno, tecido respirável e acabamento impecável.'
  },
  {
    id: '3',
    name: 'Estampa Floral Dark',
    price: 159.90,
    category: 'Esporte',
    image: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&q=80&w=600',
    description: 'Personalidade forte para quem não tem medo de ousar. Algodão premium toque macio.'
  },
  {
    id: '4',
    name: 'Camisa Xadrez Flanela',
    price: 199.90,
    category: 'Inverno',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=600',
    description: 'Conforto térmico e estilo rústico chique. Ideal para sobreposições.'
  }
];

const INITIAL_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Nova Coleção Verão',
    subtitle: 'Tecidos leves e cortes modernos para a estação',
    image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&q=80&w=1600',
    active: true
  },
  {
    id: '2',
    title: 'Clássicos Essenciais',
    subtitle: 'A elegância nunca sai de moda',
    image: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1600',
    active: true
  }
];

function App() {
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Cart Actions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(0, item.quantity + delta) };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const clearCart = () => setCart([]);

  const handleCheckout = (method: 'PIX' | 'CREDIT_CARD', total: number) => {
    if (user) {
        const newOrder: Order = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            items: [...cart],
            total,
            status: 'Pago',
            paymentMethod: method
        };
        setOrders(prev => [newOrder, ...prev]);
    }
    // If no user, we assume guest checkout for this demo, no order history saved
  };

  // Admin Actions
  const addProduct = (p: Product) => setProducts(prev => [p, ...prev]);
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));
  const addBanner = (b: Banner) => setBanners(prev => [b, ...prev]);
  const deleteBanner = (id: string) => setBanners(prev => prev.filter(b => b.id !== id));

  // User Actions
  const login = () => setUser({
    id: 'u1',
    name: 'Cliente VIP',
    email: 'cliente@exemplo.com',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'
  });
  
  const handleAdminLogin = () => {
      if (user?.isAdmin) {
          setView(ViewState.ADMIN);
          return;
      }

      // Simulation of Google Login flow for Admin
      const confirmGoogleLogin = window.confirm("Deseja fazer login com sua conta Google para acessar o painel administrativo?");
      
      if (confirmGoogleLogin) {
          // Mock successful Google Login
          setUser({
              id: 'admin-google-id',
              name: 'Administrador da Loja',
              email: 'admin@vitrinestyle.com.br',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
              isAdmin: true
          });
          setView(ViewState.ADMIN);
      }
  };

  const logout = () => {
    setUser(null);
    setView(ViewState.HOME);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Admin Mode Warning Bar */}
      {view === ViewState.ADMIN && (
        <div 
          className="bg-black text-white text-center py-2 text-sm font-medium flex items-center justify-center gap-4 relative"
        >
            <span>Modo Edição Ativo</span>
            <button 
                onClick={() => setView(ViewState.HOME)}
                className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-xs flex items-center gap-1 transition-colors"
            >
                <ArrowLeft size={12} />
                Voltar para Loja
            </button>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {/* Mobile Menu Toggle */}
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden">
                {mobileMenuOpen ? <X /> : <Menu />}
             </button>
             <button onClick={() => setView(ViewState.HOME)} className="text-2xl font-serif font-bold tracking-tight">
                VITRINE<span className="text-gray-400">STYLE</span>
             </button>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <button onClick={() => setView(ViewState.HOME)} className={`hover:text-black transition-colors ${view === ViewState.HOME ? 'text-black' : 'text-gray-500'}`}>LOJA</button>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Admin Login Button - Top Right */}
            <button 
                onClick={handleAdminLogin}
                className={`hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded transition-colors ${view === ViewState.ADMIN ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                title="Acesso Restrito ao Lojista"
            >
                {user?.isAdmin ? (
                    <>
                        <Settings size={16} />
                        <span>Painel</span>
                    </>
                ) : (
                    <>
                        <Lock size={14} />
                        <span>Login Lojista</span>
                    </>
                )}
            </button>

            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            <button onClick={() => setView(ViewState.PROFILE)} className="relative group p-2 hover:bg-gray-100 rounded-full transition-colors">
               {user ? <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" /> : <UserIcon size={20} />}
            </button>
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
               <ShoppingBag size={20} />
               {cart.length > 0 && (
                   <span className="absolute top-0 right-0 w-4 h-4 bg-black text-white text-[10px] flex items-center justify-center rounded-full">
                       {cart.reduce((a, b) => a + b.quantity, 0)}
                   </span>
               )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white absolute w-full p-4 flex flex-col gap-4 shadow-lg">
                <button onClick={() => { setView(ViewState.HOME); setMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-gray-50">Loja</button>
                <button onClick={() => { setView(ViewState.PROFILE); setMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-gray-50">Minha Conta</button>
                <button onClick={() => { handleAdminLogin(); setMobileMenuOpen(false); }} className="text-left font-medium p-2 hover:bg-gray-50 flex items-center gap-2">
                    <Lock size={16} /> Login Lojista
                </button>
            </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-grow relative">
        {view === ViewState.HOME && (
          <>
            <Hero banners={banners} />
            <ProductList products={products} onAddToCart={addToCart} />
            <ChatWidget products={products} />
          </>
        )}
        
        {view === ViewState.ADMIN && (
          <Admin 
            products={products}
            banners={banners}
            onAddProduct={addProduct}
            onDeleteProduct={deleteProduct}
            onAddBanner={addBanner}
            onDeleteBanner={deleteBanner}
          />
        )}

        {view === ViewState.PROFILE && (
          <UserArea 
            user={user} 
            orders={orders}
            onLogin={login}
            onLogout={logout}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-brand-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
                <h4 className="font-serif text-xl font-bold mb-4">VITRINE STYLE</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Moda masculina redefinida. Peças exclusivas para quem busca elegância e conforto em qualquer ocasião.
                </p>
            </div>
            <div>
                <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Links Úteis</h4>
                <ul className="space-y-2 text-gray-400 text-sm">
                    <li><a href="#" className="hover:text-white">Sobre Nós</a></li>
                    <li><a href="#" className="hover:text-white">Política de Envio</a></li>
                    <li><a href="#" className="hover:text-white">Trocas e Devoluções</a></li>
                </ul>
            </div>
            <div>
                 <h4 className="font-bold mb-4 text-sm uppercase tracking-wider">Formas de Pagamento</h4>
                 <div className="flex gap-2 text-gray-400">
                    <span className="bg-gray-800 p-2 rounded text-xs">PIX</span>
                    <span className="bg-gray-800 p-2 rounded text-xs">VISA</span>
                    <span className="bg-gray-800 p-2 rounded text-xs">MASTERCARD</span>
                 </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-800 text-center flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
            <span>© 2024 Vitrine Style. Todos os direitos reservados.</span>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/5511999999999" 
        target="_blank" 
        rel="noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-30 transition-transform hover:scale-110 flex items-center justify-center"
      >
        <MessageCircle size={28} fill="white" className="text-green-500" />
      </a>

      {/* Cart Drawer */}
      <Cart 
        items={cart} 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onUpdateQuantity={updateQuantity}
        onClearCart={clearCart}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

export default App;