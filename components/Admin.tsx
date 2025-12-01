import React, { useState } from 'react';
import { Product, Banner } from '../types';
import { Upload, Trash2, Plus, Sparkles, Loader2, Share2, Check } from 'lucide-react';
import { generateProductDescription, suggestPrice } from '../services/geminiService';

interface AdminProps {
  products: Product[];
  banners: Banner[];
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddBanner: (banner: Banner) => void;
  onDeleteBanner: (id: string) => void;
}

export const Admin: React.FC<AdminProps> = ({
  products,
  banners,
  onAddProduct,
  onDeleteProduct,
  onAddBanner,
  onDeleteBanner,
}) => {
  const [activeTab, setActiveTab] = useState<'products' | 'banners'>('products');
  const [linkCopied, setLinkCopied] = useState(false);
  
  // Product Form State
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    price: 0,
    category: 'Casual',
    description: '',
    image: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Banner Form State
  const [newBanner, setNewBanner] = useState<Partial<Banner>>({
    title: '',
    subtitle: '',
    image: '',
    active: true,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'banner') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'product') {
          setNewProduct({ ...newProduct, image: reader.result as string });
        } else {
          setNewBanner({ ...newBanner, image: reader.result as string });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateAI = async () => {
    if (!newProduct.image && !newProduct.name) {
      alert("Por favor, faça upload de uma imagem ou digite um nome para usar a IA.");
      return;
    }

    setIsGenerating(true);
    try {
      // Parallel execution for description and price suggestion
      const nameForPrompt = newProduct.name || "Camisa Estilosa";
      
      const [desc, priceStr] = await Promise.all([
        generateProductDescription(nameForPrompt, newProduct.image || null),
        suggestPrice(nameForPrompt)
      ]);

      setNewProduct(prev => ({
        ...prev,
        description: desc,
        price: priceStr ? parseFloat(priceStr) : prev.price
      }));
    } catch (error) {
      console.error(error);
      alert("Erro ao consultar o Gemini.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareSite = () => {
    const url = window.location.origin;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 3000);
  };

  const submitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.image) {
        alert("Preencha os campos obrigatórios.");
        return;
    }
    onAddProduct({
      id: Date.now().toString(),
      name: newProduct.name!,
      price: Number(newProduct.price),
      image: newProduct.image!,
      description: newProduct.description || '',
      category: newProduct.category || 'Geral',
    } as Product);
    setNewProduct({ name: '', price: 0, category: 'Casual', description: '', image: '' });
  };

  const submitBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBanner.title || !newBanner.image) return;
    onAddBanner({
      id: Date.now().toString(),
      title: newBanner.title!,
      subtitle: newBanner.subtitle || '',
      image: newBanner.image!,
      active: true,
    } as Banner);
    setNewBanner({ title: '', subtitle: '', image: '', active: true });
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h2 className="text-3xl font-serif font-bold text-gray-800">Painel Administrativo</h2>
        
        {/* Share Button */}
        <div className="bg-gray-100 p-2 rounded-lg flex items-center gap-2">
            <span className="text-sm font-medium px-2 text-gray-600">Compartilhar Site:</span>
            <button 
                onClick={handleShareSite}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${linkCopied ? 'bg-green-500 text-white' : 'bg-black text-white hover:bg-gray-800'}`}
            >
                {linkCopied ? <Check size={16} /> : <Share2 size={16} />}
                {linkCopied ? 'Link Copiado!' : 'Copiar Link da Loja'}
            </button>
        </div>
      </div>
      
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'products' ? 'border-b-2 border-black text-black' : 'text-gray-500'
          }`}
        >
          Produtos
        </button>
        <button
          onClick={() => setActiveTab('banners')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'banners' ? 'border-b-2 border-black text-black' : 'text-gray-500'
          }`}
        >
          Banners Promocionais
        </button>
      </div>

      {activeTab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Product Form */}
          <div className="bg-white p-6 rounded-lg shadow-md h-fit border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus size={20} /> Novo Produto
            </h3>
            <form onSubmit={submitProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem da Camisa</label>
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 hover:bg-gray-50 transition-colors text-center cursor-pointer">
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => handleImageUpload(e, 'product')} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {newProduct.image ? (
                        <img src={newProduct.image} alt="Preview" className="h-40 mx-auto object-contain" />
                    ) : (
                        <div className="text-gray-400 flex flex-col items-center">
                            <Upload size={24} />
                            <span className="text-xs mt-2">Clique para upload</span>
                        </div>
                    )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                  placeholder="Ex: Camisa Linho Premium"
                />
              </div>

              {/* AI Trigger */}
              <button
                type="button"
                onClick={handleGenerateAI}
                disabled={isGenerating || (!newProduct.image && !newProduct.name)}
                className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                Preencher com IA Gemini
              </button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
                    <input
                    type="number"
                    step="0.01"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                    className="w-full p-2 border rounded outline-none"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                    <select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                        className="w-full p-2 border rounded outline-none"
                    >
                        <option value="Casual">Casual</option>
                        <option value="Social">Social</option>
                        <option value="Esporte">Esporte</option>
                        <option value="Luxo">Luxo</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full p-2 border rounded outline-none h-24 resize-none text-sm"
                  placeholder="Descrição detalhada..."
                />
              </div>

              <button type="submit" className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 font-medium">
                Adicionar Produto
              </button>
            </form>
          </div>

          {/* Product List */}
          <div className="lg:col-span-2 space-y-4">
             <h3 className="text-lg font-bold text-gray-700">Produtos Cadastrados ({products.length})</h3>
             <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                        <tr>
                            <th className="p-4">Produto</th>
                            <th className="p-4">Preço</th>
                            <th className="p-4">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                        {products.map(p => (
                            <tr key={p.id}>
                                <td className="p-4 flex items-center gap-3">
                                    <img src={p.image} alt="" className="w-10 h-10 rounded object-cover" />
                                    <div>
                                        <p className="font-medium">{p.name}</p>
                                        <p className="text-gray-400 text-xs">{p.category}</p>
                                    </div>
                                </td>
                                <td className="p-4">R$ {p.price.toFixed(2)}</td>
                                <td className="p-4">
                                    <button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:text-red-700">
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {products.length === 0 && (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-500">Nenhum produto cadastrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md h-fit border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Plus size={20} /> Novo Banner
                </h3>
                <form onSubmit={submitBanner} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Imagem do Banner (Landscape)</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => handleImageUpload(e, 'banner')}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {newBanner.image && <img src={newBanner.image} className="mt-2 w-full h-32 object-cover rounded" alt="Preview" />}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Título Principal</label>
                        <input
                        type="text"
                        value={newBanner.title}
                        onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                        className="w-full p-2 border rounded outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtítulo</label>
                        <input
                        type="text"
                        value={newBanner.subtitle}
                        onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                        className="w-full p-2 border rounded outline-none"
                        />
                    </div>
                    <button type="submit" className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 font-medium">
                        Adicionar Banner
                    </button>
                </form>
            </div>
            
            <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-bold text-gray-700">Banners Ativos</h3>
                <div className="grid grid-cols-1 gap-4">
                    {banners.map(b => (
                        <div key={b.id} className="relative group overflow-hidden rounded-lg h-40 bg-gray-100">
                             <img src={b.image} alt={b.title} className="w-full h-full object-cover opacity-80" />
                             <div className="absolute inset-0 flex flex-col justify-center items-start p-6 bg-gradient-to-r from-black/50 to-transparent text-white">
                                <h4 className="text-2xl font-bold">{b.title}</h4>
                                <p className="text-sm">{b.subtitle}</p>
                             </div>
                             <button 
                                onClick={() => onDeleteBanner(b.id)}
                                className="absolute top-2 right-2 bg-white/20 p-2 rounded-full backdrop-blur-md hover:bg-red-500 hover:text-white transition-colors"
                             >
                                <Trash2 size={16} />
                             </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}
    </div>
  );
};