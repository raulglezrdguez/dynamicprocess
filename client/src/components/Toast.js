import React, {Component} from 'react';
import { Alert, Collapse } from 'react-bootstrap';

export default class Toast extends Component {

	async componentDidUpdate() {
		if (this.props.showing) {
			clearTimeout(this.dismissTimer);
			this.dismissTimer = setTimeout(this.props.onDismiss, this.props.seconds * 1000);
		}
	}

	async componentWillUnmount() {
		if (this.dismissTimer) clearTimeout(this.dismissTimer);
	}

	render() {
		return (
			<Collapse in={this.props.showing}>
				<div style={{ position: 'fixed', top: 30, left: '5vw', right: '5vw', textAlign: 'center' }}>
					<Alert
						style={{ width: '90vw' }}
						bsStyle={this.props.bsStyle}
						onDismiss={this.props.onDismiss} >
						{this.props.message}
					</Alert>
				</div>
			</Collapse>
		);
	}
}
