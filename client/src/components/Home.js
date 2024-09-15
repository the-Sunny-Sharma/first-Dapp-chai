import { formatEther, parseEther } from "ethers";
import { useEffect, useState } from "react";

// Mock Food Options
const foodOptions = [
  { name: "Chai", price: 0.0001 },
  { name: "Vada Pav", price: 0.0002 },
  { name: "Ice Cream", price: 0.0003 },
  { name: "Pizza", price: 0.005 },
  { name: "Burger", price: 0.007 },
  { name: "Biryani", price: 0.01 },
];

export default function Home({ state }) {
  const { contract } = state; // Access contract from props
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [selectedFood, setSelectedFood] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [walletConnected, setWalletConnected] = useState(false); // Track wallet connection status
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(false); // Loading state for transaction
  const [transactionHash, setTransactionHash] = useState(""); // Transaction hash

  useEffect(() => {
    if (state.account) {
      setWalletConnected(true); // Wallet is connected if account exists
    } else {
      setWalletConnected(false);
    }
  }, [state.account]);

  // Fetch Memos (Transactions)
  useEffect(() => {
    const getMemos = async () => {
      if (contract) {
        try {
          const memos = await contract.getMemos();
          if (memos) {
            setTransactions(memos);
          } else {
            console.warn("No memos returned from the contract");
          }
        } catch (error) {
          console.error("Error fetching memos:", error);
        }
      }
    };

    contract && getMemos();
  }, [contract]);
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        setWalletConnected(false); // Reset wallet state if chain is changed
        window.location.reload();
      });
    }
  }, []);

  // Handle payment using ethers.js
  const handlePay = async () => {
    if (!name || !message || !selectedFood) {
      alert("Please fill all fields and select a food item!");
      return;
    }

    if (!walletConnected || !state.account) {
      alert("Please connect your wallet first.");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const price = parseEther(selectedFood.toString()); // Convert selectedFood price to Ether
      setLoading(true); // Set loading to true before starting the transaction

      const transaction = await contract.buyChai(name, message, {
        value: price,
      });
      await transaction.wait(); // Wait for transaction to be mined
      setLoading(false); // Set loading to false when transaction completes
      setTransactionHash(transaction.hash); // Store the transaction hash

      console.log(
        `Payment successful! Transaction Hash: ${transaction.hash}\nTransaction successful! ${name} ${message}`
      );
      alert(`Payment of ${selectedFood} ETH for ${name} was successful.`);
    } catch (error) {
      console.error("Error during payment:", error);
      alert("Payment failed! Please check your wallet and contract.");
    }
  };

  // Function to connect/retry connecting the wallet
  const tryConnectingWallet = async () => {
    // const contractAddress = "0x9738ac4E76cE1493E91b652bEAdA3EB13ddCeE67"; // Replace with actual contract address
    // const contractABI = abi.abi;

    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("MetaMask is not installed. Please install it to continue.");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        setAccount(accounts[0]); // Set the first account
        setWalletConnected(true); // Set wallet connection status to true
        console.log("Wallet connected: ", accounts[0]);
      } else {
        console.warn("No account found.");
      }
    } catch (error) {
      console.error("Error while connecting wallet: ", error);
    }
  };
  // Format timestamp as human-readable date
  const formatTimestamp = (timestamp) => {
    const date = new Date(Number(timestamp) * 1000); // Convert BigInt to Number and seconds to milliseconds
    return date.toLocaleString(); // You can customize the format if needed
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Dark overlay and spinner when loading */}
      {loading && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex flex-col items-center">
            {/* Spinner */}
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
            <p className="text-white text-lg">Transaction in Progress...</p>
            <p className="text-white text-sm">
              Please wait while your transaction is being confirmed.
            </p>
          </div>
        </div>
      )}
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Sunny Sharma</h1>
          {walletConnected ? (
            <p className="text-sm text-gray-600">
              Wallet: {state.account ?? account}
            </p>
          ) : (
            <p className="text-sm text-gray-600">
              No Wallet Connected{" "}
              <span
                onClick={tryConnectingWallet}
                className="text-blue-600 cursor-pointer"
              >
                Try Again
              </span>
            </p>
          )}
        </div>
      </nav>

      <main className="container mx-auto mt-8 p-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8 w-[90%] md:w-[70%] m-auto">
          <h2 className="text-2xl font-bold mb-4">Buy Me a Chai (or more!)</h2>
          <div className="space-y-4">
            <input
              className="border border-gray-300 rounded-lg p-2 w-full"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border border-gray-300 rounded-lg p-2 w-full"
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="relative inline-block w-full">
              <select
                className="block appearance-none w-full bg-white border border-gray-300 rounded-lg p-2"
                value={selectedFood}
                onChange={(e) => setSelectedFood(e.target.value)}
              >
                <option value="">Select an item</option>
                {foodOptions.map((option) => (
                  <option key={option.name} value={option.price}>
                    {option.name} ({option.price} ETH)
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handlePay}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
            >
              Pay {selectedFood ? `${selectedFood} ETH` : ""}
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Serial No.</th>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Message</th>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Paid (ETH)</th>
              </tr>
            </thead>
            <tbody>
              {/* Check if there are any transactions */}
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    No Transaction to show
                  </td>
                </tr>
              ) : (
                transactions.map((tx, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{index + 1}</td>
                    <td className="border px-4 py-2">{tx.name}</td>{" "}
                    {/* Product Name */}
                    <td className="border px-4 py-2">{tx.message}</td>{" "}
                    {/* Message */}
                    <td className="border px-4 py-2">
                      {formatTimestamp(tx.timestamp)}
                    </td>{" "}
                    {/* Date & Time */}
                    <td className="border px-4 py-2">
                      {`${formatEther(tx.value)} ETH for ${tx.name}`}{" "}
                      {/* Ether value + Product name */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Display transaction hash after successful payment */}
          {transactionHash && (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg mt-4">
              <p>
                Transaction Completed! Hash:{" "}
                <span className="font-mono">{transactionHash}</span>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
