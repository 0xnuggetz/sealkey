import express, { Request, Response } from "express";
import db from "../firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import TronWeb from "tronweb";
import * as crypto from "crypto";
import * as CryptoJS from "crypto-js";
import * as dotenv from "dotenv";

dotenv.config();

const secretTokenAddress = "TMBdWU9ek3XYpAJFc887Uk17bDKg69zFFV";

export const oracle = express.Router();

const tronWeb = new TronWeb({
  fullHost: "https://api.shasta.trongrid.io",
  privateKey: process.env.PRIVATE_KEY,
});

async function getSecretKey(tokenId) {
  try {
    const docRef = doc(db, "secrets", secretTokenAddress);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data()[tokenId];
    } else {
      throw new Error("Secret not found");
    }
  } catch (error) {
    console.error("Error fetching secretKey:", error);
    return null;
  }
}

oracle.post("/encrypt", async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    const secretKey: string = crypto.randomBytes(32).toString("hex");

    console.log(message);
    console.log(secretKey);

    const encryptedMessage: CryptoJS.lib.CipherParams = CryptoJS.AES.encrypt(
      message,
      secretKey
    );

    const secretTokenContract = await tronWeb.contract().at(secretTokenAddress);
    const latestTokenId = await secretTokenContract.getLastTokenId().call();

    if (latestTokenId !== null) {
      const tokenId = parseInt(latestTokenId) + 1;

      const secretsRef = doc(db, "secrets", secretTokenAddress);
      await setDoc(
        secretsRef,
        {
          [tokenId]: secretKey,
        },
        { merge: true }
      );

      console.log(encryptedMessage.toString());
      res.status(200).send(encryptedMessage.toString());
    } else {
      res.status(500).send({ message: "Error fetching latest tokenId" });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "server error" });
  }
});

oracle.post("/unseal", async (req: Request, res: Response) => {
  try {
    const { signature, address, tokenId, message } = req.body;

    if (!tronWeb.isAddress(address)) {
      res.status(400).send({ message: "Invalid TRON address" });
      return;
    }

    const recoveredAddress = await tronWeb.trx.verifyMessageV2(
      message,
      signature
    );

    const secretTokenContract = await tronWeb.contract().at(secretTokenAddress);

    if (recoveredAddress === address) {
      await secretTokenContract.unsealToken(tokenId).send();

      const secretKey = await getSecretKey(tokenId);
      const encryptedMessage = await secretTokenContract
        .getSecret(tokenId)
        .call();

      const decryptedMessage: string = CryptoJS.AES.decrypt(
        encryptedMessage,
        secretKey
      ).toString(CryptoJS.enc.Utf8);

      res.status(200).send(decryptedMessage);
    } else {
      res.status(400).send({
        message:
          "The signature is not valid or does not belong to the given address.",
      });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send({ message: "server error" });
  }
});
