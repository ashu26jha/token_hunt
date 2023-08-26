import React from "react";
import "./Home.css"
import load from '../../assets/load.gif'
const Home = (props) => {

	return (
		<div className="home">
			<input type="text" name="name" className="inp" value={props.inptext} onChange={props.fcn3} placeholder="Enter to Generate NFT" autoComplete="off" />
			<button className="cta-button" onClick={props.hellofcn}>Generate NFT</button>
			{props.image ? (
				<div className="mint">
					<img className="img" src={props.image} alt="" />
					<p className="hash">IPFS: {props.hash}</p>
					<button onClick={props.mintfcn} className="cta-button">
						MINT NFT
					</button>
				</div>
			) : (
				<p>{props.load ? <img style={{scale:".5"}} src={load}/> : ''}</p>
			)}
			<div style={{width:"100%"}}>
				<p className="Stake"> Ticket your AI generated NFT on</p>
				<p className="Hedera">Token Hunt</p>
			</div>
		</div>
	);
}
export default Home;
