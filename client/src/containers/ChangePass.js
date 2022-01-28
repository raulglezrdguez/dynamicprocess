import React, { Component } from "react";

import { Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import LoaderButton from "../components/LoaderButton";

import withToast from '../components/withToast';

import "./ChangePass.css";

let md5 = require('md5');

class ChangePass extends Component {
  state = {
    isLoading: false,
    password: "raulin",
    newPassword: '',
    newPassword1: ''
  }

  changePass = (pass, newPass) => {

    const token = this.props.logued.token;
    const pw = md5(pass);
    const npw = md5(newPass);

    return fetch('/api/changePass', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({token, pass: pw, newpass: npw})
	      }).then(response => {
	        if (response.ok) {
            this.props.showSuccess('Contraseña cambiada correctamente');
	        } else {
	          response.json().then(err => {
	            this.props.showError(`Contraseña incorrecta: ${err.message}`);
	          })
	        }
	      });
  }

  validateForm() {
    let {password, newPassword, newPassword1} = this.state;

    return ((password.trim().length > 5) &&
      (newPassword.trim().length > 5) &&
      (newPassword1.trim().length > 5) &&
      (newPassword.trim() === newPassword1.trim()));
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.changePass(this.state.password, this.state.newPassword);
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }
    this.setState({ isLoading: false });
  }

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Contraseña</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <FormGroup controlId="newPassword" bsSize="large">
            <ControlLabel>Nueva contraseña</ControlLabel>
            <FormControl
              value={this.state.newPassword}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <FormGroup controlId="newPassword1" bsSize="large">
            <ControlLabel>Repita nueva contraseña</ControlLabel>
            <FormControl
              value={this.state.newPassword1}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>


          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Aceptar"
            loadingText="Cambiando contraseña…"
          />
        </Form>
      </div>
    );
  }
}

export default withToast(ChangePass);
