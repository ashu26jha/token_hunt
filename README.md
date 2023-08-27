## Token Hunt 

Token Hunt is a decentralised NFT raffle on the [`Hedera`](https://hedera.com/) testnet

### Hows it's built?

We wrote a smart contract which takes the holds of NFT for the entire duration of the raffle, after generating the random number through `Solidity` with libraries for `random number` generation [(HIP-351)](https://hips.hedera.com/hip/hip-351), we took help of this documentation [here](https://docs.hedera.com/hedera/tutorials/more-tutorials/how-to-generate-a-random-number-on-hedera) 

After generation of the random number NFT is transfered from contract to person who win the lottery. 

### Challenges faced

- We wanted a deploy link but it would not be possible with `The Graph` as we can only run `The Graph` on the local node. To get over this issue we used `Hedera` Consensus Messages so that we can render the frontend very quickly and efficiently instead of query the nodes multiple times. We use a in house built standardised message so that it can be converted into the JSON, then render the frontend
- Since transaction are limited to 4KB we had to optimise our contract writing to make sure not to exceed the limit, as we wanted scalability, speed and support multiple Raffle(s) at once
