import React, { useState } from 'react';
import Modal from './Modal';
import { CreditCardIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const PaymentModal = ({ isOpen, onClose, amount, listingTitle, onPaymentSuccess }) => {
    const [step, setStep] = useState('form'); // 'form', 'processing', 'success'
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [formData, setFormData] = useState({
        cardNumber: '',
        cardName: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });
    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            const cleaned = value.replace(/\s/g, '').replace(/\D/g, '');
            const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
            setFormData({ ...formData, [name]: formatted.slice(0, 19) });
        } else if (name === 'cvv') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 4) });
        } else if (name === 'expiryMonth' || name === 'expiryYear') {
            setFormData({ ...formData, [name]: value.replace(/\D/g, '').slice(0, 2) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
            newErrors.cardNumber = 'Please enter a valid card number';
        }
        if (!formData.cardName) {
            newErrors.cardName = 'Please enter the cardholder name';
        }
        if (!formData.expiryMonth || formData.expiryMonth < 1 || formData.expiryMonth > 12) {
            newErrors.expiryMonth = 'Invalid';
        }
        if (!formData.expiryYear || formData.expiryYear < 24) {
            newErrors.expiryYear = 'Invalid';
        }
        if (!formData.cvv || formData.cvv.length < 3) {
            newErrors.cvv = 'Invalid CVV';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setStep('processing');

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        setStep('success');

        // Wait a moment then complete
        setTimeout(() => {
            onPaymentSuccess && onPaymentSuccess({
                transactionId: 'TXN' + Date.now(),
                amount: amount,
                method: paymentMethod
            });
        }, 1500);
    };

    const handleClose = () => {
        setStep('form');
        setFormData({
            cardNumber: '',
            cardName: '',
            expiryMonth: '',
            expiryYear: '',
            cvv: ''
        });
        setErrors({});
        onClose();
    };

    const getCardType = (number) => {
        const cleaned = number.replace(/\s/g, '');
        if (cleaned.startsWith('4')) return { name: 'Visa', color: 'text-blue-600' };
        if (cleaned.startsWith('5')) return { name: 'Mastercard', color: 'text-orange-600' };
        if (cleaned.startsWith('3')) return { name: 'Amex', color: 'text-blue-800' };
        return null;
    };

    const cardType = getCardType(formData.cardNumber);

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="">
            <div className="min-w-[350px]">
                {step === 'form' && (
                    <>
                        {/* Header */}
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl mb-4 shadow-lg shadow-brand-200">
                                <CreditCardIcon className="h-8 w-8 text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
                            <p className="text-sm text-gray-500 mt-1">For: {listingTitle}</p>
                        </div>

                        {/* Amount Display */}
                        <div className="bg-gradient-to-r from-brand-50 to-purple-50 rounded-xl p-4 mb-6 border border-brand-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 text-sm">Amount to Pay</span>
                                <span className="text-2xl font-bold text-brand-700">₹{amount}</span>
                            </div>
                        </div>

                        {/* Payment Method Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('card')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'card'
                                        ? 'bg-brand-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                💳 Card
                            </button>
                            <button
                                type="button"
                                onClick={() => setPaymentMethod('upi')}
                                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${paymentMethod === 'upi'
                                        ? 'bg-brand-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                📱 UPI
                            </button>
                        </div>

                        {paymentMethod === 'card' ? (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Card Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Card Number
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={formData.cardNumber}
                                            onChange={handleChange}
                                            placeholder="1234 5678 9012 3456"
                                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${errors.cardNumber ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        />
                                        {cardType && (
                                            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${cardType.color}`}>
                                                {cardType.name}
                                            </span>
                                        )}
                                    </div>
                                    {errors.cardNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
                                    )}
                                </div>

                                {/* Cardholder Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cardholder Name
                                    </label>
                                    <input
                                        type="text"
                                        name="cardName"
                                        value={formData.cardName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${errors.cardName ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.cardName && (
                                        <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>
                                    )}
                                </div>

                                {/* Expiry and CVV */}
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Month
                                        </label>
                                        <input
                                            type="text"
                                            name="expiryMonth"
                                            value={formData.expiryMonth}
                                            onChange={handleChange}
                                            placeholder="MM"
                                            className={`w-full px-3 py-3 border rounded-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${errors.expiryMonth ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Year
                                        </label>
                                        <input
                                            type="text"
                                            name="expiryYear"
                                            value={formData.expiryYear}
                                            onChange={handleChange}
                                            placeholder="YY"
                                            className={`w-full px-3 py-3 border rounded-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${errors.expiryYear ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            CVV
                                        </label>
                                        <input
                                            type="password"
                                            name="cvv"
                                            value={formData.cvv}
                                            onChange={handleChange}
                                            placeholder="•••"
                                            className={`w-full px-3 py-3 border rounded-lg text-center focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${errors.cvv ? 'border-red-300' : 'border-gray-300'
                                                }`}
                                        />
                                    </div>
                                </div>

                                {/* Security Note */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <LockClosedIcon className="h-4 w-4 text-green-600" />
                                    <span>Your payment information is secure and encrypted</span>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all shadow-lg shadow-brand-200"
                                >
                                    Pay ₹{amount}
                                </button>

                                {/* Cancel */}
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </form>
                        ) : (
                            /* UPI Payment */
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        UPI ID
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="yourname@upi"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                                    />
                                </div>

                                <div className="text-center text-gray-400 text-sm">— or —</div>

                                {/* UPI Apps */}
                                <div className="grid grid-cols-4 gap-3">
                                    {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                                        <button
                                            key={app}
                                            type="button"
                                            onClick={handleSubmit}
                                            className="p-3 border border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-colors text-center"
                                        >
                                            <div className="text-2xl mb-1">
                                                {app === 'GPay' && '💸'}
                                                {app === 'PhonePe' && '📲'}
                                                {app === 'Paytm' && '💳'}
                                                {app === 'BHIM' && '🏦'}
                                            </div>
                                            <span className="text-xs text-gray-600">{app}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Security Note */}
                                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                                    <LockClosedIcon className="h-4 w-4 text-green-600" />
                                    <span>Secured by RBI-approved payment gateway</span>
                                </div>

                                {/* Cancel */}
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700"
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </>
                )}

                {step === 'processing' && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-100 rounded-full mb-6">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-brand-600 border-t-transparent"></div>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Payment</h3>
                        <p className="text-gray-500 text-sm">Please wait while we process your payment of ₹{amount}...</p>
                        <p className="text-xs text-gray-400 mt-4">Do not close this window</p>
                    </div>
                )}

                {step === 'success' && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                            <CheckCircleIcon className="h-12 w-12 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful! 🎉</h3>
                        <p className="text-gray-500 text-sm mb-4">You have successfully paid ₹{amount}</p>
                        <div className="bg-gray-50 rounded-lg p-4 text-sm">
                            <div className="flex justify-between text-gray-600">
                                <span>Transaction ID</span>
                                <span className="font-mono font-bold">TXN{Date.now().toString().slice(-8)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PaymentModal;
