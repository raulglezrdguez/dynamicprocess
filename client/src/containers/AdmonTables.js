import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import NewTable from '../components/NewTable';
import ShowTable from '../components/ShowTable';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import './AdmonTables.css';

class AdmonTables extends Component {
  state = {
    modules: [], // modulos a que tiene acceso el usuario
    module: '', // modulo activo
    tables: [], // tables de la pagina activa
    currentPage: 1, // pagina que se muestra
    items4Page: 2, // tables por pagina
    itemsTotal: 0, // cantidad de tables total
    newTable: false, // muestro formulario para crear nueva tabla?
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
              newState.modules = modules.modules;
              if (modules.modules.length > 0) newState.module = modules.modules[0]._id;
              else newState.module = '';

              this.setState(newState, this.refreshTables);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener modulos: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshTables = () => {
    let {logued} = this.props;

    if (logued.signedIn) {
      let { items4Page, currentPage, module } = this.state;
      let skip = (currentPage - 1) * items4Page;

  		fetch(`/api/getTables?token=${logued.token}&skip=${skip}&limit=${items4Page}&module=${module}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(tables => {

              let newState = this.state;
              newState.itemsTotal = tables.count;
              newState.tables = tables.tables;

              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener tablas: ${err.message}`);
            })
          }
  			});
    }
	}

  addTable = (table) => {
    if (this.props.logued.signedIn) {
      let {name, desc, active, module, friend, data, free } = table;

      return fetch('/api/addTable/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            name: name,
            desc: desc,
            active,
            free,
            module,
            friend,
            data
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(table => {
              this.refreshTables();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar tabla: ${err.message}`);
            });
          }
  			});
    }
  }

  updTable = (table) => {
    if (this.props.logued.signedIn) {
      let {_id, name, desc, module, active, friend, data, free} = table;
      let frnd = friend.map(f => f.id);
      let dt = data.map(f => f.id);

      return fetch('/api/updTable/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            name: name,
            desc: desc,
            module,
            active,
            free,
            friend: frnd,
            data: dt
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(table => {
              let newState = this.state;
              for(let i = 0; i < newState.tables.length; i++) {
                if (newState.tables[i]._id === _id) {
                  newState.tables[i].name = name;
                  newState.tables[i].desc = desc;
                  newState.tables[i].module = this.state.modules.find(m => (module === m._id));
                  newState.tables[i].active = active;
                  newState.tables[i].friend = friend;
                  newState.tables[i].data = data;
                  newState.tables[i].free = free;

                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar tabla: ${err.message}`);
            });
          }
  			});
    }
  }

  delTable = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delTable/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshTables();
              } else {
                this.props.showError('No fue posible eliminar la tabla.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar tabla: ${err.message}`);
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
    this.setState(newState, this.refreshTables);
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages = Math.ceil(itemsTotal / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  handleChangeModule = event => {
    this.setState({module: event.target.value}, this.refreshTables);
  }

  render() {
    let {modules, module, tables, itemsTotal, items4Page, currentPage, newTable} = this.state;

    let tablesList = null;
    if (itemsTotal > 0) {
      let showTables = tables.map((m, i) => (<ShowTable key={i} updTable={this.updTable} delTable={this.delTable} table={m} logued={this.props.logued}/>));
      tablesList = <div className='TablesList'>
        <p>Listado de tablas <span className="label label-primary">{itemsTotal}</span></p>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          <div className="divTablesList">
            {showTables}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />

      </div>
    }

    let showNewTable = newTable ? <NewTable addTable={this.addTable} logued={this.props.logued} /> : null;

    const moduleOptions = modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));

    return(
      <div className='AdmonTables'>
        <div className='TablesList'>
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

          {tablesList}
        </div>


        <div className='TablesList'>
          <Checkbox onChange={e => this.setState({newTable: e.target.checked})} checked={newTable}>Crear nueva tabla</Checkbox>

          {showNewTable}
        </div>
      </div>
    );
  }
}

export default withToast(AdmonTables);
