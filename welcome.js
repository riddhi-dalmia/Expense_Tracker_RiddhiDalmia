import React, { useState } from 'react';

const Dashboard = ({
  expenses,
  addExpense,
  deleteExpense,
  budget,
  setBudget,
  categories,
  getCategoryById,
  formatCurrency,
  getTotalExpenses,
  getExpensesByCategory,
  darkMode,
  toggleDarkMode,
  currency,
  currencies,
  changeCurrency,
  getCurrencySymbol,
  activePage,
  setActivePage,
  pages
}) => {
  // State for new expense form
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    categoryId: 1,
    date: new Date().toISOString().split('T')[0] // Initialize with today's date in YYYY-MM-DD format
  });

  // State for editing budget
  const [editingBudget, setEditingBudget] = useState(false);
  const [newBudget, setNewBudget] = useState(budget);
  
  // State for reports time period
  const [reportPeriod, setReportPeriod] = useState('month');

  // Handle input change for expense form
  const handleExpenseChange = (e) => {
    const { name, value } = e.target;
    setNewExpense(prev => ({
      ...prev,
      [name]: name === 'categoryId' ? parseInt(value) : value
    }));
  };

  // Handle submit for expense form
  const handleExpenseSubmit = (e) => {
    e.preventDefault();
    
    if (!newExpense.amount || !newExpense.description) {
      alert('Please fill in all fields');
      return;
    }
    
    // Create a date object from the selected date or use current date if not provided
    const expenseDate = newExpense.date 
      ? new Date(newExpense.date + 'T00:00:00') // Convert YYYY-MM-DD to Date object
      : new Date();
    
    addExpense({
      ...newExpense,
      amount: parseFloat(newExpense.amount),
      date: expenseDate.toISOString() // Store as ISO string to maintain consistent format
    });
    
    // Reset form
    setNewExpense({
      amount: '',
      description: '',
      categoryId: 1,
      date: new Date().toISOString().split('T')[0] // Reset to today's date
    });
  };

  // Handle budget update
  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    setBudget(parseFloat(newBudget));
    setEditingBudget(false);
  };

  // Calculate monthly stats
  const monthlyExpenses = getTotalExpenses('month');
  const remaining = budget - monthlyExpenses;
  const percentage = (monthlyExpenses / budget) * 100;
  
  // Get category breakdown
  const categoryExpenses = getExpensesByCategory('month');
  
  // Sort expenses by date (newest first)
  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  // Handle page navigation
  const handlePageChange = (pageId, e) => {
    e.preventDefault();
    setActivePage(pageId);
  };

  // Handle currency change
  const handleCurrencyChange = (e) => {
    changeCurrency(e.target.value);
  };
  
  // Handle report period change
  const handleReportPeriodChange = (e) => {
    setReportPeriod(e.target.value);
  };
  
  // Get report data based on selected period
  const getReportData = () => {
    return getExpensesByCategory(reportPeriod);
  };
  
  // Create pie chart colors array based on category colors
  const getPieChartStyles = (data) => {
    const total = data.reduce((sum, category) => sum + category.amount, 0);
    
    // Start with a cumulative angle of 0
    let cumulativePercent = 0;
    
    return data.map((category) => {
      const percentage = (category.amount / total) * 100;
      const startAngle = cumulativePercent * 3.6; // 3.6 degrees per percentage point (360/100)
      cumulativePercent += percentage;
      const endAngle = cumulativePercent * 3.6;
      
      return {
        category,
        percentage,
        startAngle,
        endAngle
      };
    });
  };

  // Render content based on active page
  const renderPageContent = () => {
    switch(activePage) {
      case 'dashboard':
        return renderDashboard();
      case 'reports':
        return renderReportsPage();
      default:
        return renderDashboard();
    }
  };
  
  // Helper function to calculate SVG arc path (for the reports page)
  const describeArc = (x, y, radius, startAngle, endAngle) => {
    // Convert angles from degrees to radians
    const start = (startAngle - 90) * Math.PI / 180;
    const end = (endAngle - 90) * Math.PI / 180;
    
    // Calculate the end point of the arc
    const startX = x + radius * Math.cos(start);
    const startY = y + radius * Math.sin(start);
    const endX = x + radius * Math.cos(end);
    const endY = y + radius * Math.sin(end);
    
    // Determine which direction to draw the arc
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    // Create the SVG arc path
    const path = [
      "M", startX, startY, 
      "A", radius, radius, 0, largeArcFlag, 1, endX, endY,
      "L", x, y,
      "Z"
    ].join(" ");
    
    return path;
  };
  
  // Reports page from the second dashboard file (kept the same as requested)
  const renderReportsPage = () => {
    const reportData = getReportData();
    const totalAmount = reportData.reduce((sum, category) => sum + category.amount, 0);
    const pieChartStyles = getPieChartStyles(reportData);
    
    return (
      <div className="reports-container">
        <div className="reports-header">
          <h2>📈 Expense Analysis</h2>
          <div className="reports-controls">
            <select 
              value={reportPeriod} 
              onChange={handleReportPeriodChange}
              className="period-select"
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
        
        <div className="reports-grid">
          {/* Pie Chart Widget - Made more compact */}
          <section className="widget pie-chart-widget">
            <div className="widget-header">
              <h2>Spending by Category</h2>
              <div className="total-expenses">
                Total: {formatCurrency(totalAmount)}
              </div>
            </div>
            
            {reportData.length === 0 ? (
              <div className="empty-state">
                <p>No expenses recorded for this period</p>
              </div>
            ) : (
              <div className="chart-container">
                <div className="pie-chart-layout">
                  {/* Made the pie chart smaller and more visually appealing */}
                  <div className="pie-chart-wrapper">
                    <svg width="180" height="180" viewBox="0 0 42 42">
                      {/* Drop shadow for depth */}
                      <filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="1" stdDeviation="1" floodOpacity="0.3" />
                      </filter>
                      
                      {/* Arc segments with hover effects */}
                      <g transform="translate(21, 21)">
                        {pieChartStyles.map((item, index) => {
                          // Convert degrees to radians for arc calculation
                          const startAngle = (item.startAngle - 90) * Math.PI / 180;
                          const endAngle = (item.endAngle - 90) * Math.PI / 180;
                          
                          // Calculate arc path
                          const radius = 15;
                          const x1 = radius * Math.cos(startAngle);
                          const y1 = radius * Math.sin(startAngle);
                          const x2 = radius * Math.cos(endAngle);
                          const y2 = radius * Math.sin(endAngle);
                          
                          const largeArcFlag = item.endAngle - item.startAngle <= 180 ? "0" : "1";
                          
                          const pathData = [
                            `M 0 0`,
                            `L ${x1} ${y1}`,
                            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                            `Z`
                          ].join(" ");
                          
                          return (
                            <path
                              key={item.category.id}
                              d={pathData}
                              fill={item.category.color}
                              stroke="white"
                              strokeWidth="0.5"
                              filter="url(#drop-shadow)"
                              className="pie-segment"
                              data-category={item.category.name}
                              data-amount={formatCurrency(item.category.amount)}
                              data-percentage={`${item.percentage.toFixed(1)}%`}
                            />
                          );
                        })}
                      </g>
                      
                      {/* Center circle with total */}
                      <circle cx="21" cy="21" r="10" fill="white" stroke="#e2e8f0" strokeWidth="0.5" filter="url(#drop-shadow)" />
                      <text x="21" y="19" textAnchor="middle" dominantBaseline="middle" fontSize="3.5" fontWeight="bold">Total</text>
                      <text x="21" y="23" textAnchor="middle" dominantBaseline="middle" fontSize="3" fill="#64748b">
                        {reportData.length} cats
                      </text>
                    </svg>
                  </div>
                  
                  {/* Enhanced color-coded legend */}
                  <div className="pie-chart-legend">
                    <div className="legend-header">
                      <span className="legend-title">Category</span>
                      <span className="legend-amount-header">Amount</span>
                      <span className="legend-percent-header">%</span>
                    </div>
                    
                    {reportData.map(category => (
                      <div key={category.id} className="legend-item">
                        <div className="legend-color-name">
                          <div className="legend-color" style={{ backgroundColor: category.color }}></div>
                          <span className="legend-name">
                            {category.icon} {category.name}
                          </span>
                        </div>
                        <span className="legend-amount">{formatCurrency(category.amount)}</span>
                        <div className="legend-percentage-wrapper">
                          <div 
                            className="legend-percentage-bar" 
                            style={{ 
                              width: `${(category.amount / totalAmount) * 100}%`,
                              backgroundColor: category.color 
                            }}
                          ></div>
                          <span className="legend-percentage">
                            {((category.amount / totalAmount) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  };

  // Render dashboard content from the third file (the previous dashboard)
  const renderDashboard = () => {
    return (
      <div className="dashboard-grid">
        {/* Budget Overview Section */}
        <section className="budget-overview widget">
          <div className="widget-header">
            <h2>
              Monthly Budget 
              <span className="currency-indicator">{getCurrencySymbol(currency)} {currency}</span>
            </h2>
            <button 
              onClick={() => setEditingBudget(!editingBudget)}
              className="edit-btn"
            >
              {editingBudget ? 'Cancel' : 'Edit'}
            </button>
          </div>
          
          {editingBudget ? (
            <form onSubmit={handleBudgetSubmit} className="budget-form">
              <input
                type="number"
                min="0"
                step="any"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="budget-input"
              />
              <button type="submit" className="save-btn">Save</button>
            </form>
          ) : (
            <>
              <div className="budget-stats">
                <div className="budget-stat">
                  <span className="stat-label">Budget</span>
                  <span className="stat-value">{formatCurrency(budget)}</span>
                </div>
                
                <div className="budget-stat">
                  <span className="stat-label">Spent</span>
                  <span className="stat-value">{formatCurrency(monthlyExpenses)}</span>
                </div>
                
                <div className="budget-stat">
                  <span className="stat-label">Remaining</span>
                  <span 
                    className="stat-value"
                    style={{ color: remaining < 0 ? 'var(--color-danger)' : 'var(--color-success)' }}
                  >
                    {formatCurrency(remaining)}
                  </span>
                </div>
              </div>
              
              <div className="budget-progress-container">
                <div 
                  className="budget-progress-bar" 
                  style={{ 
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: percentage > 90 
                      ? 'var(--color-danger)' 
                      : percentage > 75 
                        ? 'var(--color-warning)'
                        : 'var(--color-success)'
                  }}
                ></div>
              </div>
              
              <div className="budget-percentage">
                <span>{percentage.toFixed(1)}% used</span>
              </div>
            </>
          )}
        </section>
        
        {/* Expense Summary Section */}
        <section className="expense-summary widget">
          <h2 className="widget-header">Expense Summary</h2>
          
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">
                <span>📅</span>
              </div>
              <div className="summary-content">
                <span className="summary-label">Today</span>
                <span className="summary-value">{formatCurrency(getTotalExpenses('day'))}</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <span>📆</span>
              </div>
              <div className="summary-content">
                <span className="summary-label">This Week</span>
                <span className="summary-value">{formatCurrency(getTotalExpenses('week'))}</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <span>📋</span>
              </div>
              <div className="summary-content">
                <span className="summary-label">This Month</span>
                <span className="summary-value">{formatCurrency(getTotalExpenses('month'))}</span>
              </div>
            </div>
            
            <div className="summary-card">
              <div className="summary-icon">
                <span>📊</span>
              </div>
              <div className="summary-content">
                <span className="summary-label">All Time</span>
                <span className="summary-value">{formatCurrency(getTotalExpenses('all'))}</span>
              </div>
            </div>
          </div>
        </section>
        
        {/* Category Breakdown Section */}
        <section className="category-breakdown widget">
          <h2 className="widget-header">Spending by Category</h2>
          
          {categoryExpenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses recorded this month</p>
            </div>
          ) : (
            <div className="category-list">
              {categoryExpenses.map(cat => (
                <div key={cat.id} className="category-item">
                  <div className="category-icon-wrapper" style={{ backgroundColor: cat.color }}>
                    <span className="category-icon">{cat.icon}</span>
                  </div>
                  <div className="category-details">
                    <span className="category-name">{cat.name}</span>
                    <span className="category-amount">{formatCurrency(cat.amount)}</span>
                  </div>
                  <div className="category-percentage">
                    {((cat.amount / monthlyExpenses) * 100).toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Add New Expense Section */}
        <section className="add-expense widget">
          <h2 className="widget-header">Add New Expense</h2>
          
          <form onSubmit={handleExpenseSubmit} className="expense-form">
            <div className="form-group">
              <label htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={newExpense.amount}
                onChange={handleExpenseChange}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description</label>
              <input
                type="text"
                id="description"
                name="description"
                value={newExpense.description}
                onChange={handleExpenseChange}
                placeholder="What did you spend on?"
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="categoryId">Category</label>
              <select
                id="categoryId"
                name="categoryId"
                value={newExpense.categoryId}
                onChange={handleExpenseChange}
                className="form-select"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Add date field from the enhanced version */}
            <div className="form-group">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={newExpense.date}
                onChange={handleExpenseChange}
                className="form-input"
              />
            </div>
            
            <button type="submit" className="submit-btn">Add Expense</button>
          </form>
        </section>
        
        {/* Recent Transactions Section */}
        <section className="recent-transactions widget">
          <h2 className="widget-header">Recent Transactions</h2>
          
          {recentExpenses.length === 0 ? (
            <div className="empty-state">
              <p>No expenses recorded yet</p>
            </div>
          ) : (
            <div className="transaction-list">
              {recentExpenses.map(expense => {
                const category = getCategoryById(expense.categoryId);
                return (
                  <div key={expense.id} className="transaction-item">
                    <div className="transaction-icon-wrapper" style={{ backgroundColor: category.color }}>
                      <span className="transaction-icon">{category.icon}</span>
                    </div>
                    <div className="transaction-details">
                      <span className="transaction-description">{expense.description}</span>
                      <span className="transaction-meta">
                        {new Date(expense.date).toLocaleDateString()} • {category.name}
                      </span>
                    </div>
                    <div className="transaction-actions">
                      <span className="transaction-amount">{formatCurrency(expense.amount)}</span>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="delete-btn"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Student Information Banner - Updated with Resume and GitHub Links */}
      <div className="student-info-banner" style={{
        backgroundColor: darkMode ? '#1e1e1e' : '#e9ecef',
        color: darkMode ? '#fff' : '#212529',
        padding: '10px 20px',
        borderBottom: '1px solid',
        borderColor: darkMode ? '#333' : '#dee2e6',
        textAlign: 'center',
        fontWeight: 'bold',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>Name: Riddhi Dalmia</div>
        <div>Registration Number: 23BAI0121</div>
        <div>
          <a 
            href="https://drive.google.com/drive/folders/1ix8J5Fiq1CFjJiz0V6qJXheyOor75Axd?usp=sharing" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: darkMode ? '#4dabf7' : '#0d6efd',
              textDecoration: 'none'
            }}
          >
            📄 Resume
          </a>
        </div>
        <div>
          <a 
            href="https://github.com/riddhi-dalmia/Expense_Tracker_RiddhiDalmia.git" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              color: darkMode ? '#4dabf7' : '#0d6efd',
              textDecoration: 'none'
            }}
          >
            💻 GitHub
          </a>
        </div>
      </div>
      
      {/* Navigation Bar */}
      <nav className="app-nav">
        <div className="nav-brand">
          <h1>Budget Tracker</h1>
        </div>
        
        <ul className="nav-menu">
          {pages.map(page => (
            <li key={page.id} className={activePage === page.id ? 'active' : ''}>
              <a 
                href={`#${page.id}`}
                onClick={(e) => handlePageChange(page.id, e)}
              >
                {page.icon} {page.name}
              </a>
            </li>
          ))}
        </ul>
        
        <div className="nav-actions">
          <select 
            value={currency} 
            onChange={handleCurrencyChange}
            className="currency-select"
          >
            {currencies.map(curr => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code}
              </option>
            ))}
          </select>
          
          <button onClick={toggleDarkMode} className="mode-toggle">
            {darkMode ? '☀' : '🌙'}
          </button>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main className="app-content">
        {renderPageContent()}
      </main>
      
      {/* Footer */}
      <footer className="app-footer">
        <p>
          &copy; {new Date().getFullYear()} Budget Tracker App • 
          <a href="#" className="footer-link">Privacy Policy</a> • 
          <a href="#" className="footer-link">Terms of Service</a>
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;