'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Modal from '@/components/Modal';
import { FaEdit, FaTrash } from 'react-icons/fa';
import useDebounce from '@/hooks/useDebounce';
import Select from 'react-select';

const tagOptions = [
  { value: 'FOOD', label: 'Food' },
  { value: 'TRAVEL', label: 'Travel' },
  { value: 'BILLS', label: 'Bills' },
  { value: 'ENTERTAINMENT', label: 'Entertainment' },
  { value: 'OTHER', label: 'Other' },
];

function FilterSummary({ filters, onClear }) {
  const hasFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value && value !== 'all';
  });

  if (!hasFilters) {
    return null;
  }

  return (
    <div className="bg-gray-100 p-4 rounded mb-4">
      <h3 className="text-lg font-semibold mb-2">Applied Filters</h3>
      <div className="flex flex-wrap gap-2 items-center">
        {filters.tags.length > 0 && (
          <div className="bg-gray-200 p-2 rounded">
            <strong>Tags:</strong> {filters.tags.map(t => t.label).join(', ')}
          </div>
        )}
        {filters.startDate && (
          <div className="bg-gray-200 p-2 rounded">
            <strong>Start Date:</strong> {filters.startDate}
          </div>
        )}
        {filters.endDate && (
          <div className="bg-gray-200 p-2 rounded">
            <strong>End Date:</strong> {filters.endDate}
          </div>
        )}
        {filters.minAmount && (
          <div className="bg-gray-200 p-2 rounded">
            <strong>Min Amount:</strong> {filters.minAmount}
          </div>
        )}
        {filters.maxAmount && (
          <div className="bg-gray-200 p-2 rounded">
            <strong>Max Amount:</strong> {filters.maxAmount}
          </div>
        )}
        {filters.isCredit !== 'all' && (
          <div className="bg-gray-200 p-2 rounded">
            <strong>Type:</strong> {filters.isCredit === 'true' ? 'Credit' : 'Debit'}
          </div>
        )}
        <button onClick={onClear} className="text-red-500 hover:underline">Clear All</button>
      </div>
    </div>
  );
}

