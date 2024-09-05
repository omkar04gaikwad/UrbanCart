import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Grid, Box, Typography, Button, Popper, Paper, Alert, CircularProgress, TextField } from '@mui/material';
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../../firebase';
import Cookies from 'js-cookie';
import { databasentrypayment } from '../../../services';

export const CheckoutForm = ({ phoneNumber, cart }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isLoading, setIsLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [errorAlert, setErrorAlert] = useState(false);
    const [success, setSuccess] = useState('');
    const [successAlert, setSuccessAlert] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [dbLoading, setDbLoading] = useState(false);
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    useEffect(() => {
        if (!elements) {
            return;
        }

        const paymentElement = elements.getElement(PaymentElement);

        if (paymentElement) {
            paymentElement.on('change', (event) => {
                if (event.complete) {
                    setIsButtonDisabled(false); // Enable the button if the details are valid
                } else {
                    setIsButtonDisabled(true); // Keep the button disabled if details are incomplete
                }
            });
        }
    }, [elements]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) {
            return;
        }

        // Step 1: Validate Card Details
        setIsLoading(true);
        sendOtp();
    };

    const sendOtp = async () => {
        try {
            const appVerifier = new RecaptchaVerifier(auth,'recaptcha-container', { size: 'invisible' });
            const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            window.confirmationResult = confirmationResult;
            setOtpSent(true);
            setSuccess("OTP sent to " + phoneNumber.replace(/.(?=.{4})/g, 'x'));
            setSuccessAlert(true);
            setErrorAlert(false);
            setIsLoading(false);
            setAnchorEl(document.getElementById('submit'));
        } catch (error) {
            setError(`Error during OTP verification: ${error.message}`);
            setErrorAlert(true);
            setSuccessAlert(false);
            setIsLoading(false);
        }
    };

    const verifyOtpNumber = async () => {
        try {
            setIsLoading(true);
            const result = await window.confirmationResult.confirm(otp);
            setSuccess("Phone verified!");
            setSuccessAlert(true);
            setErrorAlert(false);
            setAnchorEl(null);
            // Step 3: Process Payment
            handlePayment();
        } catch (error) {
            setError(`Error during OTP verification: ${error.message}`);
            setErrorAlert(true);
            setSuccessAlert(false);
            setIsLoading(false);
        }
    };

    const handlePayment = async () => {
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: 'if_required'
        });

        if (error) {
            setErrorAlert(true);
            setIsLoading(false);
        } else if (paymentIntent.status === "succeeded") {
            saveToDatabase(paymentIntent.id);
        }
    };

    const saveToDatabase = async (paymentIntentId) => {
        setDbLoading(true);
        const token = Cookies.get('token');
        const csrf_token = Cookies.get('csrf_token');

        try {
            const response = await databasentrypayment(cart, token, csrf_token, paymentIntentId);
            if (response.status === 200) {
                localStorage.removeItem('cart');

                // Replace the payment form content with a success message and countdown
                document.getElementById('payment-form').innerHTML = `
                    <div id="success-message" style="text-align: center;"></div>
                `;
                ReactDOM.render(<PaymentSuccessMessage />, document.getElementById('success-message'));

            } else {
                setError("Failed to save data to the database.");
                setErrorAlert(true);
            }
        } catch (err) {
            setError("Error occurred while saving data.");
            setErrorAlert(true);
        } finally {
            setDbLoading(false);
            setIsLoading(false);
        }
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <Box id="recaptcha-container"></Box>
            <PaymentElement id="payment-element" required />
            {otpSent && (
                <Popper id="otp-popper" open={Boolean(anchorEl)} anchorEl={anchorEl} placement="top" container={anchorEl?.parentElement}>
                    <Paper elevation={3} style={{ padding: '16px', maxWidth: '200px' }}>
                        <Typography variant="body1">OTP sent to xxx-xxx-{phoneNumber.slice(-4)}</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            name="otp"
                            label="OTP"
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                        />
                        <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={verifyOtpNumber}>
                            Verify OTP
                        </Button>
                    </Paper>
                </Popper>
            )}

            <Button id="submit" type="submit" fullWidth variant="contained" disabled={isLoading || isButtonDisabled || dbLoading}>
                {isLoading || dbLoading ? <CircularProgress size={24} /> : "Pay Now"}
            </Button>

            {errorAlert && <Alert severity="error">{error}</Alert>}
            {successAlert && <Alert severity="success">{success}</Alert>}
        </form>
    );
};

const PaymentSuccessMessage = () => {
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(intervalId);
                    window.location.href = `${window.location.origin}/items`;
                }
                return prevCountdown - 1;
            });
        }, 1000);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="300px"
        >
            <Typography variant="h4" sx={{ mb: 2 }}>
                Payment Successful!
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
                Your payment has been completed successfully.
            </Typography>
            <Typography variant="body2" color="textSecondary">
                Redirecting in <strong>{countdown}</strong> seconds...
            </Typography>
        </Box>
    );
};
