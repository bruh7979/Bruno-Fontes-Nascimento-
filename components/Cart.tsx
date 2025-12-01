import React, { useState } from 'react';
import { CartItem } from '../types';
import { X, Minus, Plus, CreditCard, QrCode, CheckCircle, Smartphone } from 'lucide-react';

interface CartProps {
  items: CartItem[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearCart: () => void;
  onCheckout: (method: 'PIX' | 'CREDIT_CARD', total: number) => void;
}

export const Cart: React.FC<CartProps> = ({ 
  items, 
  isOpen, 
  onClose, 
  onUpdateQuantity,
  onCheckout,
  onClearCart 
}) => {
  const [step, setStep] = useState<'cart' | 'payment' | 'success'>('cart');
  const [selectedMethod, setSelectedMethod] = useState<'PIX' | 'CREDIT_CARD'>('PIX');

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = () => {
    onCheckout(selectedMethod, total);
    setStep('success');
  };

  const handleClose = () => {
    setStep('cart');
    onClose();
    if(step === 'success') onClearCart();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleClose}></div>

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="text-xl font-serif font-bold">
            {step === 'cart' ? 'Seu Carrinho' : step === 'payment' ? 'Pagamento' : 'Sucesso'}
          </h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {step === 'cart' && (
            <>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <ShoppingBagIcon size={48} className="mb-4 opacity-20" />
                  <p>Seu carrinho está vazio.</p>
                  <button onClick={handleClose} className="mt-4 text-black underline underline-offset-4">Continuar comprando</button>
                </div>
              ) : (
                <div className="space-y-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <img src={item.image} alt={item.name} className="w-20 h-24 object-cover rounded bg-gray-50" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-gray-500 text-sm mb-2">R$ {item.price.toFixed(2)}</p>
                        <div className="flex items-center gap-3">
                          <button onClick={() => onUpdateQuantity(item.id, -1)} className="p-1 border rounded hover:bg-gray-50">
                            <Minus size={14} />
                          </button>
                          <span className="text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => onUpdateQuantity(item.id, 1)} className="p-1 border rounded hover:bg-gray-50">
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'payment' && (
            <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Total a pagar</p>
                    <p className="text-3xl font-bold">R$ {total.toFixed(2)}</p>
                </div>

                <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'PIX' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <input type="radio" name="payment" checked={selectedMethod === 'PIX'} onChange={() => setSelectedMethod('PIX')} className="hidden" />
                        <div className="p-2 bg-white rounded shadow-sm text-green-600"><QrCode /></div>
                        <div>
                            <p className="font-medium">PIX</p>
                            <p className="text-xs text-gray-500">Aprovação imediata</p>
                        </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === 'CREDIT_CARD' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <input type="radio" name="payment" checked={selectedMethod === 'CREDIT_CARD'} onChange={() => setSelectedMethod('CREDIT_CARD')} className="hidden" />
                        <div className="p-2 bg-white rounded shadow-sm text-blue-600"><CreditCard /></div>
                        <div>
                            <p className="font-medium">Cartão de Crédito</p>
                            <p className="text-xs text-gray-500">Em até 12x</p>
                        </div>
                    </label>
                </div>
            </div>
          )}

          {step === 'success' && (
            <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-2">Pedido Confirmado!</h3>
                <p className="text-gray-500 mb-8 max-w-xs">
                    Obrigado pela sua compra. Você receberá os detalhes no seu email e WhatsApp.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg w-full mb-8">
                    <p className="text-xs text-gray-400 uppercase">Código do Pedido</p>
                    <p className="font-mono font-medium">#{Math.floor(Math.random() * 1000000)}</p>
                </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t bg-white">
          {step === 'cart' && items.length > 0 && (
            <div className="space-y-4">
                <div className="flex justify-between font-medium text-lg">
                    <span>Subtotal</span>
                    <span>R$ {total.toFixed(2)}</span>
                </div>
                <button 
                    onClick={() => setStep('payment')}
                    className="w-full bg-black text-white py-4 rounded-none font-bold tracking-widest hover:bg-gray-800 transition-colors"
                >
                    FINALIZAR COMPRA
                </button>
            </div>
          )}

          {step === 'payment' && (
            <button 
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white py-4 rounded font-bold tracking-widest hover:bg-green-700 transition-colors"
            >
                PAGAR AGORA
            </button>
          )}

          {step === 'success' && (
             <button 
                onClick={handleClose}
                className="w-full bg-black text-white py-4 rounded font-bold tracking-widest hover:bg-gray-800 transition-colors"
            >
                VOLTAR À LOJA
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Icon for empty state
const ShoppingBagIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <path d="M16 10a4 4 0 0 1-8 0"></path>
    </svg>
);
