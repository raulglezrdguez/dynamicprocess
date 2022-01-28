import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";

import './NewProcess.css';

class NewProcess extends Component {
  state = {
    isLoading: false,
    name: '', // nombre
    desc: '', //
    active: false,
    friend: [],
    data: [],
    tprocess: ''
  }

  setTProcess = (tprocess) => {
    if (tprocess && (tprocess.length > 0)) {
      let newState = this.state;
      newState.tprocess = tprocess[0]._id;
      this.setState(newState);
    }
  }

  async componentDidMount() {
    this.setTProcess(this.props.tprocess);
  }

  async componentWillReceiveProps(nextProps) {
    this.setTProcess(nextProps.tprocess);
  }

  validateForm() {
    return (this.state.name.trim().length > 4 &&
            this.state.desc.trim().length > 5 &&
            this.state.tprocess !== '');
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

    const toAdd = f.filter(frnd => (!newState.data.find(dt => (frnd.id === dt.id))));
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
    let {name, desc, tprocess, active, friend, data} = this.state;
    let frnd = friend.map(f => f.id);
    let dts = data.map(d => d.id);

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.addProcess({name: name.trim(), desc: desc.trim(), tprocess, active, friend: frnd, data: dts});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    let {name, desc, tprocess, active, friend, data, isLoading} = this.state;

    const tprocessOptions = this.props.tprocess.map((tp, i) => (<option key={i} value={tp._id}>{tp.name}</option>));

    return(
      <div className='NewProcess'>
        <Form onSubmit={this.handleSubmit}>

          <Tabs defaultActiveKey={1} id="newprocess-tab">
            <Tab eventKey={1} title="Generales" className="tabNewProcess">

              <FormGroup controlId="tprocess">
                <ControlLabel>Tipo de proceso</ControlLabel>
                <FormControl
                  componentClass="select"
                  defaultValue={tprocess}
                  onChange={this.handleChange} >
                  {tprocessOptions}
                </FormControl>
              </FormGroup>
              <FormGroup controlId="name">
                <ControlLabel>Nombre del proceso</ControlLabel>
                <FormControl
                  autoFocus
                  type="text"
                  value={name}
                  onChange={this.handleChange}
                  placeholder='ProcesoX'
                />
              </FormGroup>
              <FormGroup controlId="desc">
                <ControlLabel>Descripción</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  value={desc}
                  onChange={this.handleChange}
                  placeholder="Descripción del proceso" />
              </FormGroup>

              <Checkbox onChange={e => this.setState({active: e.target.checked})} checked={active}>Activo</Checkbox>

            </Tab>

            <Tab eventKey={2} title="Amigos" className="tabNewProcess">
              <Friend logued={this.props.logued} addFriend={this.addFriend} delFriend={this.delFriend} friend={friend} />
            </Tab>
            
            <Tab eventKey={3} title="Ver datos" className="tabNewProcess">
              <Friend logued={this.props.logued} addFriend={this.addData} delFriend={this.delData} friend={data} />
            </Tab>
          </Tabs>

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Crear proceso"
            loadingText="Adicionando proceso…"
          />

        </Form>
      </div>

    );
  }
}

export default withToast(NewProcess);
