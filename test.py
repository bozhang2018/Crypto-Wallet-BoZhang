import blockcypher
import os
from dotenv import load_dotenv
from datetime import datetime, timedelta

if __name__ == '__main__':
    load_dotenv()
    token = os.getenv("token")

    # last_height = blockcypher.get_latest_block_height(coin_symbol='bcy',api_key=token)
    # print("The latest BCY block height is:", last_height)

    keypair = blockcypher.generate_new_address(coin_symbol='bcy',api_key=token)
    print("My address is", keypair['address'])
    print(keypair)

    # acc_info = blockcypher.get_address_overview('C3gca3oyaZbQgP21QfSRHfBa7WmHEkATfB', coin_symbol='bcy')
    # print(acc_info)

    # trans_info = blockcypher.get_transaction_details('c9e525e7a3c168a9ab958cc22a80e3baeb1fa200ff4cbf9bc02b12ce05cc7d60', coin_symbol='bcy')
    # print(trans_info)
    # print(trans_info["confirmed"])
    # print(trans_info["confirmations"])
    # print(trans_info["addresses"])
    # print(trans_info["total"] - trans_info["fees"])
    # print(trans_info.keys())

    # address = 'CGCwhY1rvvYWY9PUWjQb1hJW9SS1W141Eu'
    # # address = 'C3gca3oyaZbQgP21QfSRHfBa7WmHEkATfB'
    # faucet_tx = blockcypher.send_faucet_coins(
    # address_to_fund=address,satoshis=1000000,coin_symbol='bcy',api_key=token)
    # print("Faucet txid is", faucet_tx['tx_ref'])