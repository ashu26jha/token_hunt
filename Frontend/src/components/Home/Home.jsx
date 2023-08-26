import React from "react";
import "./Home.css"

const Home = (props) => {

	return (
		<div className="home">
			<input type="text" name="name" className="inp" value={props.inptext} onChange={props.fcn3} placeholder="Enter to Generate NFT" autoComplete="off" />
			<button className="cta-button" onClick={props.hellofcn}>Generate NFT</button>
			{props.image ? (
				<div className="mint">
					<img src={props.image} alt="" />
					<button onClick={props.mintfcn} className="cta-button">
						MINT NFT
					</button>
				</div>
			) : (
				<p>{props.load ? 'Please wait...' : ''}</p>
			)}
		</div>
	);
}
export default Home;
