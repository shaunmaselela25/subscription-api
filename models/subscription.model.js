import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Subscription name is required'],
        trim: true,
        minlength: [2, 'Subscription name must be at least 2 characters long'],
        maxlength: [100, 'Subscription name must be less than 100 characters long']
    },
    price: {
        type: Number,
        required: [true, 'Subscription price is required'],
        min: [0, 'Price must be a positive number']
    },
    currency: {
        type: String,
        enum: ['ZAR', 'USD', 'EUR', 'GBP'],
        default: 'USD',
        required: [true, 'Currency is required'],
        trim: true,
        uppercase: true,
        minlength: [3, 'Currency code must be 3 characters long'],
        maxlength: [3, 'Currency code must be 3 characters long']
    },
    billingCycle: {
        type: String,
        required: [true, 'Billing cycle is required'],
        enum: ['weekly', 'monthly', 'yearly'],
    },
    category: {
        enum: ['entertainment', 'utilities', 'software', 'other'],
        type: String,
        required: [true, 'Category is required'],
        trim: true,
        minlength: [2, 'Category must be at least 2 characters long'],
        maxlength: [50, 'Category must be less than 50 characters long']
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'other'],
        required: [true, 'Payment method is required'],
        trim: true,
        minlength: [2, 'Payment method must be at least 2 characters long'],
        maxlength: [50, 'Payment method must be less than 50 characters long']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'User',
        required: [true, 'User reference is required'],
        index: true
    },
    status: {
        type: String,
        enum: ['active', 'canceled', 'past_due'],
        default: 'active'
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required'],
        validate: {
            validator: function(value) {
                return value <= new Date(); 
            },
            message: 'Start date cannot be in the future'
        }

    },
    renewalDate: {
        type: Date,
        required: [true, 'Renewal date is required'],
        validate: {
            validator: function(value) {
                return value > this.startDate; 
            },
            message: 'Renewal date must be after start date'
        }
    }
}, { timestamps: true });

//Auto-calculate renewal date if missing based on billing cycle
subscriptionSchema.pre('validate', function(next) {
    if (!this.renewalDate) {
        const start = this.startDate || new Date();
        switch (this.billingCycle) {
            case 'weekly':
                this.renewalDate = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
                break;
            case 'monthly':
                this.renewalDate = new Date(start.setMonth(start.getMonth() + 1));
                break;
            case 'yearly':
                this.renewalDate = new Date(start.setFullYear(start.getFullYear() + 1));
                break;
        }
    }
     // Auto-update status to 'past_due' if renewal date has passed and subscription is still active
    if (this.renewalDate < new Date() && this.status === 'active') {
        this.status = 'past_due';
    }
    // Ensure renewal date is after start date
    if (this.renewalDate <= this.startDate) {
        return next(new Error('Renewal date must be after start date'));
    }
    next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription;