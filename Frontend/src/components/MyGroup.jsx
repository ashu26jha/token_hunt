import React from "react";
import MyButton from "./MyButton.jsx";

function MyGroup(props) {
	return (
		<div>
			<MyButton fcn={props.fcn} buttonLabel={props.buttonLabel} />
		</div>
	);
}

export default MyGroup;
