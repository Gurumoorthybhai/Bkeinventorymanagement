import { useState, useEffect } from 'react';
import { SparePart, Machine } from '../types';
import { supabase } from '../lib/supabase';
import { Plus, Edit2, Trash2, AlertCircle, Package } from 'lucide-react';
import ItemModal from './ItemModal';

interface Props {
  type: 'parts' | 'machines';
  isAdmin: boolean;
}

export default function InventoryManager({ type, isAdmin }: Props) {
  const [items, setItems] = useState<(SparePart | Machine)[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SparePart | Machine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItems();

    const tableName = type === 'parts' ? 'spare_parts' : 'machines';
    const subscription = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: tableName },
        () => {
          loadItems();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [type]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const tableName = type === 'parts' ? 'spare_parts' : 'machines';
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedData = data.map(item => {
        if (type === 'parts') {
          return {
            id: item.id,
            imageUrl: item.image_url,
            partName: item.part_name,
            serialNumber: item.serial_number,
            quantity: item.quantity,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          } as SparePart;
        } else {
          return {
            id: item.id,
            imageUrl: item.image_url,
            machineName: item.machine_name,
            serialNumber: item.serial_number,
            quantity: item.quantity,
            createdAt: item.created_at,
            updatedAt: item.updated_at
          } as Machine;
        }
      });

      setItems(mappedData);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: SparePart | Machine) => {
    try {
      const tableName = type === 'parts' ? 'spare_parts' : 'machines';

      if (editingItem) {
        const updateData = type === 'parts'
          ? {
              image_url: item.imageUrl,
              part_name: (item as SparePart).partName,
              serial_number: item.serialNumber,
              quantity: item.quantity,
              updated_at: new Date().toISOString()
            }
          : {
              image_url: item.imageUrl,
              machine_name: (item as Machine).machineName,
              serial_number: item.serialNumber,
              quantity: item.quantity,
              updated_at: new Date().toISOString()
            };

        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        const insertData = type === 'parts'
          ? {
              image_url: item.imageUrl,
              part_name: (item as SparePart).partName,
              serial_number: item.serialNumber,
              quantity: item.quantity
            }
          : {
              image_url: item.imageUrl,
              machine_name: (item as Machine).machineName,
              serial_number: item.serialNumber,
              quantity: item.quantity
            };

        const { error } = await supabase
          .from(tableName)
          .insert([insertData]);

        if (error) throw error;
      }

      setIsModalOpen(false);
      setEditingItem(null);
      await loadItems();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Error saving item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const tableName = type === 'parts' ? 'spare_parts' : 'machines';
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadItems();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item. Please try again.');
    }
  };

  const handleEdit = (item: SparePart | Machine) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const lowStockItems = items.filter(item => item.quantity < 3);

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="inline-block w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 mt-4">Loading inventory...</p>
      </div>
    );
  }

  return (
    <div>
      {lowStockItems.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Low Stock Alert</h3>
          </div>
          <p className="text-sm text-red-700">
            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} running low on stock
          </p>
        </div>
      )}

      {isAdmin && (
        <button
          onClick={handleAdd}
          className="mb-6 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-lg transition transform hover:scale-105 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add New {type === 'parts' ? 'Spare Part' : 'Machine'}
        </button>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No items found</p>
          {isAdmin && (
            <p className="text-gray-400 text-sm mt-2">Click the button above to add your first item</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const isLowStock = item.quantity < 3;
            const name = 'partName' in item ? item.partName : item.machineName;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition ${
                  isLowStock ? 'ring-2 ring-red-500' : ''
                }`}
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center overflow-hidden">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-gray-300" />
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Serial:</span> {item.serialNumber}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-sm font-semibold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                      Quantity: {item.quantity}
                    </p>
                    {isLowStock && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded">
                        Out of Stock
                      </span>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded transition"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <ItemModal
          type={type}
          item={editingItem}
          onSave={handleSave}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
