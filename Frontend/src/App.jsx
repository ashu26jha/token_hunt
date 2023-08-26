import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import walletConnectFcn from "./components/hedera/walletConnect.js";
import contractDeployFcn from "./components/hedera/contractDeploy.js";
import contractExecuteFcn from "./components/hedera/contractExecute.js";
import Navbar from "./components/Navbar/Navbar.jsx";

import "./styles/App.css";
import Home from "./components/Home/Home.jsx";

function App() {
	const [walletData, setWalletData] = useState();
	const [account, setAccount] = useState();
	const [network, setNetwork] = useState();
	const [contractAddress, setContractAddress] = useState();

	const [connectTextSt, setConnectTextSt] = useState("🔌 Connect here...");
	const [contractTextSt, setContractTextSt] = useState();
	const [executeTextSt, setExecuteTextSt] = useState();

	const [connectLinkSt, setConnectLinkSt] = useState("");
	const [contractLinkSt, setContractLinkSt] = useState();
	const [executeLinkSt, setExecuteLinkSt] = useState();
	const [walletText, setWalletText] = useState('Connect Wallet');


	async function connectWallet() {
		if (account !== undefined) {
			setWalletText('Connected')
		} else {
			const wData = await walletConnectFcn();

			let newAccount = wData[0];
			let newNetwork = wData[2];
			if (newAccount !== undefined) {
				setWalletText('Connected')
				setConnectLinkSt(`https://hashscan.io/${newNetwork}/account/${newAccount}`);
				
				setWalletData(wData);
				setAccount(newAccount);
				setNetwork(newNetwork);
				setContractTextSt();
			}
		}
	}

	return (
		<Router>
			<div className="App">
				<Navbar fcn={connectWallet} buttonLabel={walletText} />
				<Routes>
					<Route path="/" element={<Home/> }/>
				</Routes>
			</div>
		</Router>
	);
}
export default App;
