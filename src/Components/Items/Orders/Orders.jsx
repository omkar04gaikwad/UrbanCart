import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent, Typography, Button } from '@mui/material';
import Cookies from 'js-cookie';
import {getorderdetails} from '../../../services';
export const Orders = () => {
    const { orders } = useOutletContext();
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [open, setOpen] = useState(false);
    const token = Cookies.get('token');
    const csrf_token = Cookies.get('csrf_token');

    const handleClickOpen = async (orderId) => {
        try {
            const response = await getorderdetails(orderId, token, csrf_token); 
        setOrderDetails(response.data);
        setSelectedOrder(orderId);
        setOpen(true);
        } catch (error) {
        console.error('Error fetching order details:', error);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedOrder(null);
        setOrderDetails(null);
    };
    return (
        <div>
        <Typography variant="h4" gutterBottom>
            My Orders
        </Typography>
        <List>
            {orders.map((order) => (
            <ListItem button key={order.order_id} onClick={() => handleClickOpen(order.order_id)}>
                <ListItemText
                primary={`Order #${order.order_id}`}
                secondary={`Date: ${new Date(order.created_at).toLocaleDateString()} - Status: ${order.status}`}
                />
            </ListItem>
            ))}
        </List>
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Order Details</DialogTitle>
            <DialogContent>
            {orderDetails ? (
                <>
                <Typography variant="h6">Order ID: {orderDetails.order_id}</Typography>
                <Typography variant="subtitle1">Payment Method: {orderDetails.payment_method}</Typography>
                <Typography variant="subtitle1">Total Amount: ${orderDetails.total_amount}</Typography>
                <Typography variant="h6" gutterBottom>
                    Items Ordered:
                </Typography>
                {orderDetails.items.map((item, index) => (
                    <Typography key={index} variant="body2">
                    {item.product_name} - {item.quantity} x ${item.price} = ${item.quantity * item.price}
                    </Typography>
                ))}
                </>
            ) : (
                <Typography>Loading order details...</Typography>
            )}
            <Button onClick={handleClose} color="primary">
                Close
            </Button>
            </DialogContent>
        </Dialog>
        </div>
    )
}
