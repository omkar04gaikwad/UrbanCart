from flask import Flask, request, jsonify, make_response, redirect
from flask_sqlalchemy import SQLAlchemy
import uuid  # for public id
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from flask_cors import CORS
import stripe

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["http://localhost:3000", "http://192.168.56.1:3000", "https://subtle-snapper-just.ngrok-free.app"]}}, supports_credentials=True)  # This will enable CORS for all routes
# Database configuration
app.config['SECRET_KEY'] = 'urbancartversion1'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://urbancartdb:Urbancart#8451939709@urbancart-db.cjqiwqyiq6o2.us-east-2.rds.amazonaws.com:5432/shoppingapp'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    password = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    address = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    phone_number = db.Column(db.String(15), nullable=False)

class Category(db.Model):
    __tablename__ = 'categories'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

    products = db.relationship('Product', backref='category', lazy=True)

class Product(db.Model):
    __tablename__ = 'products'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    org_price = db.Column(db.Numeric(10, 2), nullable=False)
    discount = db.Column(db.Numeric(5, 2), nullable=False)
    discount_price = db.Column(db.Numeric(10, 2), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=False)
    stock = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    __tablename__ = 'orders'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    total = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(50), nullable=False)

    user = db.relationship('User', backref='orders')
    order_items = db.relationship('OrderItem', backref='order', lazy=True)
    payment = db.relationship('Payment', backref='order', uselist=False)

class OrderItem(db.Model):
    __tablename__ = 'orderitems'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)

    product = db.relationship('Product', backref='order_items')

class Review(db.Model):
    __tablename__ = 'reviews'
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    product = db.relationship('Product', backref='reviews')
    user = db.relationship('User', backref='reviews')

class Payment(db.Model):
    __tablename__ = 'payments'
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('orders.id'), nullable=False)
    payment_method = db.Column(db.String(50), nullable=False)
    payment_status = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Cart(db.Model):
    __tablename__ = 'cart'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('products.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref='cart_items')
    product = db.relationship('Product', backref='cart_items')

class JWToken(db.Model):
    __tablename__ = 'jwttokens'
    id = db.Column(db.Integer, primary_key=True)
    token = db.Column(db.String(500), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('jwttokens', lazy=True))


@app.after_request
def add_cors_headers(response):
    allowed_origins = ["http://localhost:3000", "http://192.168.56.1:3000", "https://subtle-snapper-just.ngrok-free.app"]
    origin = request.headers.get('Origin')
    if origin in allowed_origins:
        response.headers.add('Access-Control-Allow-Origin', origin)
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-TOKEN, x-access-token')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    return response
db.init_app(app)
# Decorator for verifying the JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        csrf_token = None
        if 'x-access-token' in request.headers and 'X-CSRF-TOKEN' in request.headers:
            csrf_token = request.headers['X-CSRF-TOKEN']
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing !!'}), 401
        
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
            current_user = User.query.filter_by(id=data['id']).first()
            # Check if token is in the database
            token_entry = User.query.filter_by(id=data['id']).first()
            csrf_user = JWToken.query.filter_by(token=csrf_token).first()
            if token_entry.id != csrf_user.user_id:
                raise Exception("Usernotfound")
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            return jsonify({'message': e}), 401
        return f(current_user, *args, **kwargs)

    return decorated



@app.route('/')
def index():
    return "Hello, this is Shopping API"


@app.route('/createaccount', methods=['POST'])
def create_account():
    data = request.get_json()['body']
    hashed_password = generate_password_hash(data['password'], method='sha256')
    new_user = User(
        name=data['fname'],
        last_name=data['lname'],
        password=hashed_password,
        email=data['email'],
        address=data.get('address'),
        created_at=datetime.utcnow(),
        phone_number=data['phoneNumber']
    )
    try:
        db.session.add(new_user)
        db.session.commit()
        return jsonify({"message": "Account created successfully", "code":200})
    except Exception as e:
        return jsonify({"message": e, "code":400})

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()['body']
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return make_response('Could not verify', 401)
    token = jwt.encode({'id': user.id, 'exp': datetime.utcnow() + timedelta(days=365)}, app.config['SECRET_KEY'])
    csrf_token = uuid.uuid4().hex
    # Save token in the database
    new_token = JWToken(token=csrf_token, user_id=user.id)
    db.session.add(new_token)
    db.session.commit()
    resp = make_response(jsonify({"message": "Login successful", "code":200, "token": token, "csrf_token":csrf_token}))
    return resp



@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    return jsonify({"message":"current_user"})


@app.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    cart_items = request.get_json().get('cart', [])
    user_id = current_user.id
    Cart.query.filter_by(user_id=user_id).delete()
    for item in cart_items:
        new_item = Cart(
            user_id = user_id,
            product_id = item['id'],
            quantity = item['quantity']
        )
        db.session.add(new_item)
    token = request.headers['X-CSRF-TOKEN']
    token_entry = JWToken.query.filter_by(token=token).first()
    if token_entry:
        db.session.delete(token_entry)
    try:
        db.session.commit()
        return jsonify({'message': 'Successfully logged out'}), 200
    except Exception as e:
        return jsonify({'message': e}), 401


@app.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user):
    categories = Category.query.all()
    categoryoutput = []
    for category in categories:
        category_data = {'id': category.id, 'name':category.name}
        categoryoutput.append(category_data)
    return jsonify({'categories':categoryoutput})

