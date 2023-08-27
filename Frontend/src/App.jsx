import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MyGroup from "./components/MyGroup.jsx";
import walletConnectFcn from "./components/hedera/walletConnect.js";
import contractDeployFcn from "./components/hedera/contractDeploy.js";
import contractExecuteFcn from "./components/hedera/contractExecute.js";
import "./styles/App.css";
import Navbar from "./components/Navbar/Navbar.jsx";
import NFTabi from "./contracts/NFTabi.js";
import NFTbytecode from "./contracts/NFTbytecode.js";
import AIabi from "./contracts/AIabi.js";
import AIbytecode from "./contracts/AIbytecode.js";
import Home from "./components/Home/Home";
import Raffle from "./components/Raffles";
import { ethers } from "ethers";
import axios from 'axios';

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI0MjQyZTQzYi0zODNiLTRhYjUtYWE1NC04YTc1MzIzYTY4NDQiLCJlbWFpbCI6ImFzaHV0b3NoMjZqaGFAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siaWQiOiJGUkExIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9LHsiaWQiOiJOWUMxIiwiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjF9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImI2NzI4ZDNmNWRjNjhjMzRhNWY4Iiwic2NvcGVkS2V5U2VjcmV0IjoiZGM3OTJkYjZhNzVkOTI5Y2MyNDllOGZkZDE2MGFhZDI3OGQwMmI1MmJmY2Y2OTQ1NTM4NDM4MjJkMjBiOTQwOSIsImlhdCI6MTY5MjgwNzQ2M30.c4mAp57G4DXIOvuMnYCtheJl6oO2MXMqJse49KSrXYo';
const API_TOKEN = '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'
const NFTaddress = '0xb39C1Ae40746F96be59d11C42e26a24EbdA154Ce';
const AIaddress = '0x30CA0bb56d58c01E702B1b49895d5cB5249F76f1';

function App() {
	const [walletData, setWalletData] = useState();
	const [account, setAccount] = useState();
	const [network, setNetwork] = useState();
	const [contractAddress, setContractAddress] = useState();
	const [contractTextSt, setContractTextSt] = useState();
	const [executeTextSt, setExecuteTextSt] = useState();
	const [connectLinkSt, setConnectLinkSt] = useState("");
	const [contractLinkSt, setContractLinkSt] = useState();
	const [executeLinkSt, setExecuteLinkSt] = useState();
	const [walletText, setWalletText] = useState('Connect Wallet');
	const API_KEY = "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";

	const [inputtext, setInputtext] = useState("")
	const [imageurl, setImageUrl] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [hash, setHash] = useState("");

	const handleInputChange = (event) => {
		setInputtext(event.target.value);
	}

	async function hello() {
		setIsLoading(true);
		const input = inputtext;
		const response = await fetch(
			"https://api-inference.huggingface.co/models/prompthero/openjourney",
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${API_TOKEN}`,
				},
				body: JSON.stringify({ inputs: input }),
			}
		);

		if (!response.ok) {
			throw new Error("Failed to generate image");
		}
		const blobData = await response.blob();

		const formData = new FormData();
		formData.append('file', blobData);
		const pinataMetadata = JSON.stringify({
			name: 'IMAGE',
		});
		formData.append('pinataMetadata', pinataMetadata);
		const pinataOptions = JSON.stringify({
			cidVersion: 0,
		})
		formData.append('pinataOptions', pinataOptions);

		const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
			maxBodyLength: "Infinity",
			headers: {
				'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
				'Authorization': `Bearer ${JWT}`
			}
		});
		const helloIMG = `https://ipfs.io/ipfs/${res.data.IpfsHash}`;
		setHash(helloIMG);
		setImageUrl(helloIMG);
		console.log(res.data.IpfsHash);
	}

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

	// async function contractDeploy() {
	// 	if (account === undefined) {
	// 		setContractTextSt("🛑 Connect a wallet first! 🛑");
	// 	} else {
	// 		const cAddress = await contractDeployFcn(walletData);

	// 		if (cAddress === undefined) {
	// 		} else {
	// 			setContractAddress(cAddress);
	// 			setContractTextSt(`Contract ${cAddress} deployed ✅`);
	// 			setExecuteTextSt(``);
	// 			setContractLinkSt(`https://hashscan.io/${network}/address/${cAddress}`);
	// 		}
	// 	}
	// }

	async function mintNFT() {

		const provider = walletData[1];
		const signer = provider.getSigner();

		let txHash;
		try {
			console.log('Minting')

			const gasLimit = 600000;
			const NFTcontract = new ethers.Contract(NFTaddress, NFTabi, signer);
			console.log('String for : ', hash)
			const mintTx = await NFTcontract.safeMint(hash, { gasLimit: gasLimit });
			const mintRx = await mintTx.wait();
			txHash = mintRx.transactionHash;

			// CHECK SMART CONTRACT STATE AGAIN
			console.log(`- Contract executed. Transaction hash: \n${txHash} ✅`);
		} catch (executeError) {
			console.log(`- ${executeError.message.toString()}`);
		}
		// yahan
	}

	return (
		<Router>
			<div className="App">
				<Navbar fcn={connectWallet} buttonLabel={walletText} />
				<Routes>
					<Route path="/" element={<Home mintfcn={mintNFT} hellofcn={hello} inptxt={inputtext} fcn3={handleInputChange} image={imageurl} load={isLoading}/>} />
					<Route path="/raffle" element={<Raffle />} />
				</Routes>
				{/* <MyGroup fcn={connectWallet} buttonLabel={"Connect Wallet"} link={connectLinkSt} />
				<MyGroup fcn={contractDeploy} buttonLabel={"Deploy Contract"} text={contractTextSt} link={contractLinkSt} />
				<MyGroup fcn={contractExecute} buttonLabel={"Execute Contract (+1)"} text={executeTextSt} link={executeLinkSt} /> */}
			</div>
		</Router>
	);
}
export default App;
