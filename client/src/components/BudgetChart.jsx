import React from 'react';
import { IndianRupee, PieChart, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

const CATEGORY_COLORS = {
  Accommodation: '#4f46e5',   // Indigo
  Transportation: '#0ea5e9',  // Sky blue
  Food: '#f59e0b',            // Amber
  Activities: '#10b981',      // Emerald
  Shopping: '#ec4899',        // Pink
  Miscellaneous: '#8b5cf6'    // Violet
};

export default function BudgetChart({ estimatedBudget = 0, expenses = [], categoryBreakdown = {} }) {
  const totalSpent = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const budget = parseFloat(estimatedBudget) || 0;
  const remaining = budget - totalSpent;
  const isOver = totalSpent > budget && budget > 0;
  const percentUsed = budget > 0 ? Math.min(100, Math.round((totalSpent / budget) * 100)) : 0;

  // Categories with non-zero amounts
  const categories = Object.entries(categoryBreakdown).map(([cat, amount]) => ({
    category: cat,
    amount: parseFloat(amount) || 0,
    color: CATEGORY_COLORS[cat] || '#64748b',
    percent: totalSpent > 0 ? Math.round(((parseFloat(amount) || 0) / totalSpent) * 100) : 0
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* 3 Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        
        {/* Estimated Budget */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Estimated Budget
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'Outfit' }}>
            ₹{budget.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Total Spent */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Total Logged Expenses
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isOver ? 'var(--danger)' : 'var(--primary)', fontFamily: 'Outfit' }}>
            ₹{totalSpent.toLocaleString('en-IN')}
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="card" style={{ padding: '1.25rem', background: isOver ? 'var(--danger-light)' : 'var(--success-light)' }}>
          <div style={{ fontSize: '0.8rem', color: isOver ? 'var(--danger)' : 'var(--success)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            {isOver ? 'Over Budget By' : 'Remaining Budget'}
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: isOver ? 'var(--danger)' : 'var(--success)', fontFamily: 'Outfit' }}>
            ₹{Math.abs(remaining).toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Main Budget Progress Gauge */}
      {budget > 0 && (
        <div className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Budget Consumption</span>
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: isOver ? 'var(--danger)' : 'var(--success)'
            }}>
              {isOver ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
              {percentUsed}% Used
            </span>
          </div>

          <div style={{ width: '100%', height: '12px', background: 'var(--bg-subtle)', borderRadius: '6px', overflow: 'hidden' }}>
            <div style={{
              width: `${Math.min(100, (totalSpent / budget) * 100)}%`,
              height: '100%',
              background: isOver ? 'var(--danger)' : 'linear-gradient(90deg, var(--primary) 0%, var(--secondary) 100%)',
              borderRadius: '6px',
              transition: 'width 0.5s ease'
            }} />
          </div>
        </div>
      )}

      {/* Category Breakdown Bar Chart */}
      {categories.length > 0 ? (
        <div className="card" style={{ padding: '1.5rem' }}>
          <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <PieChart size={18} color="var(--primary)" />
            Expenses by Category
          </h4>

          {/* Multi-segmented Segment Bar */}
          <div style={{
            display: 'flex',
            height: '22px',
            borderRadius: '11px',
            overflow: 'hidden',
            marginBottom: '1.5rem',
            background: 'var(--bg-subtle)'
          }}>
            {categories.map((cat, idx) => (
              <div
                key={idx}
                title={`${cat.category}: ₹${cat.amount.toLocaleString('en-IN')} (${cat.percent}%)`}
                style={{
                  width: `${cat.percent}%`,
                  height: '100%',
                  background: cat.color,
                  transition: 'width 0.4s ease'
                }}
              />
            ))}
          </div>

          {/* Category Rows */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
            {categories.map((cat, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-subtle)'
              }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {cat.category}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                    ₹{cat.amount.toLocaleString('en-IN')}{' '}
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>({cat.percent}%)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
          No expenses recorded yet. Use the "+ Add Expense" button to start tracking!
        </div>
      )}
    </div>
  );
}
