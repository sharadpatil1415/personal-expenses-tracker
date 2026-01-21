import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import {
    IndianRupee,
    TrendingUp,
    ShoppingCart,
    CreditCard,
    Lightbulb,
    AlertCircle
} from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [summary, setSummary] = useState(null);
    const [expenses, setExpenses] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [summaryRes, expensesRes] = await Promise.all([
                expenseAPI.getSummary(),
                expenseAPI.getAll()
            ]);
            setSummary(summaryRes.data.data);
            setExpenses(expensesRes.data.data || []);
        } catch (err) {
            setError('Failed to load dashboard data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate stats
    const totalExpenses = summary?.totalSpending || 0;
    const expenseCount = summary?.expenseCount || expenses.length;
    const categoryBreakdown = summary?.categoryBreakdown || {};
    const monthlyTrend = summary?.monthlyTrend || [];

    // Get top category
    const topCategory = Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])[0];

    // Chart colors
    const chartColors = [
        '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
        '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6',
        '#06b6d4', '#3b82f6'
    ];

    // Pie chart data
    const pieData = {
        labels: Object.keys(categoryBreakdown),
        datasets: [{
            data: Object.values(categoryBreakdown),
            backgroundColor: chartColors,
            borderWidth: 0,
        }]
    };

    // Bar chart data
    const barData = {
        labels: monthlyTrend.slice(-6).map(m => {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return months[(m.month || 1) - 1];
        }),
        datasets: [{
            label: 'Monthly Spending',
            data: monthlyTrend.slice(-6).map(m => m.amount || 0),
            backgroundColor: '#6366f1',
            borderRadius: 8,
        }]
    };

    // Generate insights
    const insights = [];
    if (topCategory) {
        const percentage = ((topCategory[1] / totalExpenses) * 100).toFixed(0);
        insights.push({
            type: 'info',
            message: `You spent ${percentage}% on ${topCategory[0]}`,
            icon: TrendingUp
        });
    }
    if (monthlyTrend.length >= 2) {
        const current = monthlyTrend[monthlyTrend.length - 1]?.amount || 0;
        const previous = monthlyTrend[monthlyTrend.length - 2]?.amount || 0;
        if (current > previous * 1.1) {
            insights.push({
                type: 'warning',
                message: 'Your spending increased this month. Consider reviewing your budget.',
                icon: AlertCircle
            });
        }
    }
    insights.push({
        type: 'tip',
        message: 'Set up recurring expense tracking for subscriptions',
        icon: Lightbulb
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="spinner" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                {error}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-primary rounded-xl flex items-center justify-center">
                            <IndianRupee className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-gray-800">
                                ₹{totalExpenses.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center">
                            <ShoppingCart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Top Category</p>
                            <p className="text-2xl font-bold text-gray-800">
                                {topCategory ? topCategory[0] : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card-hover">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-warning rounded-xl flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Transactions</p>
                            <p className="text-2xl font-bold text-gray-800">{expenseCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Spending by Category</h2>
                    <div className="h-64 flex items-center justify-center">
                        {Object.keys(categoryBreakdown).length > 0 ? (
                            <Pie data={pieData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} />
                        ) : (
                            <p className="text-gray-500">No expense data available</p>
                        )}
                    </div>
                </div>

                {/* Bar Chart */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trend</h2>
                    <div className="h-64">
                        {monthlyTrend.length > 0 ? (
                            <Bar
                                data={barData}
                                options={{
                                    maintainAspectRatio: false,
                                    plugins: { legend: { display: false } },
                                    scales: { y: { beginAtZero: true } }
                                }}
                            />
                        ) : (
                            <div className="h-full flex items-center justify-center">
                                <p className="text-gray-500">No monthly data available</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Insights Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    Smart Insights
                </h2>
                <div className="space-y-3">
                    {insights.map((insight, index) => (
                        <div
                            key={index}
                            className={`p-4 rounded-xl flex items-start gap-3 ${insight.type === 'warning' ? 'bg-amber-50' :
                                insight.type === 'tip' ? 'bg-blue-50' : 'bg-indigo-50'
                                }`}
                        >
                            <insight.icon className={`w-5 h-5 mt-0.5 ${insight.type === 'warning' ? 'text-amber-600' :
                                insight.type === 'tip' ? 'text-blue-600' : 'text-indigo-600'
                                }`} />
                            <p className={`text-sm ${insight.type === 'warning' ? 'text-amber-800' :
                                insight.type === 'tip' ? 'text-blue-800' : 'text-indigo-800'
                                }`}>
                                {insight.message}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Expenses */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Expenses</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-sm text-gray-500 border-b">
                                <th className="pb-3 font-medium">Description</th>
                                <th className="pb-3 font-medium">Category</th>
                                <th className="pb-3 font-medium">Date</th>
                                <th className="pb-3 font-medium text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.slice(0, 5).map((expense) => (
                                <tr key={expense.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 text-gray-800">{expense.description || 'No description'}</td>
                                    <td className="py-3">
                                        <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                                            {expense.categoryDisplayName || expense.category}
                                        </span>
                                    </td>
                                    <td className="py-3 text-gray-600">{expense.expenseDate}</td>
                                    <td className="py-3 text-right font-semibold text-gray-800">
                                        ₹{expense.amount?.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {expenses.length === 0 && (
                        <p className="text-center text-gray-500 py-8">No expenses yet. Add your first expense!</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
