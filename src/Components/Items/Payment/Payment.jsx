import React, { useEffect, useState } from 'react'
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, LinkAuthenticationElement, PaymentElement, Elements } from '@stripe/react-stripe-js';
import { CheckoutForm } from './CheckoutForm';
import './Payment.css';
export const Payment = ( {cart, clientSecret, phoneNumber }) => {
    const stripePromise = loadStripe('pk_test_51PmJZ52MJdyBH0mnDxKy34au8rWxjGd6DVWrPU4Zhkvjgfss5sGXRbOsFLCR9qbIx3smxneAnrnPYgjwt94oVPN300V47ueNxm');
    return (
        <>
            <h1>Payment Portal</h1>
            {clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret, }}>
                    <CheckoutForm phoneNumber={phoneNumber} cart={cart} />
                </Elements>
            )}
        </>
    )
}