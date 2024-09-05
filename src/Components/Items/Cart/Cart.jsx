import * as React from 'react';
import { Box, List, ListItem, ListItemText, ListItemAvatar, Avatar, Typography, ButtonGroup, Button, Divider, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import RemoveIcon from '@mui/icons-material/Remove';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { Payment } from '../Payment/Payment';
import Cookies from 'js-cookie';
import { askforpayment } from '../../../services';
import { useNavigate } from 'react-router-dom';
export const Cart = ( { cart, setCart }  ) => {
    const navigate = useNavigate();
    const handleIncrement = (itemId) => {
        const updatedCart = cart.map(item =>
            item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleDecrement = (itemId) => {
        const updatedCart = cart
            .map(item =>
                item.id === itemId && item.quantity > 0
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            )
            .filter(item => item.quantity > 0); // Remove item if quantity is 0
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const handleRemoveItem = (itemId) => {
        const updatedCart = cart.filter(item => item.id !== itemId);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const totalAmount = cart.reduce((total, item) => total + item.discount_price * item.quantity, 0).toFixed(2);

    const backpage = () => {
        navigate('/items');
    }
    const [open, setOpen] = React.useState(false);
    const [ clientSecret, setClientSecret ] = React.useState('');
    const [phoneNumber, setphoneNumber] = React.useState('');
    const handleCheckout = async () => {
        //const cart = localStorage.getItem('cart');
    const token = Cookies.get('token');
    const csrf_token = Cookies.get('csrf_token');
        askforpayment(cart,token,csrf_token).then(
            (res) => {
                setClientSecret(res.clientSecret);
                setphoneNumber(res.phoneNumber);
            }
        )
        setOpen(true);
    };
    const handleDialogClose = () => {
        setOpen(false);
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            
            <Typography variant="h4" gutterBottom>
                Shopping Cart
            </Typography>
            <List>
                {cart.map((item) => (
                    <React.Fragment key={item.id}>
                        <ListItem alignItems="flex-start">
                            <ListItemAvatar>
                                <Avatar
                                    variant="square"
                                    src={`/path/to/images/${item.id}.jpg`} // Update with actual image paths
                                    alt={item.name}
                                    sx={{ width: 80, height: 80 }}
                                />
                            </ListItemAvatar>
                            <ListItemText
                                primary={
                                    <Typography variant="h6">
                                        {item.name}
                                    </Typography>
                                }
                                secondary={
                                    <>
                                        <Typography variant="body2" color="text.secondary">
                                            Original Price: <s>${item.org_price}</s>
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Discount: {item.discount}%
                                        </Typography>
                                        <Typography variant="body1" color="primary">
                                            Discounted Price: ${item.discount_price}
                                        </Typography>
                                    </>
                                }
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, flexDirection: 'column' }}>
                                <ButtonGroup size="small" aria-label="small outlined button group">
                                    <Button onClick={() => handleDecrement(item.id)}>
                                        <RemoveIcon />
                                    </Button>
                                    <Button>{item.quantity}</Button>
                                    <Button onClick={() => handleIncrement(item.id)}>
                                        <AddIcon />
                                    </Button>
                                </ButtonGroup>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Total: ${(item.discount_price * item.quantity).toFixed(2)}
                                </Typography>
                                <Button
                                    startIcon={<DeleteIcon />}
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => handleRemoveItem(item.id)}
                                    sx={{ mt: 1 }}
                                >
                                    Remove
                                </Button>
                            </Box>
                        </ListItem>
                        <Divider variant="inset" component="li" />
                    </React.Fragment>
                ))}
            </List>
            {cart.length > 0 && (
                <>
                    <Divider sx={{ my: 3 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Button onClick={backpage} variant="outlined" color="secondary" size="large">
        Cancel
    </Button>
                        <Typography variant="h5">
                            Total: ${totalAmount}
                        </Typography>
                            <Button variant="contained" color="primary" size="large" onClick={handleCheckout}>
                                Proceed to Checkout
                            </Button>
                    </Box>
                </>
            )}
            {cart.length === 0 && (
                <Typography variant="h6" color="textSecondary">
                    Your cart is empty.
                </Typography>
            )}

            {/* Payment Dialog */}
            <Dialog open={open} onClose={handleDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>Order Summary</DialogTitle>
                <DialogContent>
                    <List>
                        {cart.map((item) => (
                            <ListItem key={item.id}>
                                <ListItemText
                                    primary={item.name}
                                    secondary={`Quantity: ${item.quantity} - Total: $${(item.discount_price * item.quantity).toFixed(2)}`}
                                />
                            </ListItem>
                        ))}
                    </List>
                    <Divider sx={{ my: 2 }} />
                    <Payment cart={cart} clientSecret = { clientSecret } phoneNumber={phoneNumber}/>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose} color="secondary">
                        Cancel
                    </Button>
                    
                </DialogActions>
            </Dialog>
        </Box>
    )
}
