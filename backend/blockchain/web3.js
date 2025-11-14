import Web3 from "web3";
import * as abi from "./LandRegistryABI.json" assert { type: "json" };

const web3 = new Web3(process.env.RPC_URL);

const contract = new web3.eth.Contract(
  abi.default,
  process.env.CONTRACT_ADDRESS
);

export { web3, contract };
