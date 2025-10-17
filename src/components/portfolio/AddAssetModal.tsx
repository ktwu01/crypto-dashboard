import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import { CryptoCurrency } from '@/services/cryptoApi';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAsset: (asset: {
    id: string;
    symbol: string;
    name: string;
    amount: number;
    purchasePrice: number;
    image?: string;
  }) => void;
  selectedCrypto?: CryptoCurrency;
}

const AddAssetModal: React.FC<AddAssetModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddAsset, 
  selectedCrypto 
}) => {
  const [amount, setAmount] = useState('');
  const [purchasePrice, setPurchasePrice] = useState(selectedCrypto?.current_price?.toString() || '');
  const [customName, setCustomName] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCrypto && (!customName || !customSymbol)) {
      alert('Please provide crypto name and symbol');
      return;
    }
    
    if (!amount || !purchasePrice) {
      alert('Please fill in all required fields');
      return;
    }

    const assetData = {
      id: selectedCrypto?.id || customSymbol.toLowerCase(),
      symbol: selectedCrypto?.symbol || customSymbol.toLowerCase(),
      name: selectedCrypto?.name || customName,
      amount: parseFloat(amount),
      purchasePrice: parseFloat(purchasePrice),
      image: selectedCrypto?.image,
    };

    onAddAsset(assetData);
    setAmount('');
    setPurchasePrice('');
    setCustomName('');
    setCustomSymbol('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-md mx-4"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              {selectedCrypto ? `Add ${selectedCrypto.name}` : 'Add Custom Asset'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {selectedCrypto && (
            <div className="flex items-center space-x-3 mb-6 p-3 rounded-lg bg-white/5">
              <img 
                src={selectedCrypto.image} 
                alt={selectedCrypto.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-white font-medium">{selectedCrypto.name}</p>
                <p className="text-white/60 text-sm uppercase">{selectedCrypto.symbol}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!selectedCrypto && (
              <>
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Crypto Name *
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                    placeholder="e.g., Bitcoin"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Symbol *
                  </label>
                  <input
                    type="text"
                    value={customSymbol}
                    onChange={(e) => setCustomSymbol(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                    placeholder="e.g., BTC"
                    required
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Amount *
              </label>
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                placeholder="0.00000000"
                required
              />
            </div>
            
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Purchase Price (USD) *
              </label>
              <input
                type="number"
                step="any"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-primary-500"
                placeholder="0.00"
                required
              />
            </div>
            
            {amount && purchasePrice && (
              <div className="p-3 rounded-lg bg-primary-500/10 border border-primary-500/20">
                <p className="text-white/80 text-sm">
                  Total Cost: <span className="text-primary-400 font-medium">
                    ${(parseFloat(amount) * parseFloat(purchasePrice)).toFixed(2)}
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-white/20 text-white/80 rounded-lg hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Asset</span>
              </button>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default AddAssetModal;