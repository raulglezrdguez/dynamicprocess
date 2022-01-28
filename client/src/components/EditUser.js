import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";

import './EditUser.css';

class EditUser extends Component {
  state = {
    isLoading: false,
    name: '', // nombre
    email: '', // email
    password: '', //
    rol: [], //
    active: false
  }

  fillState = (user) => {
    let newState = this.state;

    newState.name = JSON.parse(JSON.stringify(user.name));
    newState.email = JSON.parse(JSON.stringify(user.email));
    newState.password = '';
    newState.active = JSON.parse(JSON.stringify(user.active));
    if (user.rol) {
      const r = user.rol.map(m => {
        if (m._id) return {id: m._id, name: m.name, module: m.module._id};
        else return {id: m.id, name: m.name, module: m.module};
      });
      newState.rol = JSON.parse(JSON.stringify(r));
    } else {
      newState.rol = [];
    }

    this.setState(newState);
  }

  async componentDidMount() {
    this.fillState(this.props.user);
  }

  async componentWillReceiveProps(nextProps) {
    this.fillState(nextProps.user);
  }

  validateForm() {
    let { password } = this.state;
    let res = true;

    if ((password.trim().length > 0) && (password.trim().length < 6)) res = false;

    return (res &&
            this.state.name.trim().length > 6 &&
            this.state.email.trim().length > 5);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleChangeActive = checked => {
    this.setState({active: checked});
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

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.updUser({name: name.trim(), email: email.trim(), password: password.trim(), rol, active, _id: this.props.user._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }
    this.setState({ isLoading: false });
  }

  render() {

    return(
      <div className="EditUser">
        <Form onSubmit={this.handleSubmit}>

          <Tabs defaultActiveKey={1} id="edituser-tab">
            <Tab eventKey={1} title="Generales" className="tabEditUser">

              <FormGroup controlId="email">
                <ControlLabel>Correo del usuario</ControlLabel>
                <FormControl
                  type="email"
                  value={this.state.email}
                  onChange={this.handleChange}
                  placeholder="juan@correo.cu" />
              </FormGroup>
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
            <Tab eventKey={2} title="Permisos" className="tabEditUser">
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

export default withToast(EditUser);
