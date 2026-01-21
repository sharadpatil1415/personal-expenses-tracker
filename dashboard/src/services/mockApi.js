// Mock API service for demo mode (when backend is not available)
// This provides realistic sample data to demonstrate the dashboard

const DEMO_USER = {
    userId: 1,
    username: 'demo',
    email: 'demo@example.com',
    role: 'USER'
};

const DEMO_TOKEN = 'demo-jwt-token-for-testing';

// Sample expenses data
const DEMO_EXPENSES = [
    { id: 1, amount: 15.50, category: 'FOOD', categoryDisplayName: 'Food & Dining', description: 'Lunch at cafe', expenseDate: '2024-01-15', merchantName: 'Starbucks', paymentMethod: 'Credit Card', isRecurring: false },
    { id: 2, amount: 85.30, category: 'GROCERIES', categoryDisplayName: 'Groceries', description: 'Weekly groceries', expenseDate: '2024-01-14', merchantName: 'Walmart', paymentMethod: 'Debit Card', isRecurring: false },
    { id: 3, amount: 45.00, category: 'FOOD', categoryDisplayName: 'Food & Dining', description: 'Dinner with friends', expenseDate: '2024-01-13', merchantName: 'Olive Garden', paymentMethod: 'Credit Card', isRecurring: false },
    { id: 4, amount: 35.00, category: 'TRANSPORT', categoryDisplayName: 'Transportation', description: 'Uber to airport', expenseDate: '2024-01-12', merchantName: 'Uber', paymentMethod: 'Credit Card', isRecurring: false },
    { id: 5, amount: 55.00, category: 'TRANSPORT', categoryDisplayName: 'Transportation', description: 'Gas refill', expenseDate: '2024-01-11', merchantName: 'Shell', paymentMethod: 'Debit Card', isRecurring: false },
    { id: 6, amount: 95.00, category: 'TRANSPORT', categoryDisplayName: 'Transportation', description: 'Monthly metro pass', expenseDate: '2024-01-10', merchantName: 'Metro', paymentMethod: 'Debit Card', isRecurring: true },
    { id: 7, amount: 120.00, category: 'UTILITIES', categoryDisplayName: 'Utilities & Bills', description: 'Electricity bill', expenseDate: '2024-01-09', merchantName: 'Power Co', paymentMethod: 'Bank Transfer', isRecurring: true },
    { id: 8, amount: 79.99, category: 'UTILITIES', categoryDisplayName: 'Utilities & Bills', description: 'Internet bill', expenseDate: '2024-01-08', merchantName: 'Comcast', paymentMethod: 'Bank Transfer', isRecurring: true },
    { id: 9, amount: 85.00, category: 'UTILITIES', categoryDisplayName: 'Utilities & Bills', description: 'Phone bill', expenseDate: '2024-01-07', merchantName: 'Verizon', paymentMethod: 'Credit Card', isRecurring: true },
    { id: 10, amount: 15.99, category: 'SUBSCRIPTIONS', categoryDisplayName: 'Subscriptions', description: 'Netflix subscription', expenseDate: '2024-01-06', merchantName: 'Netflix', paymentMethod: 'Credit Card', isRecurring: true },
    { id: 11, amount: 28.00, category: 'ENTERTAINMENT', categoryDisplayName: 'Entertainment', description: 'Movie tickets', expenseDate: '2024-01-05', merchantName: 'AMC', paymentMethod: 'Credit Card', isRecurring: false },
    { id: 12, amount: 150.00, category: 'ENTERTAINMENT', categoryDisplayName: 'Entertainment', description: 'Concert tickets', expenseDate: '2024-01-04', merchantName: 'Ticketmaster', paymentMethod: 'Credit Card', isRecurring: false },
    { id: 13, amount: 129.00, category: 'SHOPPING', categoryDisplayName: 'Shopping', description: 'New shoes', expenseDate: '2024-01-03', merchantName: 'Nike Store', paymentMethod: 'Credit Card', isRecurring: false },
    { id: 14, amount: 45.00, category: 'SHOPPING', categoryDisplayName: 'Shopping', description: 'Books', expenseDate: '2024-01-02', merchantName: 'Amazon', paymentMethod: 'Credit Card', isRecurring: false },
    { id: 15, amount: 75.00, category: 'HEALTHCARE', categoryDisplayName: 'Healthcare', description: 'Doctor visit', expenseDate: '2024-01-01', merchantName: 'City Clinic', paymentMethod: 'Insurance', isRecurring: false },
];

const CATEGORIES = ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'SHOPPING', 'HEALTHCARE', 'GROCERIES', 'SUBSCRIPTIONS', 'RENT', 'OTHER'];

// Calculate summary from expenses
const calculateSummary = (expenses) => {
    const totalSpending = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categoryBreakdown = {};
    expenses.forEach(e => {
        categoryBreakdown[e.category] = (categoryBreakdown[e.category] || 0) + e.amount;
    });

    return {
        totalSpending,
        expenseCount: expenses.length,
        categoryBreakdown,
        monthlyTrend: [
            { month: 10, year: 2023, amount: 1820 },
            { month: 11, year: 2023, amount: 2150 },
            { month: 12, year: 2023, amount: 2480 },
            { month: 1, year: 2024, amount: totalSpending },
        ]
    };
};

// Mock API responses
export const mockAPI = {
    // Auth
    login: (data) => {
        if (data.username === 'demo' && data.password === 'demo123') {
            return Promise.resolve({
                data: {
                    success: true,
                    data: { token: DEMO_TOKEN, ...DEMO_USER }
                }
            });
        }
        return Promise.reject({ response: { data: { message: 'Invalid credentials' } } });
    },

    register: (data) => {
        return Promise.resolve({
            data: {
                success: true,
                data: { token: DEMO_TOKEN, userId: 2, username: data.username, email: data.email, role: 'USER' }
            }
        });
    },

    // Expenses
    getAll: () => Promise.resolve({ data: { success: true, data: DEMO_EXPENSES } }),

    getById: (id) => {
        const expense = DEMO_EXPENSES.find(e => e.id === id);
        return Promise.resolve({ data: { success: true, data: expense } });
    },

    create: (expense) => {
        const newExpense = {
            id: DEMO_EXPENSES.length + 1,
            ...expense,
            categoryDisplayName: expense.category.replace(/_/g, ' ')
        };
        DEMO_EXPENSES.unshift(newExpense);
        return Promise.resolve({ data: { success: true, data: newExpense } });
    },

    delete: (id) => {
        const index = DEMO_EXPENSES.findIndex(e => e.id === id);
        if (index > -1) DEMO_EXPENSES.splice(index, 1);
        return Promise.resolve({ data: { success: true } });
    },

    getByMonth: (year, month) => {
        const filtered = DEMO_EXPENSES.filter(e => {
            const d = new Date(e.expenseDate);
            return d.getFullYear() === year && d.getMonth() + 1 === month;
        });
        return Promise.resolve({ data: { success: true, data: filtered } });
    },

    getSummary: () => Promise.resolve({ data: { success: true, data: calculateSummary(DEMO_EXPENSES) } }),

    getCategories: () => Promise.resolve({ data: { success: true, data: CATEGORIES } }),

    exportCsv: () => {
        const csv = 'ID,Amount,Category,Description,Date\n' +
            DEMO_EXPENSES.map(e => `${e.id},${e.amount},${e.category},"${e.description}",${e.expenseDate}`).join('\n');
        return Promise.resolve({ data: csv });
    }
};

export default mockAPI;
