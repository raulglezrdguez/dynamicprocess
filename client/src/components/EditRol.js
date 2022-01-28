import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";

import './EditRol.css';

class EditRol extends Component {
  state = {
    isLoading: false,
    e_name: '', // nombre
    e_desc: '', //
    e_active: false,
    e_module: ''
  }

  fillState = (rol) => {
    let newState = this.state;
    newState.e_module = JSON.parse(JSON.stringify(rol.module));
    newState.e_name = JSON.parse(JSON.stringify(rol.name));
    newState.e_desc = JSON.parse(JSON.stringify(rol.desc));
    newState.e_active = JSON.parse(JSON.stringify(rol.active));
    this.setState(newState);
  }

  async componentDidMount() {
    this.fillState(this.props.rol);
  }

  async componentWillReceiveProps(nextProps) {
    this.fillState(nextProps.rol);
  }

  validateForm() {
    let {e_name, e_desc, e_module} = this.state;
    return (e_name.trim().length > 4 &&
            e_desc.trim().length > 5 &&
            e_module !== '');
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    let {e_name, e_desc, e_active, e_module} = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.updRol({module: e_module, name: e_name.trim(), desc: e_desc.trim(), active: e_active, _id: this.props.rol._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    let {e_name, e_desc, e_active, isLoading} = this.state;

    return(
      <div className='EditRol'>
        <Form onSubmit={this.handleSubmit}>
          <FormGroup controlId="e_name">
            <ControlLabel>Nombre</ControlLabel>
            <FormControl
              type="text"
              value={e_name}
              onChange={this.handleChange}
              placeholder="RolX" />
          </FormGroup>
          <FormGroup controlId="e_desc">
            <ControlLabel>Descripción</ControlLabel>
            <FormControl
              componentClass="textarea"
              value={e_desc}
              onChange={this.handleChange}
              placeholder="Descripción del rol" />
          </FormGroup>

          <Checkbox onChange={e => this.setState({e_active: e.target.checked})} checked={e_active}>Activo</Checkbox>

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Modificar rol"
            loadingText="Modificando rol…"
          />

        </Form>
      </div>
    );
  }
}

export default withToast(EditRol);
