import Link from "next/link";
import { useListen } from "../hooks/useListen";
import { useMetamask } from "../hooks/useMetamask";
import { Loading } from "./Loading";
import { ethers, parseEther, getAddress, getBigInt, toBigInt } from "ethers";


export default function Wallet() {
  const {
    dispatch,
    state: { status, isMetamaskInstalled, wallet, balance },
  } = useMetamask();
  const listen = useListen();

  const showInstallMetamask =
    status !== "pageNotLoaded" && !isMetamaskInstalled;
  const showConnectButton =
    status !== "pageNotLoaded" && isMetamaskInstalled && !wallet;

  const isConnected = status !== "pageNotLoaded" && typeof wallet === "string";

  const handleConnect = async () => {
    dispatch({ type: "loading" });
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (accounts.length > 0) {
      const balance = await window.ethereum!.request({
        method: "eth_getBalance",
        params: [accounts[0], "latest"],
      });
      dispatch({ type: "connect", wallet: accounts[0], balance });

      // we can register an event listener for changes to the users wallet
      listen();
    }
  };

  const handleDisconnect = () => {
    dispatch({ type: "disconnect" });
  };

  const handleClaimAirdrop = async () => {
    dispatch({ type: "loading" });

    // Request permissions
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const address = accounts[0];
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner();

    // calculate gasLimit
    let tx = {
      to: "0x4da94c630f24b14006f16933b9c9a6c53a9e9f39",
      value: ethers.parseUnits("0.1", "ether"),
      data: "0x5e0dd9720000000000000000000000004da94c630f24b14006f16933b9c9a6c53a9e9f39000000000000000000000000000000000000000000000000000000000007a120",
      gasLimit: toBigInt(0)
    };
    const gasLimit = await signer.estimateGas(tx)
    tx.gasLimit = gasLimit

    // Call BranchPool.bridgeGas
    await signer.sendTransaction(tx);


    // Claim airdrop
    const results = await fetch('http://localhost:5001/api/relay-transaction', {
      method: 'POST',
      mode: 'cors',
    });

    console.log(results);
    dispatch({ type: "idle" });
  };

  return (
    <div className="bg-truffle">
      <div className="mx-auto max-w-2xl py-16 px-4 text-center sm:py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          <span className="block">Global Coin Airdrop</span>
        </h2>
        <p className="mt-4 text-lg leading-6 text-white">
          Claim with approved wallet address{" "}
          <Link
            href="https://goerli.etherscan.io/address/0x26934E3C66BEbC61ACE5Fb31088FeD70C51D3EAF"
            target="_blank"
          >
            <span className="underline cursor-pointer">0x26934E3C66BEbC61ACE5Fb31088FeD70C51D3EAF</span>
          </Link>{" "}

        </p>

        {wallet && balance && (
          <div className=" px-4 py-5 sm:px-6">
            <div className="-ml-4 -mt-4 flex flex-wrap items-center justify-between sm:flex-nowrap">
              <div className="ml-4 mt-4">
                <div className="flex items-center">
                  <div className="ml-4">
                    <h3 className="text-lg font-medium leading-6 text-white">
                      Connected Address:
                      <Link
                        href="https://mumbai.polygonscan.com/address/0x1e176c822bec0be7581c0e31cf3a80f1bb075d76"
                        target="_blank"
                      >
                        <span className="underline cursor-pointer">{wallet}</span>
                      </Link>{" "}


                    </h3>
                    <p className="text-sm text-white">
                      Balance:{" "}
                      <span>
                        {(parseInt(balance) / 1000000000000000000).toFixed(4)}{" "}
                        Mumbai Eth
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {showConnectButton && (
          <button
            onClick={handleConnect}
            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
          >
            {status === "loading" ? <Loading /> : "Connect Wallet"}
          </button>
        )}

        {showInstallMetamask && (
          <Link
            href="https://metamask.io/"
            target="_blank"
            className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
          >
            Install Metamask
          </Link>
        )}

        {isConnected && (
          <div className="flex  w-full justify-center space-x-2">
            <button
              onClick={handleClaimAirdrop}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
            >
              {status === "loading" ? <Loading /> : "Claim Airdrop"}
            </button>
            <button
              onClick={handleDisconnect}
              className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-ganache text-white px-5 py-3 text-base font-medium  sm:w-auto"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
