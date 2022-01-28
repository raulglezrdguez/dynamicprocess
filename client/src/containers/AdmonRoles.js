import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

// import { Badge } from "reactstrap";

import NewRol from '../components/NewRol';
import ShowRol from '../components/ShowRol';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import './AdmonRoles.css';

class AdmonRoles extends Component {
  state = {
      modules: [], // todos los modulos del sistema a que tiene acceso el usuario
      module: '', // modulo activo
      roles: [], // roles de la pagina activa
      currentPage: 1, // pagina que se muestra
      items4Page: 2, // roles por pagina
      itemsTotal: 0, // cantidad de roles total
      newRol: false, // muestro formulario para crear nuevo rol?
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
              if (modules.modules.length > 0) newState.module = modules.modules[0]._id;
              else newState.module = '';

              this.setState(newState, this.refreshRoles);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener modulos: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshRoles = () => {
    if (this.props.logued.signedIn) {
      let { items4Page, currentPage, module } = this.state;
      let skip = (currentPage - 1) * items4Page;

  		fetch(`/api/getRoles?token=${this.props.logued.token}&skip=${skip}&limit=${items4Page}&module=${module}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(roles => {
              let newState = this.state;
              newState.itemsTotal = roles.count;
              newState.roles = roles.roles;

              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener roles: ${err.message}`);
            })
          }
  			});
    }
	}

  addRol = (rol) => {
    if (this.props.logued.signedIn) {
      let {name, desc, active, module } = rol;

      return fetch('/api/addRol/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            name,
            desc,
            active,
            module
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(rol => {
              this.refreshRoles();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar rol: ${err.message}`);
            });
          }
  			});
    }
  }

  updRol = (rol) => {
    if (this.props.logued.signedIn) {
      let {_id, name, desc, active, module} = rol;

      return fetch('/api/updRol/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            name,
            desc,
            active,
            module
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(rol => {
              let newState = this.state;
              for(let i = 0; i < newState.roles.length; i++) {
                if (newState.roles[i]._id === _id) {
                  newState.roles[i].name = name;
                  newState.roles[i].desc = desc;
                  newState.roles[i].active = active;

                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar rol: ${err.message}`);
            });
          }
  			});
    }
  }

  delRol = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delRol/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshRoles();
              } else {
                this.props.showError('No fue posible eliminar el rol.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar rol: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshModules();
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, this.refreshRoles);
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages= Math.ceil(itemsTotal / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  handleChangeModule = event => {
    this.setState({module: event.target.value}, this.refreshRoles);
  }

  render() {
    let {modules, module, roles, itemsTotal, items4Page, currentPage, newRol} = this.state;

    const moduleOptions = modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));

    let rolesList = null;
    if (itemsTotal > 0) {
      let showRoles = roles.map((r, i) => (<ShowRol key={i} updRol={this.updRol} delRol={this.delRol} rol={r} logued={this.props.logued} />));
      rolesList = <div className='RolesList'>
        <p>Listado de roles <span className="label label-primary">{itemsTotal}</span></p>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          <div className="divRolesList">
            {showRoles}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />

      </div>
    }

    let showNewRol = newRol ? <NewRol addRol={this.addRol} logued={this.props.logued}/> : null;

    return(
      <div className='AdmonRoles'>
        <div className='RolesList'>
          <Form>
            <FormGroup controlId="module">
              <ControlLabel>Modulo</ControlLabel>
              <FormControl
                componentClass="select"
                onChange = {this.handleChangeModule}
                defaultValue = {module} >
                  {moduleOptions}
              </FormControl>
            </FormGroup>
          </Form>

          {rolesList}

        </div>

        <div className='RolesList'>
          <Checkbox onChange={e => this.setState({newRol: e.target.checked})} checked={newRol}>Crear nuevo rol</Checkbox>

          {showNewRol}
        </div>
      </div>
    );
  }
}

export default withToast(AdmonRoles);
