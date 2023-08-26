import {Client, Hbar} from '@hashgraph/sdk';

const url = "https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.1074528/messages";
const myAccountId = "0.0.574650";
const myPrivateKey = "3030020100300706052b8104000a04220420979a22c035e7e976fe43e37d1c19f786d3666bfa339af957d9c4e2ce95d0362e";
const client = Client.forTestnet();
client.setOperator(myAccountId, myPrivateKey);
client.setDefaultMaxTransactionFee(new Hbar(100));
client.setMaxQueryPayment(new Hbar(50));
const topicId = "0.0.1074528";

export {client,url,topicId};
