import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab, Button, Glyphicon } from "react-bootstrap";

import Friend from './Friend';

import withToast from "./withToast";
import LoaderButton from "./LoaderButton";

import './NewUser.css';

class NewUser extends Component {
  state = {
    isLoading: false,
    name: '', // nombre del usuario
    email: '', // email del usuario
    password: '', // password
    rol: [], // roles del usuario
    active: false // el usuario está activo
  }

  validateForm() {
    return (this.state.name.trim().length > 6 &&
            this.state.email.trim().length > 5 &&
            this.state.password.trim().length > 5);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleChangeActive = checked => {
    this.setState({active: checked});
  }

  loadUserData = () => {
    if (this.props.logued.signedIn) {

  		fetch(`/api/getUserData?token=${this.props.logued.token}&email=${this.state.email}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(users => {
              if (users.user.length > 0) {
                let newState = this.state;
                newState.name = users.user[0].name;
                this.setState(newState);
              }
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener usuario: ${err.message}`);
            })
          }
  			});
    }
  }

  addFriend = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let found = newState.rol.find(function(frnd){
        return rol.id === frnd.id;
      });
      if (typeof found === 'undefined'){
        newState.rol.push(rol);
      }
    });

    this.setState(newState);
  }

  delFriend = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.rol.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.rol.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  handleSubmit = async event => {
    let {name, email, password, rol, active} = this.state;
    let frnd = rol.map(f => f.id);

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.addUser({name: name.trim(), email: email.trim(), password: password.trim(), rol: frnd, active});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    return(
      <div className="NewUser">
        <Form onSubmit={this.handleSubmit}>

          <Tabs defaultActiveKey={1} id="newuser-tab">
            <Tab eventKey={1} title="Generales" className="tabNewUser">

              <FormGroup controlId="email">
                <ControlLabel>Correo del usuario</ControlLabel>
                <FormControl
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  placeholder="juan@correo.cu" />
              </FormGroup>
              <Button bsStyle='success' bsSize='xsmall' onClick={() => this.loadUserData()}> <Glyphicon glyph="refresh"></Glyphicon></Button>
              <FormGroup controlId="name">
                <ControlLabel>Nombre del usuario</ControlLabel>
                <FormControl
                  type="text"
                  value={this.state.name}
                  onChange={this.handleChange}
                  placeholder="Juan Perez" />
              </FormGroup>
              <FormGroup controlId="password">
                <ControlLabel>Contraseña</ControlLabel>
                <FormControl
                  type="password"
                  value={this.state.password}
                  onChange={this.handleChange}
                  placeholder="contraseña" />
              </FormGroup>

              <Checkbox onChange={e => this.handleChangeActive(e.target.checked)} checked={this.state.active}>Activo</Checkbox>

            </Tab>
            <Tab eventKey={2} title="Permisos" className="tabNewUser">
              <Friend logued={this.props.logued} addFriend={this.addFriend} delFriend={this.delFriend} friend={this.state.rol} header="Permisos" />
            </Tab>
          </Tabs>

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Crear usuario"
            loadingText="Adicionando usuario…"
          />

        </Form>
      </div>

    );
  }
}

export default withToast(NewUser);
