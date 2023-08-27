import { client, url, topicId } from './helper'
import { TopicMessageSubmitTransaction } from '@hashgraph/sdk';
import { ethers } from "ethers";
import { useEffect, useState } from 'react';
import { Buffer } from 'buffer';
import sampleImage from './sample.png';
import AIabi from "../contracts/AIabi.js";
import NFTabi from '../contracts/NFTabi'
import hederaImage from './hedera.png';
import walletConnectFcn from "../components/hedera/walletConnect";
const NFTaddress = '0x1c89575eE52fBc3Bc2711f6a527D126616Af8890';
const AIaddress = '0xdd791fa1BC0F9f1989e541a782c3FeCBe8C239d4';

export default function () {

    const [raffleDetails, setRaffleDetails] = useState([]);
    const [walletData, setWalletData] = useState([]);
    const [particpation, setParticipation] = useState(false);

    const [tokenID, setTokenID] = useState('');
    const [amount, setAmount] = useState('');
    const [NFTaddressInput, setNFTaddressInput] = useState('');
    const [winner, setWinner] = useState('Not Decided');
    const [ipfsHash, setIPFShash] = useState('');

    useEffect(() => {

        const toggleButton = document.getElementById('toggleButton');
        const textFields = document.getElementById('textFields');

        toggleButton.addEventListener('click', () => {
            if (toggleButton.innerHTML === '+') {
                toggleButton.innerHTML = '&#10005;';
                toggleButton.style.fontSize = '20px';

                textFields.style.display = 'flex';
                setTimeout(() => {
                    textFields.style.opacity = '1';
                }, 10);
            } else {
                toggleButton.innerHTML = '+';
                textFields.style.opacity = '0';
                toggleButton.style.fontSize = '35px';

                setTimeout(() => {
                    textFields.style.display = 'none';
                }, 300);
            }
        });

        async function getHedera() {

            let fill = [];
            const data = await (await fetch(url)).json();
            console.log(data)
            for (let i = 0; i < data.messages.length; i++) {

                var b = Buffer.from(data.messages[i].message, 'base64')
                var inputString = b.toString();
                console.log(inputString)
                const pairs = inputString.split(',');
                const dataObject = {};
                for (const pair of pairs) {
                    let [key, value] = pair.split(':');
                    if (key == 'amount') {
                        value = ethers.utils.formatEther(value)
                    }
                    dataObject[key] = value;
                }
                const formattedObject = {};
                for (const key in dataObject) {
                    formattedObject[key.charAt(0).toUpperCase() + key.slice(1)] = dataObject[key];
                }

                fill.push(formattedObject)
            }
            console.log(fill)
            setRaffleDetails(fill);
        }
        getHedera();

        async function walletData() {

            const wData = await walletConnectFcn();
            console.log(wData)
            setWalletData(wData);
            const provider = wData[1];
            const signer = provider.getSigner();

        }

        walletData();
    }, [])

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [activePopupIndex, setActivePopupIndex] = useState(null);
    const [participants, setParticipants] = useState('');

    const handleButtonClick = (index) => {
        setActivePopupIndex(index);
    };

    const handleClosePopup = () => {
        setActivePopupIndex(null);
    };

    async function handleSubmit() {

        const provider = walletData[1];
        const signer = provider.getSigner();

        let txHash;
        try {
            const gasLimit = 600000;
            console.log('SSSSSSSSSSSSSSSS',NFTaddressInput);

            const NFTcontract = new ethers.Contract(NFTaddress, NFTabi, signer);
            const createApproveTx = await NFTcontract.setApprovalForAll(AIaddress, true, { gasLimit: gasLimit });
            const approveRx = await createApproveTx.wait();
            console.log(approveRx);
            console.log(approveRx)
            console.log('AAAAAA')
            const AIcontract = new ethers.Contract(AIaddress, AIabi, signer);

            const createTx = await AIcontract.createRaffle(parseInt(tokenID), parseInt(amount), NFTaddressInput, { gasLimit: gasLimit });
            const mintRx = await createTx.wait();
            console.log(createTx)

            txHash = mintRx.transactionHash;

            const topicid = '0.0.1074528';

            const message = `current:open,tokenId:${tokenID},amount:${amount},creator:${walletData[0]},image:${ipfsHash}`
            console.log(message);

            let sendResponse = await new TopicMessageSubmitTransaction({
                topicId: topicid,
                message: message,
            }).execute(client);

            const getReceipt = await sendResponse.getReceipt(client);

            const transactionStatus = getReceipt.status
            console.log("The message transaction status " + transactionStatus.toString())

            // CHECK SMART CONTRACT STATE AGAIN
            console.log(`- Contract executed. Transaction hash: \n${txHash} ✅`);
        } catch (executeError) {
            console.log(`- ${executeError}`);
        }
    }

    async function enterRaffle(raffleId, amount) {
        const provider = walletData[1];
        const signer = provider.getSigner();
        const gasLimit = 600000;
        console.log(amount)
        try {
            const AIcontract = new ethers.Contract(AIaddress, AIabi, signer);
            const weiAmount = ethers.utils.parseEther(amount.toString());
            const createTx = await AIcontract.enterRaffle(parseInt(raffleId), { gasLimit: gasLimit, value: parseInt(weiAmount) });
            const mintRx = await createTx.wait();
            console.log(mintRx);

        } catch (error) {
            console.log(error);
        }

        console.log(raffleId);
    }

    async function drawWinner(raffleId) {
        const provider = walletData[1];
        const signer = provider.getSigner();
        const gasLimit = 600000;
        try {
            const AIcontract = new ethers.Contract(AIaddress, AIabi, signer);
            console.log('Generating')
            const createTx = await AIcontract.generateWinner(0, parseInt(participants), parseInt(raffleId), { gasLimit: gasLimit });
            const mintRx = await createTx.wait();
            console.log('Generated');

            console.log(mintRx);

        } catch (error) {
            console.log(error);
        }
    }

    async function winnerNFT(raffleId) {

        const provider = walletData[1];
        const signer = provider.getSigner();
        const gasLimit = 600000;

        try {
            const AIcontract = new ethers.Contract(AIaddress, AIabi, signer);
            console.log('Transfering NFT')

            const createTx = await AIcontract.winnerGetNFT(parseInt(raffleId), { gasLimit: gasLimit });
            const mintRx = await createTx.wait();
            console.log('NFT transfered');

            const NFTtoken = await AIcontract.getRaffleTokenId(parseInt(raffleId), { gasLimit: gasLimit });
            console.log(NFTtoken)
            const NFTcontract = new ethers.Contract(NFTaddress, NFTabi, signer);
            const owner = await NFTcontract.ownerOf(parseInt(NFTtoken.toString()));

            console.log('OWNER OF NFT ', owner)

            console.log(mintRx);

        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        async function hello() {

            if (activePopupIndex != null) {
                const provider = walletData[1];
                const signer = provider.getSigner();
                console.log(activePopupIndex)
                const AIcontract = new ethers.Contract(AIaddress, AIabi, signer);
                const createTx = await AIcontract.particantCount(parseInt(activePopupIndex))

                const participantsArr = await AIcontract.getParticipants(parseInt(activePopupIndex));
                console.log(participantsArr);
                let winner;
                // console.log(createTx)
                if ((createTx.toString() != 0)) {
                    winner = await AIcontract.winner(parseInt(activePopupIndex));
                }

                if (participantsArr.includes(walletData[0])) {
                    console.log('S')
                    setParticipation(true);
                }
                else {
                    console.log('A')
                    setParticipation(false);
                }

                console.log(createTx)
                console.log(activePopupIndex)
                setParticipants(createTx.toString())
                if (createTx.toString() == 0) {
                    setWinner('Not Decided')
                }
                else if (winner.toString() == "0x0000000000000000000000000000000000000000") {
                    setWinner('Not Decided')
                }
                else {
                    setWinner(winner.toString())
                }

            }

        }

        hello()
    }, [activePopupIndex])
    return (
        <div>
            <div class="container">
                <div class="button" id="toggleButton">+</div>
                <div class="text-fields" id="textFields">
                    <input type="text" placeholder="Token ID" className='create-textfield' onChange={((e) => { setTokenID(e.target.value) })} />
                    <input type="text" placeholder="Amount" className='create-textfield' onChange={((e) => { setAmount(e.target.value) })} />
                    <input type="text" placeholder="NFT Address" className='create-textfield' onChange={((e) => { setNFTaddressInput(e.target.value) })} />
                    <input type="text" placeholder="IPFS Hash" className='create-textfield' onChange={((e) => { setIPFShash(e.target.value) })} />
                    <button id="submitButton" className='raffle-create' onClick={handleSubmit}>Submit</button>
                </div>
            </div>
            <div className="card-container">

                {raffleDetails.map((e, k) => (
                    <div className="card">
                        <img src={`https://ipfs.io/ipfs/${(e.Image)}`} alt="Sample" className="card-image" />
                        <div className='token_id'>
                            Token Id: #{e.TokenId}
                        </div>
                        <div className='price-wrap'>
                            <img src={hederaImage} className='hedera-image' />
                            <h2 className="card-amount">{e.Amount} </h2>
                        </div>
                        <p className="card-owner">
                            Created by: {(e.Creator).slice(0, 5)}...{(e.Creator).slice(-4)}
                        </p>
                        {activePopupIndex === k && (
                            <div className="popup-overlay">
                                <div className="popup-content">
                                    <img src={`https://ipfs.io/ipfs/${(e.Image)}`} className='popup-image' />
                                    <div className='popup-info'>
                                        <h2>Token Id: #{e.TokenId}</h2>
                                        <p>Created by: {(e.Creator)}</p>
                                        <p>Total Participants : {participants}</p>
                                        <p>Price to enter the raffle : {e.Amount} HBAR</p>
                                        <p>Winner : {winner}</p>
                                        {!particpation && <button className='enter' id='enterRaff' onClick={() => enterRaffle(k, e.Amount)}>Enter Raffle</button>}
                                        <button className='enter' onClick={() => drawWinner(k)}> Draw Winner </button>
                                        <button className='enter' onClick={() => winnerNFT(k)}> Give NFT to Winner </button>
                                    </div>
                                    <button className="popup-close-button" onClick={handleClosePopup}>&times;</button>
                                </div>
                            </div>
                        )}
                        <button className="card-button" onClick={() => handleButtonClick(k)}>Enter Raffle</button>

                    </div>
                )
                )}
            </div>
        </div>
    )
}
