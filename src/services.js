import axios from 'axios';
const REACT_APP_API_URL = "https://192.168.56.1:80"  //"https://127.0.0.1:80";


const api = axios.create({
    baseURL: REACT_APP_API_URL,
    timeout: 30000,
    withCredentials: true,
});

const createaccount = async (fname, lname, email, phoneNumber, password) => {
    const response = await api.post('/createaccount', {
        withCredentials: true,
        body: { fname, lname, email, phoneNumber, password }
    });
    return response;
}

const login = async (email, password) => {
    const response = await api.post('/login', {
        withCredentials: true,
        body: { email, password },
    });
    return response;
}

const fetchfromserver = async (token, csrfToken) => {
    const resp = await api.get('/api/cart',
        {
                withCredentials: true,
                headers:{
                    'x-access-token': token,
                    'X-CSRF-TOKEN': csrfToken
                },
            }
        );
        if(resp.status == 200){
            return  resp.data['cart'];
        }
        else{
            return [];
        }
}


const syncCartWithServer = async (cart, token, csrfToken) => {
    try{
        const resp = await api.post(
            '/logout',
            {cart},
            { 
                withCredentials: true,
                headers: {
                    'x-access-token': token,
                    'X-CSRF-TOKEN': csrfToken
                }
            }
        );
            return resp;
        }
        catch(error){
            return error;
        }
}


const getAllproducts = async (token, csrfToken) => {
    try{
        const resp = await api.get('/getallproducts', {
            withCredentials: true,
            headers:{
                'x-access-token': token,
                'X-CSRF-TOKEN': csrfToken
            }
        });
        return resp.data;
    }
    catch(error){
        console.error("error: ", error);
        throw error;
    }
}

const getallorders = async (token, csrfToken) =>{
    try{
        const resp = await api.get('/user/orders', {
            withCredentials: true,
            headers:{
                'x-access-token': token,
                'X-CSRF-TOKEN': csrfToken
            }
        });
        return resp.data;
    }
    catch(error){
        console.error("error: ", error);
        throw error;
    }
}

const getorderdetails = async (orderId, token, csrf_token) =>{
    try{
        const resp = await api.get(`/user/orders/${orderId}`, {
        headers: {
        'x-access-token': token,
        'X-CSRF-TOKEN': csrf_token,
        },
        });
        return resp;
    }
    catch(err){
        console.log(err);
    }
}

const getCategories = async (token, csrfToken) => {
    try {
        // const csrfToken = getCsrfToken();
        // console.log("csrftoken: ", csrfToken)
        const response = await api.get('/categories',{
            withCredentials: true,
            headers:{
                'x-access-token': token,
                'X-CSRF-TOKEN': csrfToken
            }
        });
        return response.data['categories'];
    } catch (error) {
        console.error('Action failed:', error);
        return "401";
    }
};



const protectedroutes = async () =>{
    try{
        const resp = await api.get('/protected',{ withCredentials: true });
        console.log(resp);
    }
    catch(err){
        console.log(err);
    }
}


const askforpayment = async (cart, token, csrftoken) => {
    try{
        const resp = await api.post(
            '/create-payment-intent',
            {cart},
            { 
                withCredentials: true,
                headers: {
                    'x-access-token': token,
                    'X-CSRF-TOKEN': csrftoken
                }
            }
        )
        return resp.data;
    }
    catch(err){
        console.log(err);
        return '';
    }
}

const databasentrypayment = async (cart, token, csrf_token, paymentIntentId) =>{
    const resp = await api.post(
        '/paymentdatabaseentry',
        {
            paymentIntentId,
            cart: JSON.parse(localStorage.getItem('cart')),
        },
        {
            headers: {
                'x-access-token': token,
                'X-CSRF-TOKEN': csrf_token,
            }
        }
    );
    return resp;
}

const setcookie= async () =>{
    const resp = await api.get('/setcookies');
    console.log(resp)
}
const getcookie = async () =>{
    const resp = await api.post('/getcookies');
    console.log(resp);
}
export { login, createaccount, getCategories, getAllproducts, syncCartWithServer, fetchfromserver, protectedroutes, askforpayment, databasentrypayment, getallorders,  getorderdetails, getcookie, setcookie};