from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
import uuid  # for public id
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from datetime import datetime, timedelta
from functools import wraps
from dotenv import load_dotenv
import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from database.database import db, User, Category, Product, Order, OrderItem, Review, Payment, Cart, JWToken
from flask_cors import CORS
import firebase_admin
from firebase_admin import auth, credentials



cred = credentials.Certificate('serviceauthkey.json')
firebase_admin.initialize_app(cred)


app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes
# Database configuration
app.config['SECRET_KEY'] = 'your secret key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql+psycopg2://admin:admin@localhost:5432/shopping_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
@app.after_request
def add_cors_headers(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    return response

# Decorator for verifying the JWT
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'x-access-token' in request.headers:
            token = request.headers['x-access-token']
        if not token:
            return jsonify({'message': 'Token is missing !!'}), 401

        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms="HS256")
            current_user = User.query.filter_by(id=data['id']).first()
            # Check if token is in the database
            token_entry = User.query.filter_by(id=data['id']).first()
            print(token_entry)
            if not token_entry:
                raise Exception("Token not found in database")
        except Exception as e:
            print(e)
            return jsonify({'message': 'Token is invalid !!'}), 401
        return f(current_user, *args, **kwargs)

    return decorated

db.init_app(app)

@app.route('/')
def index():
    return "Hello, this is Shopping API"


@app.route('/createaccount', methods=['POST'])
def create_account():
    data = request.get_json()['body']
    print(data)
    # hashed_password = generate_password_hash(data['password'], method='sha256')
    # new_user = User(
    #     name=data['name'],
    #     last_name=data['last_name'],
    #     password=hashed_password,
    #     email=data['email'],
    #     address=data.get('address'),
    #     created_at=datetime.utcnow(),
    #     phone_number=data['phone_number']
    # )
    # db.session.add(new_user)
    # db.session.commit()
    return jsonify({"message": "User created successfully"}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    print(data)
    # user = User.query.filter_by(email=data['email']).first()
    # if not user or not check_password_hash(user.password, data['password']):
    #     return make_response('Could not verify', 401, {'WWW-Authenticate': 'Basic realm ="Login required !!"'})
    # print(user.phone_number)
    # token = jwt.encode({'id': user.id, 'exp': datetime.utcnow() + timedelta(days=365)}, app.config['SECRET_KEY'])
    # # Save token in the database
    # new_token = JWToken(token=token, user_id=user.id)
    # db.session.add(new_token)
    # db.session.commit()

    return jsonify({'token': 'token'}), 200



@app.route('/protected', methods=['GET'])
@token_required
def protected(current_user):
    return jsonify({'message': 'This is a protected route', 'user': current_user.name})


@app.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    token = request.headers['x-access-token']
    token_entry = JWToken.query.filter_by(token=token).first()
    if token_entry:
        db.session.delete(token_entry)
        db.session.commit()
    return jsonify({'message': 'Successfully logged out'}), 200


@app.route('/categories', methods=['GET'])
@token_required
def get_categories(current_user):
    categories = Category.query.all()
    categoryoutput = []
    for category in categories:
        category_data = {'id': category.id, 'name':category.name}
        categoryoutput.append(category_data)
    return jsonify({'categories':categoryoutput}), 201

@app.route('/products/<category_id>', methods=['GET'])
@token_required
def get_products(current_user, category_id):
    products = Product.query.filter_by(category_id=category_id).all()
    category = Category.query.filter_by(id=category_id).first()
    output = []
    for product in products:
        product_data = {
            'category': category.name,
            'id': product.id,
            'name': product.name,
            'description': product.description,
            'org_price': product.org_price,
            'discount_price': product.discount_price,
            'stock': product.stock,
            'created_at': product.created_at
        }
        output.append(product_data)
    return jsonify({'products': output}), 201


@app.route('/send-otp', methods=['POST'])
def send_otp():
    phone_number = request.form['phoneNumber']
    print(phone_number)
    try:
        session_info = auth.generate_sign_in_with_phone_number(phone_number)
        return jsonify({'sessionInfo': session_info}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)