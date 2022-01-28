import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";

import './NewTable.css';

class NewTable extends Component {
  state = {
    isLoading: false,
    name: '', // nombre
    desc: '', //
    n_modules: [],
    n_module: '',
    active: false,
    free: false,
    friend: [],
    data: [],

  }

  refreshModules = () => {
    if (this.props.logued.signedIn) {

      fetch(`/api/getModules?token=${this.props.logued.token}&active=true`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(modules => {
              let newState = this.state;
              newState.n_modules = modules.modules;
              if (modules.modules.length > 0) newState.n_module = modules.modules[0]._id;
              else newState.n_module = '';

              this.setState(newState);
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener modulos: ${err.message.message}`);
            })
          }
        });
    }
  }

  async componentDidMount() {
    this.refreshModules();
  }

  validateForm() {
    let {name, desc, n_module} = this.state;

    return (name.trim().length > 4 &&
            desc.trim().length > 5 &&
            n_module.trim() !== '');
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  addFriend = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.friend.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.friend = newState.friend.concat(toAdd);
      this.setState(newState);
    }
  }

  delFriend = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.friend.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.friend.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  addData = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.data.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.data = newState.data.concat(toAdd);
      this.setState(newState);
    }
  }

  delData = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.data.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.data.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  handleSubmit = async event => {
    let {name, desc, n_module, active, free, friend, data} = this.state;
    let frnd = friend.map(f => f.id);
    let dt = data.map(f => f.id);

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.addTable({name: name.trim(), desc: desc.trim(), module: n_module, active, free, friend: frnd, data: dt});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    let {name, desc, active, free, friend, data, isLoading, n_modules, n_module} = this.state;

    const moduleOptions = n_modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));

    return(
      <div className='NewTable'>
        <Form onSubmit={this.handleSubmit}>

          <Tabs defaultActiveKey={1} id="newtable-tab">
            <Tab eventKey={1} title="Generales" className="tabNewTable">

              <FormGroup controlId="n_module">
                <ControlLabel>Modulo</ControlLabel>
                <FormControl
                  componentClass="select"
                  defaultValue={n_module}
                  onChange={this.handleChange}
                >
                  {moduleOptions}
                </FormControl>
              </FormGroup>

              <FormGroup controlId="name">
                <ControlLabel>Nombre de la tabla</ControlLabel>
                <FormControl
                  type="text"
                  value={name}
                  onChange={this.handleChange}
                  placeholder="Nombre de la tabla" />
              </FormGroup>
              <FormGroup controlId="desc">
                <ControlLabel>Descripción</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={desc}
                  onChange={this.handleChange}
                  placeholder="Descripción de la tabla" />
              </FormGroup>

              <Checkbox onChange={e => this.setState({active : e.target.checked})} checked={active}>Activa</Checkbox>

              <Checkbox onChange={e => this.setState({free : e.target.checked})} checked={free}>Datos públicos</Checkbox>

            </Tab>
            <Tab eventKey={2} title="Amigos" className="tabNewTable">

              <Friend logued={this.props.logued} addFriend={this.addFriend} delFriend={this.delFriend} friend={friend} header=""/>

            </Tab>
            <Tab eventKey={3} title="Editan datos" className="tabNewTable">

              <Friend logued={this.props.logued} addFriend={this.addData} delFriend={this.delData} friend={data} header="" />

            </Tab>
          </Tabs>

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Crear tabla"
            loadingText="Adicionando tabla…"
          />

        </Form>
      </div>

    );
  }
}

export default withToast(NewTable);
