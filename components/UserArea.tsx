import React, { useState } from 'react';
import { User, Order } from '../types';
import { Package, LogOut, ShoppingBag } from 'lucide-react';

interface UserAreaProps {
  user: User | null;
  orders: Order[];
  onLogin: () => void;
  onLogout: () => void;
}

export const UserArea: React.FC<UserAreaProps> = ({ user, orders, onLogin, onLogout }) => {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-3xl font-serif font-bold mb-2">Bem-vindo</h2>
            <p className="text-gray-500 mb-8">Faça login para acompanhar seus pedidos e salvar favoritos.</p>
            
            <div className="space-y-3">
                <button 
                    onClick={onLogin}
                    className="w-full flex items-center justify-center gap-3 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                    Continuar com Google
                </button>
                <button 
                    onClick={onLogin}
                    className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.79-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Continuar com Facebook
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
            <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-gray-200" />
            <div>
                <h2 className="text-2xl font-serif font-bold">Olá, {user.name}</h2>
                <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
        </div>
        <button onClick={onLogout} className="text-red-500 flex items-center gap-2 hover:bg-red-50 px-4 py-2 rounded transition-colors">
            <LogOut size={18} /> Sair
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Package size={22} /> Meus Pedidos
        </h3>
        
        {orders.length === 0 ? (
             <div className="text-center py-10 text-gray-500">
                <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                <p>Você ainda não fez nenhum pedido.</p>
             </div>
        ) : (
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="font-bold">Pedido #{order.id.slice(0, 8)}</p>
                                <p className="text-sm text-gray-500">{new Date(order.date).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                                    order.status === 'Pago' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'Pendente' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                                }`}>
                                    {order.status}
                                </span>
                                <p className="font-bold mt-1">R$ {order.total.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {order.items.map((item, idx) => (
                                <div key={idx} className="flex-shrink-0 w-12 h-12 rounded bg-gray-100 overflow-hidden relative" title={`${item.quantity}x ${item.name}`}>
                                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                                    {item.quantity > 1 && (
                                        <div className="absolute bottom-0 right-0 bg-black text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-tl">
                                            {item.quantity}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};
