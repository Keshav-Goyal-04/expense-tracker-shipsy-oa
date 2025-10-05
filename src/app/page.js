'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        setExpenses(data.expenses);
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
        fetchExpenses();
        setNewExpense({
          title: '',
          description: '',
          amount: '',
          isCredit: false,
          tag: 'OTHER',
          date: new Date().toISOString().split('T')[0],
        });
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
        fetchExpenses();
        setEditingExpense(null);
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
        fetchExpenses();
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

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Expense Tracker</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            Logout
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Add New Expense</h2>
          <form onSubmit={handleAddExpense} className="flex flex-col gap-4 bg-gray-100 p-4 rounded">
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
            <select
              name="tag"
              value={newExpense.tag}
              onChange={handleInputChange}
              required
              className="p-2 border rounded"
            >
              <option value="FOOD">Food</option>
              <option value="TRAVEL">Travel</option>
              <option value="BILLS">Bills</option>
              <option value="ENTERTAINMENT">Entertainment</option>
              <option value="OTHER">Other</option>
            </select>
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
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Your Expenses</h2>
          <div className="flex flex-col gap-4">
            {expenses.map((expense) => (
              <div key={expense.id} className="bg-gray-100 p-4 rounded">
                {editingExpense?.id === expense.id ? (
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
                    <select
                      name="tag"
                      value={editingExpense.tag}
                      onChange={(e) => handleInputChange(e, true)}
                      required
                      className="p-2 border rounded"
                    >
                      <option value="FOOD">Food</option>
                      <option value="TRAVEL">Travel</option>
                      <option value="BILLS">Bills</option>
                      <option value="ENTERTAINMENT">Entertainment</option>
                      <option value="OTHER">Other</option>
                    </select>
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
                ) : (
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">{expense.title}</h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingExpense(expense)}
                          className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-1 px-2 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600">{expense.description}</p>
                    <p className={`text-lg font-semibold mt-2 ${expense.isCredit ? 'text-green-500' : 'text-red-500'}`}>
                      {expense.isCredit ? '+' : '-'}₹{expense.amount}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">{expense.tag}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}