import { useState, useEffect } from 'react';
import { SparePart, Machine } from '../types';
import { X } from 'lucide-react';

interface Props {
  type: 'parts' | 'machines';
  item: SparePart | Machine | null;
  onSave: (item: SparePart | Machine) => void;
  onClose: () => void;
}

export default function ItemModal({ type, item, onSave, onClose }: Props) {
  const [formData, setFormData] = useState({
    imageUrl: '',
    name: '',
    serialNumber: '',
    quantity: 0
  });

  useEffect(() => {
    if (item) {
      setFormData({
        imageUrl: item.imageUrl,
        name: 'partName' in item ? item.partName : item.machineName,
        serialNumber: item.serialNumber,
        quantity: item.quantity
      });
    }
  }, [item]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.serialNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const newItem = type === 'parts'
      ? {
          imageUrl: formData.imageUrl,
          partName: formData.name,
          serialNumber: formData.serialNumber,
          quantity: formData.quantity
        } as SparePart
      : {
          imageUrl: formData.imageUrl,
          machineName: formData.name,
          serialNumber: formData.serialNumber,
          quantity: formData.quantity
        } as Machine;

    onSave(newItem);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-green-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">
            {item ? 'Edit' : 'Add New'} {type === 'parts' ? 'Spare Part' : 'Machine'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {type === 'parts' ? 'Part Name' : 'Machine Name'} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder={type === 'parts' ? 'Enter part name' : 'Enter machine name'}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Serial Number *
            </label>
            <input
              type="text"
              value={formData.serialNumber}
              onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter serial number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="Enter quantity"
              min="0"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-green-600 hover:from-orange-600 hover:to-green-700 text-white font-semibold rounded-lg transition"
            >
              {item ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
