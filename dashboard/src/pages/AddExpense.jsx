import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenseAPI } from '../services/api';
import {
    IndianRupee,
    Calendar,
    Tag,
    FileText,
    Store,
    CreditCard,
    CheckCircle,
    AlertCircle
} from 'lucide-react';

const AddExpense = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        expenseDate: new Date().toISOString().split('T')[0],
        merchantName: '',
        paymentMethod: 'Credit Card',
        isRecurring: false,
    });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await expenseAPI.getCategories();
            setCategories(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            // Fallback categories
            setCategories([
                'FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING',
                'HEALTHCARE', 'GROCERIES', 'SUBSCRIPTIONS', 'RENT', 'OTHER'
            ]);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.amount || !formData.category || !formData.expenseDate) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            await expenseAPI.create({
                ...formData,
                amount: parseFloat(formData.amount),
            });
            setSuccess('Expense added successfully!');
            setFormData({
                amount: '',
                category: '',
                description: '',
                expenseDate: new Date().toISOString().split('T')[0],
                merchantName: '',
                paymentMethod: 'Credit Card',
                isRecurring: false,
            });

            // Redirect after 1.5 seconds
            setTimeout(() => navigate('/dashboard'), 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add expense');
        } finally {
            setLoading(false);
        }
    };

    const paymentMethods = ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer', 'UPI', 'Other'];

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Expense</h1>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="number"
                                name="amount"
                                value={formData.amount}
                                onChange={handleChange}
                                step="0.01"
                                min="0.01"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat.replace(/_/g, ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="date"
                                name="expenseDate"
                                value={formData.expenseDate}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={2}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                placeholder="What was this expense for?"
                            />
                        </div>
                    </div>

                    {/* Merchant Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Merchant / Store</label>
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                name="merchantName"
                                value={formData.merchantName}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                placeholder="e.g., Amazon, Starbucks"
                            />
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod}
                                onChange={handleChange}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none bg-white"
                            >
                                {paymentMethods.map((method) => (
                                    <option key={method} value={method}>{method}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Recurring */}
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="isRecurring"
                            id="isRecurring"
                            checked={formData.isRecurring}
                            onChange={handleChange}
                            className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor="isRecurring" className="text-sm text-gray-700">
                            This is a recurring expense
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <div className="spinner" /> : 'Add Expense'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddExpense;
