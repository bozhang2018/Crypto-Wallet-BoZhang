from flask import Flask, request, jsonify, redirect, session, render_template
from flask_bcrypt import Bcrypt #https://pypi.org/project/Flask-Bcrypt/
from flask_cors import CORS, cross_origin #https://flask-cors.readthedocs.io/en/latest/
from models import db, User, Crypto_account, Public_address, Transaction
from datetime import datetime, timedelta
import blockcypher
import os
import qrcode
import base64
import time
from dotenv import load_dotenv
from io import BytesIO

app = Flask(__name__, template_folder='build', static_folder='build', static_url_path='')
app.secret_key = 'cairocoders-ednalan'
# app.config['SECRET_KEY'] = 'cairocoders-ednalan'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///flaskdb.db'

SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ECHO = True

load_dotenv()
token = os.getenv("token")

bcrypt = Bcrypt(app) 
CORS(app, supports_credentials=True)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/api/signup", methods=["POST"])
def signup():
    email = request.json["email"]
    password = request.json["password"]
 
    user_exists = User.query.filter_by(email=email).first() is not None
 
    if user_exists:
        return jsonify({"error": "Email already exists"}), 409
     
    hashed_password = bcrypt.generate_password_hash(password)
    new_user = User(email=email, password=hashed_password)
    db.session.add(new_user)
    db.session.commit()
 
    session["user_id"] = new_user.id
 
    return jsonify({
        "message": "Successfully signed up. Please Login.",
        "id": new_user.id,
        "email": new_user.email
    })

@app.route("/api/login", methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]
  
    user = User.query.filter_by(email=email).first()
  
    if user is None:
        return jsonify({"error": "Unauthorized Access"}), 401
  
    if not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Unauthorized"}), 401
      
    session["user_id"] = user.id
    return jsonify({
        "id": user.id,
        "email": user.email
    })

# Define a route to retrieve addresses by id (UUIDv4)
@app.route("/api/getAccount", methods=["GET"])
def get_account():
    desired_id = session["user_id"]
    # Query the database for addresses with the specified UUIDv4 id
    accounts = Crypto_account.query.filter_by(id=desired_id).all()

    # Check if any accounts were found
    if not accounts:
        return jsonify(message=f"No addresses found for id {desired_id}")

    # Extract addresses from the accounts
    addresses = [account.address for account in accounts]
    user_info = User.query.filter_by(id=desired_id).all()
    user_name = user_info[0].email

    return jsonify(addresses=addresses, user_name=user_name)

@app.route("/api/searchWallet<address>", methods=["GET"])
def search_wallet(address):
    # id = request.json["id"]
    # address = request.json["address"]

    id = session["user_id"]
    # Query the database to find the matching record
    record = Public_address.query.filter_by(id=id, address=address).first()
    # Calculate the current time
    # DATETIME - format: YYYY-MM-DD HH:MI:SS
    current_time = datetime.utcnow()
    # Check if the record exists and the update_time is within the last 30 minutes
    if record and current_time - record.update_time <= timedelta(minutes=30):
        record.update_time = current_time
        db.session.commit()
        return jsonify(message=f"The address '{address}' is valid.")
    else:
        # check blockcypher api
        try:
            # if you use mainnet and check addresses there, remove the arg 'bcy'
            acc_info = blockcypher.get_address_overview(address, coin_symbol='bcy')
        except Exception as e:
            # Handle the exception
            return jsonify(message=f"The address '{address}' is NOT valid.")
        else:
            if record:
                record.update_time = current_time
                db.session.commit()
                return jsonify(message=f"The address '{address}' is valid and updated.")
            else:
                # Address does not exist with the same id, insert a new record
                new_record = Public_address(id=id, address=address, update_time=current_time)
                db.session.add(new_record)
                db.session.commit()
                return jsonify(message=f"The address '{address}' is valid.")

