import React from 'react';
import { Product } from '../types';
import { ShoppingBag, Sparkles } from 'lucide-react';

interface ProductListProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export const ProductList: React.FC<ProductListProps> = ({ products, onAddToCart }) => {
  return (
    <section className="py-16 px-4 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <h3 className="text-3xl font-serif font-bold text-gray-900">
          Coleção Exclusiva
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-500">
            <Sparkles size={16} className="text-yellow-500"/>
            <span>Novidades da semana</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product.id} className="group relative bg-white flex flex-col h-full">
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
              
              <button
                onClick={() => onAddToCart(product)}
                className="absolute bottom-4 right-4 bg-white text-black p-3 rounded-full shadow-lg translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black hover:text-white"
                title="Adicionar ao carrinho"
              >
                <ShoppingBag size={20} />
              </button>
            </div>
            
            <div className="mt-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-2">
                <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</p>
                    <h4 className="text-lg font-medium text-gray-900 line-clamp-1 group-hover:underline decoration-1 underline-offset-4">
                    {product.name}
                    </h4>
                </div>
                <span className="text-lg font-bold text-gray-900 whitespace-nowrap">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1 mb-4 flex-grow">
                {product.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
