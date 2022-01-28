import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";
import AdmonFields from "./AdmonFields";

import './EditTable.css';

class EditTable extends Component {
  state = {
    isLoading: false,
    e_name: '', // nombre
    e_desc: '', //
    e_modules: [],
    e_module: '',
    e_active: false,
    e_free: false,
    e_friend: [],
    e_data: [],

  }

  refreshModules = (table) => {
    if (this.props.logued.signedIn) {

      fetch(`/api/getModules?token=${this.props.logued.token}&active=true`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(modules => {
              let newState = this.state;
              newState.e_modules = modules.modules;

              this.setState(newState, () => this.fillState(table));
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener modulos: ${err.message.message}`);
            });
          }
        });
    }
  }

  fillState = (table) => {
    let newState = this.state;
    newState.e_name = JSON.parse(JSON.stringify(table.name));
    newState.e_desc = JSON.parse(JSON.stringify(table.desc));
    newState.e_active = JSON.parse(JSON.stringify(table.active));
    newState.e_free = JSON.parse(JSON.stringify(table.free));
    newState.e_module = JSON.parse(JSON.stringify(table.module._id));
    if (table.friend) {
      const f = table.friend.map(m => {
        if (m._id) return {id: m._id, name: m.name, module: m.module._id};
        else return {id: m.id, name: m.name, module: m.module};
      });
      newState.e_friend = JSON.parse(JSON.stringify(f));
    } else {
      newState.e_friend = [];
    }
    if (table.data) {
      const f = table.data.map(m => {
        if (m._id) return {id: m._id, name: m.name, module: m.module._id};
        else return {id: m.id, name: m.name, module: m.module};
      });
      newState.e_data = JSON.parse(JSON.stringify(f));
    } else {
      newState.e_data = [];
    }

    this.setState(newState);
  }

  async componentDidMount() {
    this.refreshModules(this.props.table);
  }

  async componentWillReceiveProps(nextProps) {
    this.fillState(nextProps.table);
  }

  validateForm() {
    let {e_name, e_desc, e_module} = this.state;

    return (e_name.trim().length > 4 &&
            e_desc.trim().length > 5 &&
            e_module.trim() !== '');
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  addFriend = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.e_friend.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.e_friend = newState.e_friend.concat(toAdd);
      this.setState(newState);
    }
  }

  delFriend = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.e_friend.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.e_friend.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  addData = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.e_data.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.e_data = newState.e_data.concat(toAdd);
      this.setState(newState);
    }
  }

  delData = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.e_data.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.e_data.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  handleSubmit = async event => {
    let {e_name, e_desc, e_module, e_active, e_free, e_friend, e_data} = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.updTable({name: e_name.trim(), desc: e_desc.trim(), module: e_module, active: e_active, free: e_free, friend: e_friend, data: e_data, _id: this.props.table._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    let {e_name, e_desc, e_active, e_free, e_friend, e_data, isLoading, e_modules, e_module} = this.state;

    const moduleOptions = e_modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));

    return(
      <div className='EditTables'>
        <Form onSubmit={this.handleSubmit}>

          <Tabs defaultActiveKey={1} id="edittable-tab">
            <Tab eventKey={1} title="Generales" className="tabEditTable">

              <FormGroup controlId="e_module">
                <ControlLabel>Modulo</ControlLabel>
                <FormControl
                  componentClass="select"
                  value={e_module}
                  onChange={this.handleChange}
                >
                  {moduleOptions}
                </FormControl>
              </FormGroup>

              <FormGroup controlId="e_name">
                <ControlLabel>Nombre de la tabla</ControlLabel>
                <FormControl
                  type="text"
                  value={e_name}
                  onChange={this.handleChange}
                  placeholder="Nombre de la tabla" />
              </FormGroup>
              <FormGroup controlId="e_desc">
                <ControlLabel>Descripción</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={e_desc}
                  onChange={this.handleChange}
                  placeholder="Descripción de la tabla" />
              </FormGroup>

              <Checkbox onChange={e => this.setState({e_active: e.target.checked})} checked={e_active}>Activa</Checkbox>

              <Checkbox onChange={e => this.setState({e_free: e.target.checked})} checked={e_free}>Datos públicos</Checkbox>

            </Tab>
            <Tab eventKey={2} title="Amigos" className="tabEditTable">
              <Friend logued={this.props.logued} addFriend={this.addFriend} delFriend={this.delFriend} friend={e_friend} />

            </Tab>
            <Tab eventKey={3} title="Editan datos" className="tabEditTable">
              <Friend logued={this.props.logued} addFriend={this.addData} delFriend={this.delData} friend={e_data} header='Editan datos' />

            </Tab>
            <Tab eventKey={4} title="Campos" className="tabEditTable">
              <AdmonFields table={this.props.table._id} logued={this.props.logued} />
            </Tab>
          </Tabs>

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Modificar tabla"
            loadingText="Modificando tabla…"
          />

        </Form>
      </div>
    );
  }
}

export default withToast(EditTable);
