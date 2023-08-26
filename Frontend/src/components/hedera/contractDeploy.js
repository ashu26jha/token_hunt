import AIabi from "../../contracts/AIabi";
import AIbytecode from "../../contracts/AIbytecode";
import NFTabi from "../../contracts/NFTabi";
import NFTbytecode from "../../contracts/NFTbytecode";
import { ContractFactory } from "ethers";

async function contractDeployFcn(walletData) {
	console.log(`\n=======================================`);
	console.log(`- Deploying smart contract on Hedera...🟠`);

	// ETHERS PROVIDER AND SIGNER
	const provider = walletData[1];
	const signer = provider.getSigner();

	// DEPLOY SMART CONTRACT
	let NFTaddress;
	let AIPromptAddress;
	try {
		const gasLimit = 6000000;

		const AIcontract = new ContractFactory(AIabi,AIbytecode,signer);
		const NFTcontract = new ContractFactory(NFTabi,NFTbytecode,signer);

		const AIcontractDeployTx = await AIcontract.deploy({ gasLimit: gasLimit });
		const NFTcontractDeployTx = await NFTcontract.deploy({ gasLimit: gasLimit });

		const AIcontractRx = await AIcontractDeployTx.deployTransaction.wait();
		const NFTcontractRx = await NFTcontractDeployTx.deployTransaction.wait();


		AIPromptAddress = AIcontractRx.contractAddress;
		NFTaddress = NFTcontractRx.contractAddress;

		console.log('NFT contract deployed ',NFTaddress);

		console.log(`- AI Contract deployed to address: \n${AIPromptAddress} ✅`);
	} catch (deployError) {
		console.log(`- ${deployError.message.toString()}`);
	}
	return AIPromptAddress;
}
export default contractDeployFcn;
