import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MoreIcon from '@mui/icons-material/MoreVert';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Select from '@mui/material/Select';
import { getCategories, syncCartWithServer, getAllproducts, getallorders } from '../../services';
import { ItemList } from './ItemList/ItemList';
import Cookies from 'js-cookie';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export const Items = ({ cart, setCart }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const [category, setCategory] = React.useState('');
  const [products, setProducts] = React.useState([]);
  const [orders, setOrders] = React.useState([]);
  const [masterProducts, setMasterProducts] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  

  const location = useLocation();
  const navigate = useNavigate();
  const token = Cookies.get('token');
  const csrfToken = Cookies.get('csrf_token');

  React.useEffect(() => {
    const fetchData = async () => {
      const fetchedCategories = await getCategories(token, csrfToken);
      const pcds = await getAllproducts(token, csrfToken);
      const fetchedOrders = await getallorders(token, csrfToken);

      setCategories(fetchedCategories);
      setMasterProducts(pcds.products);
      setProducts(shuffleArray(pcds.products));
      setOrders(fetchedOrders);

      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    };
    fetchData();
  }, [token, csrfToken, setCart]);

  const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
    const filteredProducts = masterProducts.filter(product => product.category === selectedCategory);
    setProducts(filteredProducts);
  };

  const handleCartClick = () => navigate('/items/cart');
  const handleOrders = () => navigate('/items/orders');
  const handleItemPage = () => navigate('/items');

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMobileMenuClose = () => setMobileMoreAnchorEl(null);
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };
  const handleMobileMenuOpen = (event) => setMobileMoreAnchorEl(event.currentTarget);

  const handleLogout = async () => {
    const logout = await syncCartWithServer(cart, token, csrfToken);
    if (logout.status === 200) {
      localStorage.removeItem('cart');
      Cookies.remove('token');
      Cookies.remove('csrf_token');
      navigate('/');
    } else {
      alert("Trouble logging out");
      window.location.reload();
    }
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      const searchTerm = event.target.value.replace(/<\/?[^>]+(>|$)/g, "").toLowerCase(); // sanitize input
      const filteredProducts = masterProducts.filter(product => 
        product.name.toLowerCase().includes(searchTerm)
      );
      setProducts(filteredProducts);
    }
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleOrders}>Orders</MenuItem>
      <MenuItem onClick={handleLogout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleCartClick}>
        <IconButton size="large" aria-label={`show ${cart.reduce((total, item) => total + item.quantity, 0)} items`} color="inherit">
          <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="error">
            <ShoppingCartIcon />
          </Badge>
        </IconButton>
        <p>Cart</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton size="large" aria-label="account of current user" aria-controls="primary-search-account-menu" aria-haspopup="true" color="inherit">
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton size="large" edge="start" color="inherit" aria-label="open drawer" sx={{ mr: 2 }} onClick={handleItemPage}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ display: { xs: 'none', sm: 'block' } }} onClick={handleItemPage}>
            UrbanCart
          </Typography>
          <Box sx={{ m: 1, minWidth: 120, marginRight: 2 }}>
            <Select
              labelId="categories-label"
              id="categories-select"
              value={category}
              onChange={handleCategoryChange}
              fullWidth
              label="Categories"
              displayEmpty
              inputProps={{ 'aria-label': 'Without label' }}
              sx={{
                color: 'white',
                '& .MuiSelect-icon': {
                  color: 'white',
                },
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 0,
                },
              }}
              disabled={location.pathname !== '/items'}
            >
              <MenuItem value='' style={{ display: "none" }} disabled>
                Categories
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.name} value={category.name}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase placeholder="Search…" inputProps={{ 'aria-label': 'search' }} onKeyPress={handleSearch} />
          </Search>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton size="large" color="inherit" aria-label={`show ${cart.reduce((total, item) => total + item.quantity, 0)} items`} onClick={handleCartClick}>
              <Badge badgeContent={cart.reduce((total, item) => total + item.quantity, 0)} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton size="large" edge="end" aria-label="account of current user" aria-controls={menuId} aria-haspopup="true" onClick={handleProfileMenuOpen} color="inherit">
              <AccountCircle />
            </IconButton>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton size="large" aria-label="show more" aria-controls={mobileMenuId} aria-haspopup="true" onClick={handleMobileMenuOpen} color="inherit">
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
      {location.pathname === '/items' && (
        <ItemList products={products} setCart={setCart} cart={cart} />
      )}
      <Outlet context={{ orders, setOrders }} />
    </Box>
  );
};
