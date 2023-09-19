from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4
 
db = SQLAlchemy()
 
def get_uuid():
    return uuid4().hex
 
class User(db.Model):
    __tablename__ = "users"
    id = db.Column(db.String(11), primary_key=True, unique=True, default=get_uuid)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.Text, nullable=False)

class Crypto_account(db.Model):
    __tablename__ = "crypto_accounts"
    id = db.Column(db.String(11), default=get_uuid)
    privkey = db.Column(db.String(150), primary_key=True, unique=True)
    address = db.Column(db.String(150), unique=True)

class Transaction(db.Model):
    __tablename__ = "transactions"
    privkey = db.Column(db.String(150))
    address_from = db.Column(db.String(150), nullable=False)
    address_to = db.Column(db.String(150), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    time = db.Column(db.DateTime, nullable=False)
    status = db.Column(db.String(20), nullable=False)
    confirmation = db.Column(db.Integer(), nullable=False)
    tx_ref = db.Column(db.String(1000), primary_key=True, nullable=False)

class Public_address(db.Model):
    __tablename__ = "public_addresses"
    id = db.Column(db.String(11), primary_key=True, default=get_uuid)
    address = db.Column(db.String(150), primary_key=True)
    update_time = db.Column(db.DateTime, nullable=False)
