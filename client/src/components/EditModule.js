import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";

import './EditModule.css';

class EditModule extends Component {
  state = {
    isLoading: false,
    e_name: '', // nombre
    e_desc: '', //
    e_active: false,
    e_friend: [],
  }

  fillState = (module) => {
    let newState = this.state;
    newState.e_name = JSON.parse(JSON.stringify(module.name));
    newState.e_desc = JSON.parse(JSON.stringify(module.desc));
    newState.e_active = JSON.parse(JSON.stringify(module.active));
    if (module.friend) {
      const f = module.friend.map(m => {
        if (m._id) return {id: m._id, name: m.name, module: m.module._id};
        else return {id: m.id, name: m.name, module: m.module};
      });
      newState.e_friend = JSON.parse(JSON.stringify(f));
    } else {
      newState.e_friend = [];
    }
    this.setState(newState);
  }

  async componentDidMount() {
    this.fillState(this.props.module);
  }

  async componentWillReceiveProps(nextProps) {
    this.fillState(nextProps.module);
  }

  validateForm() {
    return (this.state.e_name.trim().length > 4 &&
            this.state.e_desc.trim().length > 5);
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
    if (f.length > 0) {
      let newState = this.state;
      f.forEach(rol => {
        let index = newState.e_friend.findIndex(frnd => frnd.id === rol.id);
        if (index > -1) newState.e_friend.splice(index, 1);
      });

      this.setState(newState);
    }
  }

  handleSubmit = async event => {
    let {e_name, e_desc, e_active, e_friend} = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.updModule({name: e_name.trim(), desc: e_desc.trim(), active: e_active, friend: e_friend,  _id: this.props.module._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    let {e_name, e_desc, e_active, e_friend, isLoading} = this.state;

    return(
      <div className='EditModule'>
          <Form onSubmit={this.handleSubmit}>
            <Tabs defaultActiveKey={1} id="editmodule-tab">
              <Tab eventKey={1} title="Generales" className="tabEditModule">

                <FormGroup controlId="e_name">
                  <ControlLabel>Nombre del modulo</ControlLabel>
                  <FormControl
                    autoFocus
                    type="text"
                    value={e_name}
                    onChange={this.handleChange}
                    placeholder='ModuloX'
                  />
                </FormGroup>
                <FormGroup controlId="e_desc">
                  <ControlLabel>Descripción</ControlLabel>
                  <FormControl
                    componentClass="textarea"
                    value={e_desc}
                    onChange={this.handleChange}
                    placeholder="Descripción del modulo" />
                </FormGroup>

                <Checkbox onChange={e => this.setState({e_active: e.target.checked})} checked={e_active}>Activo</Checkbox>
              </Tab>
              <Tab eventKey={2} title="Amigos" className="tabEditModule">
                <Friend logued={this.props.logued} addFriend={this.addFriend} delFriend={this.delFriend} friend={e_friend} />
              </Tab>
            </Tabs>
            
            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={isLoading}
              text="Modificar modulo"
              loadingText="Modificando modulo…"
            />

          </Form>
      </div>
    );
  }
}

export default withToast(EditModule);
