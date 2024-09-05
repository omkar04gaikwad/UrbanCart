import * as React from 'react'
import { Box, Card, CardContent, CardMedia, Grid, Button, ButtonGroup, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Cookies from 'js-cookie';

export const ItemList = ( { products, setCart, cart = []}) => { 
const handleAddToCart = (product) => {
    setCart((prevCart) => {
        const existingProduct = prevCart.find(item => item.id === product.id);
        let updatedCart;
        
        if (existingProduct) {
            updatedCart = prevCart.map(item =>
                item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            );
        } else {
            updatedCart = [...prevCart, { 
                ...product, 
                quantity: 1, 
                org_price: product.org_price, 
                discount: product.discount, 
                discount_price: product.discount_price,
                product_id: product.product_id
            }];
        }

        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
    });
};

const handleIncrement = (productId) => {
    setCart((prevCart) => {
        const updatedCart = prevCart.map(item =>
            item.id === productId ? { 
                ...item, 
                quantity: item.quantity + 1 
            } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
    });
};

const handleDecrement = (productId) => {
    setCart((prevCart) => {
        const updatedCart = prevCart.map(item => 
            item.id === productId && item.quantity > 0
                ? { ...item, quantity: item.quantity - 1 }
                : item
        ).filter(item => item.quantity > 0);  // Remove items with 0 quantity

        localStorage.setItem('cart', JSON.stringify(updatedCart));
        return updatedCart;
    });
};

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Grid container spacing={3}>
            {products.map((product) => {
                const cartItem = cart.find(item => item.id === product.id);
                return (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                    <Card>
                    <CardMedia
                        component="img"
                        height="140"
                        image={`/path/to/images/${product.id}.jpg`} // Update this line to use actual images
                        alt={product.name}
                    />
                    <CardContent>
                        <Typography variant="h5" component="div">
                        {product.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        {product.description}
                        </Typography>
                        <Typography variant="body1" component="div" color="text.secondary" sx={{ textDecoration: 'line-through' }}>
                            Original Price: ${product.org_price}
                        </Typography>
                        <Typography variant="body2" >
                            Discount: {product.discount}%
                        </Typography>
                        <Typography variant="body1" component="div">
                            Discounted Price: ${product.discount_price}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                        Stock: {product.stock}
                        </Typography>
                        {cartItem ? (
                        <ButtonGroup>
                            <Button
                            aria-label="reduce"
                            onClick={() => handleDecrement(product.id)}
                            >
                            <RemoveIcon fontSize="small" />
                            </Button>
                            <Button>{cartItem.quantity}</Button>
                            <Button
                            aria-label="increase"
                            onClick={() => handleIncrement(product.id)}
                            >
                            <AddIcon fontSize="small" />
                            </Button>
                        </ButtonGroup>
                        ) : (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleAddToCart(product)}
                        >
                            Add to Cart
                        </Button>
                        )}
                    </CardContent>
                    </Card>
                </Grid>
                );
            })}
            </Grid>
        </Box>
    )
}
