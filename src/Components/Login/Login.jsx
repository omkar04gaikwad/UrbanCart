import React from 'react'
import './Login.css'
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { fetchfromserver, login, getCategories, syncCartWithServer,  getAllproducts, getallorders, getcookie, setcookie } from '../../services';
import Cookies from 'js-cookie';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
const defaultTheme = createTheme();

export const Login = ({ cart, setCart }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [category, setCategory] = React.useState('');
    const [products, setProducts] = React.useState([]);
    const [orders, setorders] = React.useState([]);
    const [categories, setCategories] = React.useState([]);
    const gotosignup = () =>{
        navigate('/signup');
    }
    const handleSubmit = async (event) => {
            event.preventDefault();
            const resp = await setcookie();
            console.log(resp)
            const response = await getcookie();
            console.log(response);
            // const resp = await login(email, password);
            // if(resp.status == 200){
            //     // Set cookies
            //     Cookies.set('token', resp.data.token, {expires: 365});
            //       // Set the 'csrf_token' cookie with security attributes
            //     Cookies.set('csrf_token', resp.data.csrf_token, {expires: 365});
            //     const serverCart = await fetchfromserver(resp.data.token, resp.data.csrf_token);
            //     if (serverCart && serverCart.length > 0) {
            //         // If server cart exists, update local cart
            //         setCart(serverCart);
            //         localStorage.setItem('cart', JSON.stringify(serverCart));
            //     } else {
            //         // If server cart is empty, retain local cart or initialize as needed
            //         const localCart = localStorage.getItem('cart');
            //         if (localCart) {
            //             setCart(JSON.parse(localCart));
            //         } else {
            //             setCart([]);
            //         }
            //     }
            //     navigate('/items');
            // }
            // else{
            //     alert("No Login Found!");
            //     window.location.reload();
            // }
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
                alignItems: 'center',}}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                
            </Avatar>
            <Typography component="h1" variant="h5">
                Sign in
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                margin="normal"
                type='email'
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
                <TextField
                    margin="normal"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                />
                <FormControlLabel
                    control={<Checkbox value="remember" color="primary" />}
                    label="Remember me"
                />
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                >
                    Sign In
                </Button>
                <Grid container>
                    <Grid item xs>
                    <Link href="#" variant="body2">
                        Forgot password?
                    </Link>
                    </Grid>
                    <Grid item>
                    <Link
                        onClick={gotosignup}
                        variant="body2"
                        style={{ cursor: 'pointer' }}
                        >
                        {"Don't have an account? Sign Up"}
                    </Link>
                    </Grid>
                </Grid>
                </Box>
            </Box>
            </Container>
        </ThemeProvider>
        );
}