@app.route('/getallproducts', methods=['GET'])
@token_required
def getallproducts(current_user):
    products = Product.query.all()
    output = []
    for product in products:
        category = Category.query.filter_by(id=product.category_id).first()
        product_data = {
            'category': category.name,
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'org_price': product.org_price,
            'discount': product.discount,
            'discount_price': product.discount_price,
            'stock': product.stock,
            'created_at': product.created_at
        }
        output.append(product_data)
    return jsonify({'products': output}), 201

@app.route('/api/cart', methods=['GET'])
@token_required
def get_cart(current_user):
    user_id = current_user.id
    cart_items = Cart.query.filter_by(user_id=user_id).all()
    cart = []
    for item in cart_items:
        product = Product.query.filter_by(id=item.product_id).first()
        cart.append({
            'id': item.id,
            'name': product.name,
            'quantity': item.quantity,
            'org_price': product.org_price,
            'discount': product.discount,
            'discount_price': product.discount_price
        })
    return jsonify({'cart':cart})

import stripe

stripe.api_key = 'sk_test_51PmJZ52MJdyBH0mnYZZIpBhcVu12qHo8bHlQyui9hah8JyytyW4xgfXfQ6otZtPD2DdPxQWoy1VZa7ansr3QFrMH00GCJ6JCH3'

@app.route('/create-payment-intent', methods=['POST'])
@token_required
def create_payment_intent(current_user):
    try:
        cart_items = request.get_json()['cart']
        # Calculate the total amount for the PaymentIntent
        total_amount = 0
        for item in cart_items:
            total_amount += float(item['discount_price']) * item['quantity']
        
        # Convert total amount to cents as Stripe expects amount in cents
        total_amount = int(total_amount * 100)

        # Create a PaymentIntent with the order amount and currency
        payment_intent = stripe.PaymentIntent.create(
            amount=int(total_amount * 100),  # Stripe works with smallest currency unit
            currency='usd',
            payment_method_types=['card'],
        )

        return jsonify({
            'clientSecret': payment_intent['client_secret'],
            'phoneNumber': current_user.phone_number,
        })
    except Exception as e:
        return jsonify(error=str(e)), 403

# Webhook endpoint for Stripe to send events to your server
@app.route('/webhook', methods=['POST'])
def stripe_webhook():
    payload = request.get_data(as_text=True)
    sig_header = request.headers.get('Stripe-Signature')
    endpoint_secret = 'whsec_3162cf442499921ca36c902d7f470dc80178b9e849c15d254f421941384750ce'

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError as e:
        print(e)
        return 'Invalid payload', 400
    except stripe.error.SignatureVerificationError as e:
        print(e)
        # Invalid signature
        return 'Invalid signature', 400

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        payment_intent = event['data']['object']
        handle_successful_payment(payment_intent)
    elif event['type'] == 'payment_intent.payment_failed':
        payment_intent = event['data']['object']
        handle_failed_payment(payment_intent)
    # Add more event types as needed

    return '', 200
def handle_successful_payment(payment_intent):
    payment_intent_id = payment_intent['id']

    try:
        # Find the payment record in the database
        payment = Payment.query.filter_by(payment_method=payment_intent_id).first()
        print(payment)
        order = Order.query.filter_by(id=payment.order_id).first()

        if payment and order:
            # Update the payment and order status to 'Completed'
            payment.payment_status = 'Completed'
            order.status = 'Completed'
            
            # Retrieve the order items
            order_items = OrderItem.query.filter_by(order_id=order.id).all()

            # Reduce stock for each product based on the quantity in the order
            for item in order_items:
                product = Product.query.filter_by(id=item.product_id).first()
                if product:
                    product.stock -= item.quantity
                    if product.stock < 0:
                        product.stock = 0  # Ensure stock doesn't go negative
            
            db.session.commit()
            print(f"Payment {payment_intent_id} completed successfully.")
        else:
            print(f"Payment record for {payment_intent_id} or order not found.")
        
    except Exception as e:
        db.session.rollback()
        print(f"Error updating payment status or reducing stock: {str(e)}")


