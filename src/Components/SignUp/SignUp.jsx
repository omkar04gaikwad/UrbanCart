import React, { useState } from 'react'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { MuiTelInput } from 'mui-tel-input'
import Alert from '@mui/material/Alert';
import { createaccount } from '../../services';
import { app, auth, RecaptchaVerifier, signInWithPhoneNumber } from '../../firebase';
import { LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();
export const SignUp = ({ setAction }) => {
    const[phoneNumber, setphoneNumber] = useState('+16552325444');
    const [otpSent, setOtpsent] = useState(false);
    const [otp, setOtp] = useState('');
    const [error, SetError] = useState('');
    const [ErrorAlert, SetErroralert] = useState(false);
    const [success, SetSuccess] = useState('');
    const [SuccessAlert, SetSuccessalert] = useState(false);
    const [loading, setloading] = useState(false);
    const [fname, setname] = useState('');
    const [lname, setlname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verified, setverified] = useState(false);
    const navigate = useNavigate();
    const gotologin = () =>{
        navigate('/');
    }
    const handleChange = (value) => {
        setphoneNumber(value);
    };

    const handleEnterPress = async (event) => {
        if(event.key === 'Enter'){
            const phoneNum = phoneNumber.replace(/D/g, '');
            if(phoneNum.length > 11){
                const appVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                    size:'invisible',
                    callback: (response) =>{
                        console.log(response);
                        console.log("reCAPTCHA solved");
                    }
                });
                try{
                    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
                    window.confirmationResult = confirmationResult;
                    setOtpsent(true);
                    SetSuccess("OTP sent");
                    SetErroralert(false);
                    SetSuccessalert(true);
                }
                catch(error){
                    SetError(`Error during signInWithPhoneNumber ${error}`);
                    SetErroralert(true);
                    SetSuccessalert(false);
                    setOtpsent(false);
                }
            }
            else{
                SetError("Invalid phone number length");
                SetErroralert(true);
                SetSuccessalert(false);
                setOtpsent(false);
            }
        }
    }

    const handleOtpChange = (event) => {
        setOtp(event.target.value);
    };
    const verifyOtp = async () =>{
        try{
            const result = await window.confirmationResult.confirm(otp);
            console.log("Phone verified!", result.user);
            SetSuccess("Phone verified!");
            SetErroralert(false);
            SetSuccessalert(true);
            setverified(true);
        }
        catch (error){
            SetError(error.code);
            SetErroralert(true);
            SetSuccessalert(false);
            setverified(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if(verified === true){
        setloading(true);
            const resp = await createaccount(fname, lname, email, phoneNumber, password);
            if(resp.status == 200){
                setloading(false);
                navigate('/');
            }
            else{
                alert("Error Signing Up Try again!");
                window.location.reload();
            }
        }
        else{
            alert("verify Phone Number!");
        }
    };
    return (
        <ThemeProvider theme={defaultTheme}>
        <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
            sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            }}
            >
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign up
            </Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
            {loading && <LinearProgress />}
                <Grid item xs={12} sm={6}>
                <TextField
                    autoComplete="given-name"
                    name="firstName"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    autoFocus
                    value={fname}
                    onChange={(e) => setname(e.target.value)}
                />
                </Grid>
                <Grid item xs={12} sm={6}>
                <TextField
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    autoComplete="family-name"
                    value={lname}
                    onChange={(e) => setlname(e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                </Grid>
                <Grid item xs={12}>
                    <MuiTelInput
                        required
                        value={phoneNumber}
                        onChange={handleChange}
                        fullWidth
                        onKeyDown={handleEnterPress}
                        />
                </Grid>
                {otpSent && (
                    <Grid item xs={12} sm={8}>
                        <TextField
                        fullWidth
                            margin="normal"
                            required
                            name="otp"
                            label="OTP"
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={handleOtpChange}
                        />
                    </Grid>
                )}
                {otpSent && (
                    <Grid item xs={12} sm={4}>
                        <Button fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} onClick={verifyOtp} >Verify!</Button>
                    </Grid>
                )}
                <Grid item xs={12}>
                <Box id="recaptcha-container"></Box> 
                </Grid>
                <Grid item xs={12}>
                    {ErrorAlert && (<Alert severity="error">{error}</Alert>)}
                    {SuccessAlert && (<Alert severity="success">{success}</Alert>)}
                </Grid>
                <Grid item xs={12}>
                <TextField
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                </Grid>
            </Grid>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
            >
                Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
                <Grid item>
                <Link onClick={gotologin} variant="body2" style={{ cursor: 'pointer'}}>
                    Already have an account? Sign in
                </Link>
                </Grid>
            </Grid>
            </Box>
        </Box>
        </Container>
    </ThemeProvider>
    )
}


