import React, { Component } from "react";

import { Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
// import { Form, FormGroup, Input, Label } from "reactstrap";
import LoaderButton from "../components/LoaderButton";

import withToast from '../components/withToast';

import "./Login.css";

let md5 = require('md5');

class Login extends Component {
  state = {
    isLoading: false,
    email: "raul@mtz.jovenclub.cu",
    // email: "rosalia@mtz.jovenclub.cu",
    // email: "ramiro@mtz.jovenclub.cu",
    password: "raulin",
  }

  login(user, pass) {

    const pw = md5(pass);

    return fetch('/api/signin', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/json' },
	        body: JSON.stringify({user, pass: pw})
	      }).then(response => {
	        if (response.ok) {
	          response.json().then(usr => {
              this.props.onSignin({owner: usr.owner, email: usr.email, name: usr.name, token: usr.token, rol: usr.rol, id: usr.id});
	          });
	        } else {
	          response.json().then(err => {
	            this.props.showError(`Usuario/contraseña incorrecto: ${err.message}`);
	          })
	        }
	      });
  }

  validateForm() {
    return this.state.email.length > 6 && this.state.password.length > 5;
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
      await this.login(this.state.email, this.state.password);
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }
    this.setState({ isLoading: false });
  }

  render() {
    return (
      <div className="Login">
        <Form onSubmit={this.handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Usuario</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Contraseña</ControlLabel>
            <FormControl
              value={this.state.password}
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
            loadingText="Verificando usuario…"
          />
        </Form>
      </div>
    );
  }
}

export default withToast(Login);

/*
<FormGroup>
  <Label for="email">Usuario</Label>
  <Input
    autoFocus
    type="email"
    name="email"
    id="email"
    value={this.state.email}
    onChange={this.handleChange}
  />
</FormGroup>
<FormGroup>
  <Label for="password">Contraseña</Label>
  <Input
    value={this.state.password}
    onChange={this.handleChange}
    type="password"
    name="password"
    id="password"
  />
</FormGroup>

*/
