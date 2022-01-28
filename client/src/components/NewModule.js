import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";

import './NewModule.css';

class NewModule extends Component {
  state = {
    isLoading: false,
    name: '', // nombre
    desc: '', //
    active: false,
    friend: [],
  }

  validateForm() {
    return (this.state.name.trim().length > 4 &&
            this.state.desc.trim().length > 5);
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
    if (f.length > 0) {
      let newState = this.state;
      f.forEach(rol => {
        let index = newState.friend.findIndex(frnd => frnd.id === rol.id);
        if (index > -1) newState.friend.splice(index, 1);
      });

      this.setState(newState);
    }
  }

  handleSubmit = async event => {
    let {name, desc, active, friend} = this.state;
    let frnd = friend.map(f => f.id);

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.addModule({name: name.trim(), desc: desc.trim(), active, friend: frnd});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    let {name, desc, active, friend, isLoading} = this.state;

    return(
      <div className='NewModule'>
        <Form onSubmit={this.handleSubmit}>
          <Tabs defaultActiveKey={1} id="newmodule-tab">
            <Tab eventKey={1} title="Generales" className="tabNewModule">

              <FormGroup controlId="name">
                <ControlLabel>Nombre del modulo</ControlLabel>
                <FormControl
                  autoFocus
                  type="text"
                  value={name}
                  onChange={this.handleChange}
                  placeholder='ModuloX'
                />
              </FormGroup>
              <FormGroup controlId="desc">
                <ControlLabel>Descripción</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={desc}
                  onChange={this.handleChange}
                  placeholder="Descripción del modulo" />
              </FormGroup>

              <Checkbox onChange={e => this.setState({active: e.target.checked})} checked={active}>Activo</Checkbox>

            </Tab>
            <Tab eventKey={2} title="Amigos" className="tabNewModule">
              <Friend logued={this.props.logued} addFriend={this.addFriend} delFriend={this.delFriend} friend={friend}/>
            </Tab>
          </Tabs>

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Crear modulo"
            loadingText="Adicionando modulo…"
          />

        </Form>
      </div>

    );
  }
}

export default withToast(NewModule);
