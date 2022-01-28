import React, { Component } from "react";
import { Form, FormGroup, FormControl, ControlLabel, Tabs, Tab, Button, Glyphicon } from "react-bootstrap";

import Friend from '../components/Friend';
import LoaderButton from "../components/LoaderButton";

import withToast from "../components/withToast";

import './AdmonOtherUser.css';

class AdmonOtherUser extends Component {
  state = {
    isLoading: false,
    email: '', // email del usuario
    name: '', // nombre del usuario
    rol: [], // roles del usuario
  }

  validateForm() {
    return (this.state.name.trim().length > 6 &&
            this.state.email.trim().length > 5);
  }

  handleChangeEmail = event => {
    this.setState({
      email: event.target.value.trim(),
      name: '',
      rol: []
    });
  }

  loadUserData = () => {
    const {logued} = this.props;

    if (logued.signedIn) {
      let {email} = this.state;

      if (email !== '') {
        fetch(`/api/getUserData?token=${logued.token}&email=${email}`, {
    				method: 'GET',
    				headers: { 'Content-Type': 'application/json' },
    			}).then(response => {
    				if (response.ok) {
              response.json().then(users => {
                let newState = this.state;
                if (users.user.length > 0) {
                  newState.name = JSON.parse(JSON.stringify(users.user[0].name));
                  if (users.user[0].rol) {
                    const r = users.user[0].rol.map(m => ({id: m._id, name: m.name, module: m.module._id}));
                    newState.rol = JSON.parse(JSON.stringify(r));
                  } else {
                    newState.rol = [];
                  }
                } else {
                  newState.name = '';
                  newState.rol = [];
                }
                this.setState(newState);
              });
    				} else {
              response.json().then(err => {
                this.props.showError(`No fue posible obtener usuario: ${err.message}`);
              })
            }
    			});
      }
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

  updOtherUser = () => {
    let {email, rol} = this.state;
    let frnd = rol.map(f => f.id);
    const {logued} = this.props;

    if (logued.signedIn && (email !== '')) {
      let body = JSON.stringify({
        token: logued.token,
        email: email,
        rol: frnd,
      });

      return fetch('/api/updOtherUser', {
  				method: 'POST',
          body: body,
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            this.props.showSuccess('Modificación terminada');
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar usuario: ${err.message}`);
            });
          }
  			});
    }
  }

  handleSubmit = async event => {

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.updOtherUser();
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    return(
      <div className="AdmonOtherUser">
        <Form onSubmit={this.handleSubmit}  className="AdmonOtherUserInner">

          <Tabs defaultActiveKey={1} id="admotheruser-tab">
            <Tab eventKey={1} title="Generales" className="tabAdmonOtherUser">

              <FormGroup controlId="email">
                <ControlLabel>Correo del usuario</ControlLabel>
                <FormControl
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChangeEmail}
                  placeholder="juan@correo.cu" />
              </FormGroup>
              <Button bsStyle='success' bsSize='xsmall' onClick={() => this.loadUserData()}> <Glyphicon glyph="refresh"></Glyphicon></Button>
              <FormGroup controlId="name">
                <ControlLabel>Nombre del usuario</ControlLabel>
                <FormControl
                  type="text"
                  defaultValue={this.state.name}
                  disabled
                  placeholder="Juan Perez" />
              </FormGroup>

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
            text="Modificar usuario"
            loadingText="Modificando usuario…"
          />

        </Form>
      </div>

    );
  }
}

export default withToast(AdmonOtherUser);