def handle_failed_payment(payment_intent):
    payment_intent_id = payment_intent['id']

    try:
        # Find the payment record in the database
        payment = Payment.query.filter_by(payment_method=payment_intent_id).first()
        orders = Order.query.filter_by(id=payment.order_id).first()
        if payment and orders:
            payment.payment_status = 'Failed'
            orders.status = 'Completed'
            db.session.commit()
            print(f"Payment {payment_intent_id} failed.")
        else:
            print(f"Payment record for {payment_intent_id} not found.")

    except Exception as e:
        db.session.rollback()
        print(f"Error updating payment status: {str(e)}")

@app.route('/paymentdatabaseentry', methods=['POST'])
@token_required
def adddbpayment(current_user):
    data = request.get_json()
    cart = data.get('cart', [])
    payment_intent_id = data.get('paymentIntentId')

    try:
        # 1. Insert into ORDERS table
        total_amount = sum([float(item['discount_price']) * item['quantity'] for item in cart])
        new_order = Order(
            user_id=current_user.id,
            total=total_amount,
            status='Processing',  # Set initial status
            created_at=datetime.utcnow()
        )
        db.session.add(new_order)
        db.session.flush()  # Flush to get the order_id

        # 2. Insert into ORDERITEMS table
        for item in cart:
            new_order_item = OrderItem(
                order_id=new_order.id,
                product_id=item['id'],
                quantity=item['quantity'],
                price=float(item['discount_price'])
            )
            db.session.add(new_order_item)

        # 3. Insert into PAYMENTS table
        new_payment = Payment(
            order_id=new_order.id,
            payment_method=payment_intent_id,
            payment_status='Pending',  # Initially set as pending
            amount=total_amount,
            created_at=datetime.utcnow()
        )
        db.session.add(new_payment)

        # Commit all changes
        db.session.commit()

        return jsonify({"message": "Order and payment recorded successfully"}), 200

    except Exception as e:
        db.session.rollback()  # Rollback on error
        return jsonify({"error": str(e)}), 500


@app.route('/user/orders', methods=['GET'])
@token_required
def get_user_orders(current_user):
    try:
        # Query the orders for the current user
        orders = Order.query.filter_by(user_id=current_user.id).all()
        
        # Prepare the response
        orders_list = []
        for order in orders:
            order_items = OrderItem.query.filter_by(order_id=order.id).all()
            items = []
            for item in order_items:
                product = Product.query.filter_by(id=item.product_id).first()
                items.append({
                    'product_name': product.name,
                    'quantity': item.quantity,
                    'price': item.price
                })
            
            orders_list.append({
                'order_id': order.id,
                'created_at': order.created_at,
                'status': order.status,
                'total_amount': order.total,
                'items': items
            })

        return jsonify(orders_list), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.route('/user/orders/<order_id>', methods=['GET'])
@token_required
def get_order_details(current_user, order_id):
    try:
        # Fetch the order by ID and check if it belongs to the current user
        order = Order.query.filter_by(id=order_id, user_id=current_user.id).first()
        
        if not order:
            return jsonify({'error': 'Order not found or not authorized'}), 404

        # Fetch the items associated with the order
        order_items = OrderItem.query.filter_by(order_id=order.id).all()
        items = []
        for item in order_items:
            product = Product.query.filter_by(id=item.product_id).first()
            items.append({
                'product_name': product.name,
                'quantity': item.quantity,
                'price': item.price
            })
        payment_details = Payment.query.filter_by(order_id=order.id).first()
        # Prepare the response with order details
        order_details = {
            'order_id': order.id,
            'created_at': order.created_at,
            'status': order.status,
            'total_amount': order.total,
            'payment_method': payment_details.payment_method,  # Assuming there's a payment_method field
            'items': items
        }

        return jsonify(order_details), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/setcookies', methods=['GET'])
def set_cookie():
    token = "Hello"
    csrf_token = "Hello"
    resp = make_response(redirect('http://192.168.56.1:3000/'))
    resp.set_cookie('token', value=token, path='/', httponly=True, samesite='None', secure=False)
    return resp
@app.route('/getcookies', methods=['POST'])
def get_cookie():
    token = request.cookies
    print(token)
    return jsonify({"token":token}),200
if __name__ == '__main__':
    app.run(host='192.168.56.1', port=80,  debug=True)