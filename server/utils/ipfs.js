import { create } from "ipfs-http-client";

// Infura credentials
const projectId = "9bbaaf0be1b1cbe9d0ae";
const projectSecret = "166a468dd1c6fb34e15d991e1ec46df8c13d2f1aba9c5b2cfa9f1b6a2c4d4aa7";
const auth = "Basic " + Buffer.from(`${projectId}:${projectSecret}`).toString("base64");

// Connect to Infura IPFS
const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default client;
