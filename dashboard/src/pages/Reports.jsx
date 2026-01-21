import { useState, useEffect } from 'react';
import { expenseAPI } from '../services/api';
import {
    Download,
    Filter,
    Calendar,
    Trash2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);
    const [error, setError] = useState('');

    const currentDate = new Date();
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        fetchExpenses();
    }, [selectedYear, selectedMonth]);

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await expenseAPI.getByMonth(selectedYear, selectedMonth);
            const data = res.data.data || [];
            setExpenses(data);
            setFilteredExpenses(data);
        } catch (err) {
            console.error(err);
            // Fallback to all expenses
            try {
                const res = await expenseAPI.getAll();
                const data = res.data.data || [];
                // Filter by month client-side
                const filtered = data.filter(exp => {
                    const date = new Date(exp.expenseDate);
                    return date.getFullYear() === selectedYear && date.getMonth() + 1 === selectedMonth;
                });
                setExpenses(filtered);
                setFilteredExpenses(filtered);
            } catch (err2) {
                setError('Failed to load expenses');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleExportCsv = async () => {
        try {
            const response = await expenseAPI.exportCsv();
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses_${selectedYear}_${selectedMonth}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (err) {
            // Fallback: create CSV from current data
            const csvContent = [
                ['ID', 'Amount', 'Category', 'Description', 'Date', 'Merchant', 'Payment Method'].join(','),
                ...filteredExpenses.map(exp => [
                    exp.id,
                    exp.amount,
                    exp.category,
                    `"${exp.description || ''}"`,
                    exp.expenseDate,
                    `"${exp.merchantName || ''}"`,
                    exp.paymentMethod || ''
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `expenses_${selectedYear}_${selectedMonth}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await expenseAPI.delete(id);
            setFilteredExpenses(prev => prev.filter(exp => exp.id !== id));
        } catch (err) {
            alert('Failed to delete expense');
        }
    };

    const navigateMonth = (direction) => {
        let newMonth = selectedMonth + direction;
        let newYear = selectedYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Expense Reports</h1>

                <button
                    onClick={handleExportCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
                >
                    <Download className="w-4 h-4" />
                    Export CSV
                </button>
            </div>

            {/* Month Filter */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => navigateMonth(-1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                        <span className="text-lg font-semibold text-gray-800">
                            {months[selectedMonth - 1]} {selectedYear}
                        </span>
                    </div>

                    <button
                        onClick={() => navigateMonth(1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition"
                        disabled={selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth() + 1}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-primary rounded-2xl p-6 text-white">
                <p className="text-white/80 text-sm">Total for {months[selectedMonth - 1]}</p>
                <p className="text-3xl font-bold mt-1">
                    ₹{totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-white/80 text-sm mt-2">
                    {filteredExpenses.length} transaction{filteredExpenses.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Expense Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-48">
                        <div className="spinner" />
                    </div>
                ) : error ? (
                    <div className="p-6 text-center text-red-600">{error}</div>
                ) : filteredExpenses.length === 0 ? (
                    <div className="p-12 text-center">
                        <p className="text-gray-500">No expenses found for this month</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-sm text-gray-600">
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Description</th>
                                    <th className="px-6 py-4 font-medium">Category</th>
                                    <th className="px-6 py-4 font-medium">Merchant</th>
                                    <th className="px-6 py-4 font-medium text-right">Amount</th>
                                    <th className="px-6 py-4 font-medium text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-600">{expense.expenseDate}</td>
                                        <td className="px-6 py-4 text-gray-800">{expense.description || '-'}</td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium">
                                                {expense.categoryDisplayName || expense.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">{expense.merchantName || '-'}</td>
                                        <td className="px-6 py-4 text-right font-semibold text-gray-800">
                                            ₹{expense.amount?.toFixed(2)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleDeleteExpense(expense.id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;
