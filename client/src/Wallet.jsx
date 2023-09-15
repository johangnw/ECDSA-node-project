import server from "./server";
import * as secp from 'ethereum-cryptography/secp256k1';
import {toHex} from 'ethereum-cryptography/utils';
import * as keccak from 'ethereum-cryptography/keccak';



function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onChange(evt) {
    const privateKey = evt.target.value;
    setPrivateKey(privateKey);
    const publicKey = secp.secp256k1.getPublicKey(privateKey);
    const ethAddress = (toHex(keccak.keccak256(publicKey)).slice(1)).slice(-20);
    setAddress(ethAddress);
    if (ethAddress) {
      const {
        data: { balance },
      } = await server.get(`balance/${ethAddress}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1 className="title">Your Wallet</h1>

      <label>
        Private Key
        <input placeholder="Type in private key" value={privateKey} onChange={onChange}></input>
      </label>

      <div className="address">
        Address: {address}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
