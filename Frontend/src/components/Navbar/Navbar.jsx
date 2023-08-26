import "./Navbar.css"
import React from "react"
import { Link } from "react-router-dom";
import NavImg from '../../assets/logo.png'
import MyButton from "../MyButton";

const Navbar = (props) => {

	return (
		<div className="Nav" id="Navbar">
			<img src = {NavImg} className="navIMG"/>
			<ul className="Nav-menu">
				<li>
					<Link to="/">Home</Link>
				</li>
				<li>
					<Link to="/raffle">Raffle</Link>
				</li>
				<MyButton fcn={props.fcn} buttonLabel={props.buttonLabel}  />
			</ul>

		</div>
	)
}

export default Navbar
