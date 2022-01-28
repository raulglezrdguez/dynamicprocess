import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";

import './NewRol.css';

class NewRol extends Component {
  state = {
    isLoading: false,
    name: '', // nombre
    desc: '', //
    active: false,
    modules: [],
    n_module: ''
  }

  refreshModules = () => {
    if (this.props.logued.signedIn) {

      fetch(`/api/getModules?token=${this.props.logued.token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(modules => {
              let newState = this.state;
              newState.modules = modules.modules;
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

  validateForm() {
    let {name, desc, n_module} = this.state;
    return (name.trim().length > 4 &&
            desc.trim().length > 5 &&
            n_module !== '');
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    let {name, desc, active, n_module} = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.addRol({name: name.trim(), desc: desc.trim(), active, module: n_module});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  async componentDidMount() {
    this.refreshModules();
  }

  render() {
    let {modules, n_module, name, desc, active, isLoading} = this.state;

    const moduleOptions = modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));

    return(
      <div className='NewRol'>
        <Form onSubmit={this.handleSubmit}>

          <FormGroup controlId="n_module">
            <ControlLabel>Modulo</ControlLabel>
            <FormControl
              componentClass="select"
              defaultValue={n_module}
              onChange={this.handleChange} >
              {moduleOptions}
            </FormControl>
          </FormGroup>

          <FormGroup controlId="name">
            <ControlLabel>Nombre</ControlLabel>
            <FormControl
              type="text"
              value={name}
              onChange={this.handleChange}
              placeholder="RolX" />
          </FormGroup>

          <FormGroup controlId="desc">
            <ControlLabel>Descripción</ControlLabel>
            <FormControl
              componentClass="textarea"
              value={desc}
              onChange={this.handleChange}
              placeholder="Descripción del rol" />
          </FormGroup>

          <Checkbox onChange={e => this.setState({active: e.target.checked})} checked={active}>Activo</Checkbox>

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={isLoading}
            text="Crear rol"
            loadingText="Adicionando rol…"
          />

        </Form>
      </div>

    );
  }
}

export default withToast(NewRol);
