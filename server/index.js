const express = require("express");
const app = express();
const cors = require("cors");
const secp = require('ethereum-cryptography/secp256k1')
const keccak = require('ethereum-cryptography/keccak')
const {toHex} = require('ethereum-cryptography/utils')

const port = 3042;

app.use(cors());
app.use(express.json());

const generatePublicKey = () => {
  const privateKey = toHex(secp.secp256k1.utils.randomPrivateKey());
  console.log('privateKey', privateKey);
  const publicKey = secp.secp256k1.getPublicKey(privateKey);
  const address = (toHex(keccak.keccak256(publicKey)).slice(1)).slice(-20)
  console.log(address);
  return address;
}

const balances = {
  [generatePublicKey()]: 100,
  [generatePublicKey()]: 50,
  [generatePublicKey()]: 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, hash, amount, recoveredBit } = req.body;

  const signature = secp.secp256k1.Signature.fromDER(recoveredBit);
  console.log(signature);
  const signatureType = new secp.secp256k1.Signature(signature.r,signature.s);
  signatureType.recovery = 0;
  const publicKeyPoint = signatureType.recoverPublicKey(hash);
  const pubKey = new secp.secp256k1.ProjectivePoint(publicKeyPoint.px, publicKeyPoint.py, publicKeyPoint.pz);
  const isValid = secp.secp256k1.verify(signature, hash, pubKey.toRawBytes());

  if(!isValid){
    return res.status(400).send({message: "Invalid transaction"});
  }else{
    setInitialBalance(sender);
    setInitialBalance(recipient);
  }

  if(isValid){
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}
