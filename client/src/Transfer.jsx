import { useState } from "react";
import server from "./server";
import { utf8ToBytes, toHex } from 'ethereum-cryptography/utils';
import * as keccak from 'ethereum-cryptography/keccak';
import * as secp from 'ethereum-cryptography/secp256k1';

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    const dataToSend = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    }

    const bytes = utf8ToBytes(JSON.stringify(dataToSend));
    const hashMsg = toHex(keccak.keccak256(bytes));
    const recoveredBit = secp.secp256k1.sign(hashMsg, privateKey);
    console.log(recoveredBit);
    dataToSend.hash = hashMsg;
    dataToSend.recoveredBit = recoveredBit.toDERHex();

    try {
      const {
        data: { balance },
      } = await server.post(`send`, dataToSend);
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1 className="title">Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