export default function Home() {
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState('');
  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    amount: '',
    isCredit: false,
    tag: 'OTHER',
    date: new Date().toISOString().split('T')[0],
  });
  const [editingExpense, setEditingExpense] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('query') || '');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [modalFilters, setModalFilters] = useState({
    tags: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    isCredit: 'all',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    tags: [],
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: '',
    isCredit: 'all',
  });
  const [sortOption, setSortOption] = useState('date-desc');

  useEffect(() => {
    const tags = searchParams.get('tags');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const isCredit = searchParams.get('isCredit');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const filtersFromURL = {
      tags: tags ? tags.split(',').map(t => ({ value: t, label: t })) : [],
      startDate: startDate || '',
      endDate: endDate || '',
      minAmount: minAmount || '',
      maxAmount: maxAmount || '',
      isCredit: isCredit || 'all',
    };
    setAppliedFilters(filtersFromURL);
    setModalFilters(filtersFromURL);
    setSortOption(`${sortBy}-${sortOrder}`);
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (debouncedSearchTerm) {
      params.set('query', debouncedSearchTerm);
    } else {
      params.delete('query');
    }
    router.push(`?${params.toString()}`);
  }, [debouncedSearchTerm, router, searchParams]);

  useEffect(() => {
    const query = searchParams.get('query') || '';
    const tags = searchParams.get('tags');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const minAmount = searchParams.get('minAmount');
    const maxAmount = searchParams.get('maxAmount');
    const isCredit = searchParams.get('isCredit');
    const sortBy = searchParams.get('sortBy');
    const sortOrder = searchParams.get('sortOrder');

    let filterQuery = '';
    if (tags) filterQuery += `&tags=${tags}`;
    if (startDate) filterQuery += `&startDate=${startDate}`;
    if (endDate) filterQuery += `&endDate=${endDate}`;
    if (minAmount) filterQuery += `&minAmount=${minAmount}`;
    if (maxAmount) filterQuery += `&maxAmount=${maxAmount}`;
    if (isCredit) filterQuery += `&isCredit=${isCredit}`;
    if (sortBy) filterQuery += `&sortBy=${sortBy}`;
    if (sortOrder) filterQuery += `&sortOrder=${sortOrder}`;

    fetchExpenses(currentPage, query, filterQuery);
  }, [currentPage, searchParams]);

  const fetchExpenses = async (page, search = '', filters = '') => {
    try {
      const response = await fetch(`/api/expenses?page=${page}&pageSize=10&search=${search}${filters}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setExpenses(data.expenses);
        setPagination(data.pagination);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleInputChange = (e, isEditing = false) => {
    const { name, value, type, checked } = e.target;
    const inputValue = type === 'checkbox' ? checked : value;
    if (isEditing) {
      setEditingExpense({ ...editingExpense, [name]: inputValue });
    } else {
      setNewExpense({ ...newExpense, [name]: inputValue });
    }
  };

  const handleFilterChange = (name, value) => {
    setModalFilters({ ...modalFilters, [name]: value });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOption(value);
    const [sortBy, sortOrder] = value.split('-');
    const params = new URLSearchParams(searchParams);
    params.set('sortBy', sortBy);
    params.set('sortOrder', sortOrder);
    router.push(`?${params.toString()}`);
  };

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams);
    if (modalFilters.tags.length > 0) {
      params.set('tags', modalFilters.tags.map(t => t.value).join(','));
    } else {
      params.delete('tags');
    }
    if (modalFilters.startDate) {
      params.set('startDate', modalFilters.startDate);
    } else {
      params.delete('startDate');
    }
    if (modalFilters.endDate) {
      params.set('endDate', modalFilters.endDate);
    } else {
      params.delete('endDate');
    }
    if (modalFilters.minAmount) {
      params.set('minAmount', modalFilters.minAmount);
    } else {
      params.delete('minAmount');
    }
    if (modalFilters.maxAmount) {
      params.set('maxAmount', modalFilters.maxAmount);
    } else {
      params.delete('maxAmount');
    }
    if (modalFilters.isCredit !== 'all') {
      params.set('isCredit', modalFilters.isCredit);
    } else {
      params.delete('isCredit');
    }
    router.push(`?${params.toString()}`);
    setIsFilterModalOpen(false);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('tags');
    params.delete('startDate');
    params.delete('endDate');
    params.delete('minAmount');
    params.delete('maxAmount');
    params.delete('isCredit');
    router.push(`?${params.toString()}`);
  };

  const handleClearFiltersInModal = () => {
    clearFilters();
    setIsFilterModalOpen(false);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        fetchExpenses(currentPage, debouncedSearchTerm);
        setNewExpense({
          title: '',
          description: '',
          amount: '',
          isCredit: false,
          tag: 'OTHER',
          date: new Date().toISOString().split('T')[0],
        });
        setIsAddModalOpen(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/expenses/${editingExpense.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingExpense,
          amount: parseFloat(editingExpense.amount),
        }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        fetchExpenses(currentPage, debouncedSearchTerm);
        setEditingExpense(null);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        fetchExpenses(currentPage, debouncedSearchTerm);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      setError(error.message);
    }
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setIsEditModalOpen(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Expense Tracker</h1>
          <div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-4"
            >
              Add New Expense
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            >
              Logout
            </button>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">Add New Expense</h2>
          <form onSubmit={handleAddExpense} className="flex flex-col gap-4">
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={newExpense.title}
              onChange={handleInputChange}
              required
              className="p-2 border rounded"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newExpense.description}
              onChange={handleInputChange}
              className="p-2 border rounded"
            />
            <input
              type="number"
              name="amount"
              placeholder="Amount (INR)"
              value={newExpense.amount}
              onChange={handleInputChange}
              required
              className="p-2 border rounded"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isCredit"
                checked={newExpense.isCredit}
                onChange={handleInputChange}
                className="h-4 w-4"
              />
              <label>Is Credit (Income)</label>
            </div>
            <Select
              instanceId="add-expense-tags"
              name="tag"
              options={tagOptions}
              isMulti
              onChange={(selected) => handleInputChange({ target: { name: 'tag', value: selected } })}
              value={newExpense.tag}
            />
            <input
              type="date"
              name="date"
              value={newExpense.date}
              onChange={handleInputChange}
              required
              className="p-2 border rounded"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Add Expense
            </button>
          </form>
        </Modal>

        {editingExpense && (
          <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
            <h2 className="text-2xl font-bold mb-4">Edit Expense</h2>
            <form onSubmit={handleUpdateExpense} className="flex flex-col gap-4">
              <input
                type="text"
                name="title"
                value={editingExpense.title}
                onChange={(e) => handleInputChange(e, true)}
                required
                className="p-2 border rounded"
              />
              <textarea
                name="description"
                value={editingExpense.description}
                onChange={(e) => handleInputChange(e, true)}
                className="p-2 border rounded"
              />
              <input
                type="number"
                name="amount"
                value={editingExpense.amount}
                onChange={(e) => handleInputChange(e, true)}
                required
                className="p-2 border rounded"
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isCredit"
                  checked={editingExpense.isCredit}
                  onChange={(e) => handleInputChange(e, true)}
                  className="h-4 w-4"
                />
                <label>Is Credit (Income)</label>
              </div>
              <Select
                instanceId="edit-expense-tags"
                name="tag"
                options={tagOptions}
                isMulti
                onChange={(selected) => handleInputChange({ target: { name: 'tag', value: selected } }, true)}
                value={editingExpense.tag}
              />
              <input
                type="date"
                name="date"
                value={new Date(editingExpense.date).toISOString().split('T')[0]}
                onChange={(e) => handleInputChange(e, true)}
                required
                className="p-2 border rounded"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingExpense(null)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </Modal>
        )}

        <Modal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)}>
          <h2 className="text-2xl font-bold mb-4">Filters</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tags</label>
              <Select
                instanceId="tags-filter"
                isMulti
                options={tagOptions}
                value={modalFilters.tags}
                onChange={(selected) => handleFilterChange('tags', selected)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={modalFilters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="date"
                  value={modalFilters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Amount Range</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={modalFilters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  className="p-2 border rounded w-full"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={modalFilters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  className="p-2 border rounded w-full"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={modalFilters.isCredit}
                onChange={(e) => handleFilterChange('isCredit', e.target.value)}
                className="p-2 border rounded w-full"
              >
                <option value="all">All</option>
                <option value="true">Credit</option>
                <option value="false">Debit</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleClearFiltersInModal}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded mr-2"
            >
              Clear All
            </button>
            <button
              onClick={applyFilters}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Apply Filters
            </button>
          </div>
        </Modal>

        <div>
          <h2 className="text-2xl font-bold mb-4">Your Expenses</h2>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded"
              />
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Filters
              </button>
              <select
                value={sortOption}
                onChange={handleSortChange}
                className="p-2 border rounded"
              >
                <option value="date-desc">By latest</option>
                <option value="date-asc">By oldest</option>
                <option value="amount-desc">By largest amount</option>
                <option value="amount-asc">By smallest amount</option>
              </select>
            </div>
          </div>
          <FilterSummary filters={appliedFilters} onClear={clearFilters} />
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm">#</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Title</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Description</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Amount</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Tag</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Date</th>
                  <th className="text-left py-3 px-4 uppercase font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {expenses.map((expense, index) => (
                  <tr key={expense.id} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                    <td className="text-left py-3 px-4">{(pagination.page - 1) * pagination.pageSize + index + 1}</td>
                    <td className="text-left py-3 px-4">{expense.title}</td>
                    <td className="text-left py-3 px-4">{expense.description}</td>
                    <td className={`text-left py-3 px-4 ${expense.isCredit ? 'text-green-500' : 'text-red-500'}`}>
                      {expense.isCredit ? '+' : '-'}₹{expense.amount}
                    </td>
                    <td className="text-left py-3 px-4">{expense.tag}</td>
                    <td className="text-left py-3 px-4">{new Date(expense.date).toLocaleDateString()}</td>
                    <td className="text-left py-3 px-4 flex items-center">
                      <button
                        onClick={() => openEditModal(expense)}
                        className="text-gray-600 hover:text-gray-900 mr-2"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination && (
            <div className="flex justify-between items-center mt-8">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
              >
                Previous
              </button>
              <span>
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-400"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
