import "./App.css";
import { BrowserProvider, Contract } from "ethers";
import { useState, useEffect } from "react";
// import abi from "./contract/chai.json";
import abi from "./contract/chaiContract.json";
import Home from "./components/Home";

function App() {
  const [state, setState] = useState({
    provider: null,
    signer: null,
    contract: null,
    account: null,
  });

  useEffect(() => {
    const connectWallet = async () => {
      // const contractAddress = "0x9738ac4E76cE1493E91b652bEAdA3EB13ddCeE67"; // Replace with actual contract address
      const contractAddress = "0x290D69C5dCe5D44DfcaE24F1C7F553d7B31E7B0D"; // Replace with actual contract address
      const contractABI = abi.abi;

      try {
        const { ethereum } = window;

        if (!ethereum) {
          console.error("MetaMask is not installed!");
          return;
        }

        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          const account = accounts[0];

          const provider = new BrowserProvider(ethereum);
          const signer = await provider.getSigner();
          const contract = new Contract(contractAddress, contractABI, signer);

          setState((prevState) => ({
            ...prevState, // Keep previous state properties intact
            provider,
            signer,
            contract,
            account,
          }));
          console.log("Connected account:", account);
        } else {
          console.error("No accounts found!");
        }
      } catch (error) {
        console.log("Error while connecting wallet: ", error);
      }
    };

    connectWallet();
  }, []);

  // Handle account or network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setState((prevState) => ({
          ...prevState,
          account: accounts[0],
        }));
        console.log("Account changed:", accounts[0]);
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div>
      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1>
      {state.account && <p>Connected account: {state.account}</p>} */}
      <Home state={state} />
    </div>
  );
}

export default App;
