import React, { useState, useEffect } from 'react';
import Dashboard from './welcome.js'; // Make sure this path is correct
import './style.css';
import './App.css';

function App() {
  // State for expenses
  const [expenses, setExpenses] = useState(() => {
    const savedExpenses = localStorage.getItem('expenses');
    return savedExpenses ? JSON.parse(savedExpenses) : [];
  });

  // State for budget
  const [budget, setBudget] = useState(() => {
    const savedBudget = localStorage.getItem('budget');
    return savedBudget ? parseFloat(savedBudget) : 2000;
  });

  // State for dark mode
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  // State for currency
  const [currency, setCurrency] = useState(() => {
    const savedCurrency = localStorage.getItem('currency');
    return savedCurrency || 'USD';
  });

  // State for active page
  const [activePage, setActivePage] = useState('dashboard');

  // Available currencies
  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' }
  ];

  // Categories for expenses
  const categories = [
    { id: 1, name: 'Food', color: '#FF6B6B', icon: '🍔' },
    { id: 2, name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
    { id: 3, name: 'Entertainment', color: '#FFD166', icon: '🎬' },
    { id: 4, name: 'Shopping', color: '#F78FB3', icon: '🛍' },
    { id: 5, name: 'Utilities', color: '#6A0572', icon: '💡' },
    { id: 6, name: 'Health', color: '#1A936F', icon: '🏥' },
    { id: 7, name: 'Education', color: '#3A86FF', icon: '📚' },
    { id: 8, name: 'Other', color: '#8D99AE', icon: '📝' }
  ];

  // Page navigation options - Removed expenses and settings
  const pages = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊' },
    { id: 'reports', name: 'Reports', icon: '📈' }
  ];

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('budget', budget.toString());
    localStorage.setItem('darkMode', darkMode.toString());
    localStorage.setItem('currency', currency);
    
    // Apply dark mode to body
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [expenses, budget, darkMode, currency]);

  // Add expense
  const addExpense = (expense) => {
    const newExpense = {
      ...expense,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  };

  // Delete expense
  const deleteExpense = (id) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  // Get currency symbol
  const getCurrencySymbol = (code) => {
    const curr = currencies.find(c => c.code === code);
    return curr ? curr.symbol : '$';
  };

  // Get category by id
  const getCategoryById = (id) => {
    return categories.find(category => category.id === id) || categories[7]; // Default to 'Other'
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  // Change currency
  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
  };

  // Get total expenses for a time period
  const getTotalExpenses = (period = 'all') => {
    let filtered = expenses;
    
    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = expenses.filter(expense => new Date(expense.date) >= startOfMonth);
    } else if (period === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      filtered = expenses.filter(expense => new Date(expense.date) >= startOfWeek);
    } else if (period === 'day') {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      filtered = expenses.filter(expense => new Date(expense.date) >= startOfDay);
    }
    
    return filtered.reduce((total, expense) => total + parseFloat(expense.amount), 0);
  };

  // Get expenses grouped by category
  const getExpensesByCategory = (period = 'month') => {
    let filtered = expenses;
    
    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = expenses.filter(expense => new Date(expense.date) >= startOfMonth);
    } else if (period === 'week') {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      filtered = expenses.filter(expense => new Date(expense.date) >= startOfWeek);
    } else if (period === 'all') {
      filtered = expenses;
    }
    
    const categoryTotals = {};
    
    categories.forEach(category => {
      categoryTotals[category.id] = {
        id: category.id,
        name: category.name,
        color: category.color,
        icon: category.icon,
        amount: 0
      };
    });
    
    filtered.forEach(expense => {
      if (categoryTotals[expense.categoryId]) {
        categoryTotals[expense.categoryId].amount += parseFloat(expense.amount);
      } else {
        categoryTotals[8].amount += parseFloat(expense.amount); // Add to 'Other' if category not found
      }
    });
    
    return Object.values(categoryTotals).filter(cat => cat.amount > 0);
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      <Dashboard 
        expenses={expenses}
        addExpense={addExpense}
        deleteExpense={deleteExpense}
        budget={budget}
        setBudget={setBudget}
        categories={categories}
        getCategoryById={getCategoryById}
        formatCurrency={formatCurrency}
        getTotalExpenses={getTotalExpenses}
        getExpensesByCategory={getExpensesByCategory}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        currency={currency}
        currencies={currencies}
        changeCurrency={changeCurrency}
        getCurrencySymbol={getCurrencySymbol}
        activePage={activePage}
        setActivePage={setActivePage}
        pages={pages}
      />
    </div>
  );
}

export default App;