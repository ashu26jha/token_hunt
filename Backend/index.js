// import bytecode from "./bytecode";
const bytecode = require("./bytecode")
const {
    Client,
    ContractCreateFlow,
    Hbar,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    TransactionRecordQuery,
    ContractCallQuery
} = require("@hashgraph/sdk");

require("dotenv").config();

async function environmentSetup() {

    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;

    if (!myAccountId || !myPrivateKey) {
        throw new Error(
            "Environment variables MY_ACCOUNT_ID and MY_PRIVATE_KEY must be present"
        );
    }

    const client = Client.forTestnet();

    client.setOperator(myAccountId, myPrivateKey);

    client.setDefaultMaxTransactionFee(new Hbar(100));

    client.setMaxQueryPayment(new Hbar(50));

    let gasLim = 4000000;
    const [contractId, contractAddress] = await deployContractFcn(bytecode, gasLim, client);
    console.log(`- Contract ID: ${contractId}`);
    console.log(`- Contract ID in Solidity address format: ${contractAddress}`);

    // Execute the contract
    const lo = 0;
    const hi = 10;
    const randNumParams = new ContractFunctionParameters().addUint32(lo).addUint32(hi);
    const randNumRec = await executeContractFcn(contractId, "getPseudorandomNumber", randNumParams, gasLim, client);
    console.log(`- Contract execution: ${randNumRec.receipt.status} \n`);

    const recQuery = await txRecQueryFcn(randNumRec.transactionId, client);

    let lowOrderBytes = new Uint8Array(recQuery.children[0].prngBytes).slice(28, 32);
    let dataview = new DataView(lowOrderBytes.buffer);
    let range = hi - lo;
    let int32be = dataview.getUint32(0);
    let randNum = int32be % range;
    console.log(`- The random number (using transaction record) = ${randNum}`)

    const randNumResult = await callContractFcn(contractId, "getNumber", gasLim, client);
    console.log(`- The random number (using contract function) = ${randNumResult.getUint32(0)}`);
    randNum === randNumResult.getUint32(0) ? console.log(`- The random number checks out ✅`) : console.log(`- Random number doesn't match ❌`);

    // Check a Mirror Node Explorer
    const [randNumInfo, randNumExpUrl] = await mirrorTxQueryFcn(randNumRec.transactionId);
    console.log(`\n- See details in mirror node explorer: \n${randNumExpUrl}`);

}
environmentSetup();

async function deployContractFcn(bytecode, gasLim, client) {
    const contractCreateTx = new ContractCreateFlow().setBytecode(bytecode).setGas(gasLim);
    const contractCreateSubmit = await contractCreateTx.execute(client);
    const contractCreateRx = await contractCreateSubmit.getReceipt(client);
    const contractId = contractCreateRx.contractId;
    const contractAddress = contractId.toSolidityAddress();
    return [contractId, contractAddress];
}
async function executeContractFcn(cId, fcnName, params, gasLim, client) {
    const contractExecuteTx = new ContractExecuteTransaction().setContractId(cId).setGas(gasLim).setFunction(fcnName, params);
    const contractExecuteSubmit = await contractExecuteTx.execute(client);
    const contractExecuteRec = await contractExecuteSubmit.getRecord(client);
    return contractExecuteRec;
}

async function txRecQueryFcn(txId, client) {
    const recQuery = await new TransactionRecordQuery().setTransactionId(txId).setIncludeChildren(true).execute(client);
    return recQuery;
}

async function callContractFcn(cId, fcnName, gasLim, client) {
    const contractCallTx = new ContractCallQuery().setContractId(cId).setGas(gasLim).setFunction(fcnName);
    const contractCallSubmit = await contractCallTx.execute(client);
    return contractCallSubmit;
}

async function mirrorTxQueryFcn(txIdRaw) {
    // Query a mirror node for information about the transaction
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    await delay(10000); // Wait for 10 seconds before querying a mirror node

    const txIdPretty = prettify(txIdRaw.toString());
    const mirrorNodeExplorerUrl = `https://hashscan.io/testnet/transaction/${txIdPretty}`;
    const mirrorNodeRestApi = `https://testnet.mirrornode.hedera.com/api/v1/transactions/${txIdPretty}`;
    let mQuery = [];
    try {
        mQuery = await axios.get(mirrorNodeRestApi);
    } catch { }
    return [mQuery, mirrorNodeExplorerUrl];
}

function prettify(txIdRaw) {
    const a = txIdRaw.split("@");
    const b = a[1].split(".");
    return `${a[0]}-${b[0]}-${b[1]}`;
}