@app.route('/api/getWallet/<wallet_address>', methods=["GET"])
def get_wallet(wallet_address):
    # id = request.json["id"]
    address = wallet_address

    print(address)
    ## get wallet info
    # get wallet privkey
    wallet = Crypto_account.query.filter_by(address=address).all()
    privkey = wallet[0].privkey
    # Create a QR code instance
    qr = qrcode.QRCode(
        version=1,  # version control the image size: 1 -> (21 x 21)
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    # Add the wallet address to the QR code
    qr.add_data(address)
    qr.make(fit=True)
    # Create a PIL image from the QR code
    img = qr.make_image(fill_color="black", back_color="white")
    # Save the image to a BytesIO buffer
    buffer = BytesIO()
    img.save(buffer)
    buffer.seek(0)
    # Convert the image to a base64-encoded string
    image_base64 = base64.b64encode(buffer.read()).decode('utf-8')
    
    # get address details info from blockcypher api
    try:
        # if you use mainnet and check addresses there, remove the arg 'bcy'
        acc_info = blockcypher.get_address_overview(address, coin_symbol='bcy')
    except Exception as e:
        # Handle the exception
        return jsonify(message=f"The address '{address}' is NOT valid.")

    # Add the 'image_base64' to the 'acc_info' dictionary
    acc_info['qr_code'] = image_base64
    acc_info['privkey'] = privkey

    ## get transactions info associated with this account
    # Use SQLAlchemy's or_ function to find records matching the address in either column
    current_time = datetime.utcnow()
    matching_transactions = Transaction.query.filter(
        db.or_(Transaction.address_from == address, Transaction.address_to == address)
    ).all()
    # get new status for pending transactions from blockchain, commit back to db
    for transaction in matching_transactions:
        if transaction.confirmation < 6:
            trans_info = blockcypher.get_transaction_details(transaction.tx_ref, coin_symbol='bcy')
            transaction.time = trans_info["confirmed"]
            if transaction.time is None:
                transaction.time = current_time
            transaction.confirmation = trans_info["confirmations"]
            if trans_info["confirmations"] >= 6:
                transaction.status = 'completed'
            else:
                transaction.status = 'pending'
            db.session.commit()
    time.sleep(0.1)
    # get new status from db for all transactions
    matching_transactions = Transaction.query.filter(
        db.or_(Transaction.address_from == address, Transaction.address_to == address)
    ).all()
    # Convert the matching records to a list of dictionaries
    result = []
    for transaction in matching_transactions:
        result.append({
            'tx_ref': transaction.tx_ref,
            'address_from': transaction.address_from,
            'address_to': transaction.address_to,
            'amount': transaction.amount,
            'time': transaction.time,
            'status': transaction.status,
            'confirmation': transaction.confirmation,
            'privkey': transaction.privkey
            # Add other columns as needed
        })
    result.append(acc_info)
    
    return jsonify(result)

@app.route("/api/sendMoney", methods=["POST"])
def send_money():
    # id = request.json["id"]
    privkey = request.json["privkey"]
    address_from = request.json["address_from"]
    address_to = request.json["address_to"]
    amount = request.json["amount"]

    id = session["user_id"]
    current_time = datetime.utcnow()

    # get address details info from blockcypher api
    try:
        # if you use mainnet and check addresses there, remove the arg 'bcy'
        acc_info = blockcypher.get_address_overview(address_from, coin_symbol='bcy')
    except Exception as e:
        # Handle the exception
        return jsonify(message=f"Your sending address '{address_from}' is NOT valid.")
    balance = acc_info["balance"]

    try:
        # if you use mainnet and check addresses there, remove the arg 'bcy'
        acc_info = blockcypher.get_address_overview(address_to, coin_symbol='bcy')
    except Exception as e:
        # Handle the exception
        return jsonify(message=f"The target address '{address_to}' is NOT valid.")

    fee = amount * 0.001  # 0.1 percent of the amount
    if balance < amount + fee:
        return jsonify(message=f"NOT enough funds for this transaction.")

    try:
        # broadcast transcation into blockchain and get an tx_id 
        tx_ref = blockcypher.simple_spend(
        from_privkey=privkey,to_address=address_to,to_satoshis=amount,coin_symbol='bcy',api_key=token)
    except Exception as e:
        # Handle the exception
        return jsonify(message=f"The transaction is NOT successful.")

    time.sleep(0.1)
    # get transaction infor from blockchain
    trans_info = blockcypher.get_transaction_details(tx_ref, coin_symbol='bcy')
    # trans_time = datetime.utcnow()
    trans_time = trans_info["confirmed"]  # if zero confirmation, this value == None
    if trans_time is None:
        trans_time = current_time
    amount = trans_info["total"] - trans_info["fees"]
    trans_confirmation = trans_info["confirmations"]
    if trans_info["confirmations"] >= 6:
        trans_status = 'completed'
    else:
        trans_status = 'pending'
    new_record = Transaction(privkey=privkey, address_from=address_from, address_to=address_to, amount=amount, time=trans_time, status=trans_status, confirmation=trans_confirmation, tx_ref=tx_ref)
    db.session.add(new_record)
    db.session.commit()

    return jsonify(message=f"The transaction '{tx_ref}' is successfully broadcasted.")


@app.route("/api/createWallet", methods=["GET"])
def create_wallet():
    userid = session["user_id"]
    keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)
    address = keypair['address']
    privkey = keypair['private']

    new_record = Crypto_account(id=userid, privkey=privkey, address=address)
    db.session.add(new_record)
    db.session.commit()

    return jsonify({
        "message": "A new wallet is successfully created.",
        "id": userid,
        "privkey": privkey,
        "address": address
    })


def validate_auth():
    if 'user_id' in session:
        return render_template('index.html')
    else: 
        return redirect("/login")


@app.route("/login")
def login_page():
    return render_template('index.html')

@app.route("/logout")
def logout():
    session.pop('user_id', default=None)
    return redirect("/login")

@app.route("/")
def home():
    return validate_auth()

@app.errorhandler(404)
def not_found(e):
    return validate_auth()

if __name__ == '__main__':
    app.run(debug=True)