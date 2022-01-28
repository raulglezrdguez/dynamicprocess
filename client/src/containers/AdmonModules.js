import React, { Component } from "react";
import { Checkbox } from "react-bootstrap";

import NewModule from '../components/NewModule';
import ShowModule from '../components/ShowModule';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import './AdmonModules.css';

class AdmonModules extends Component {
  state = {
      modules: [], // modules de la pagina activa
      currentPage: 1, // pagina que se muestra
      items4Page: 2, // modules por pagina
      itemsTotal: 0, // cantidad de modules total
      newModule: false, // muestro formulario para crear nuevo modulo?
  }

  refreshModules = () => {
    let {logued} = this.props;

    if (logued.signedIn) {
      let { items4Page, currentPage } = this.state;
      let skip = (currentPage - 1) * items4Page;

  		fetch(`/api/getModules?token=${logued.token}&skip=${skip}&limit=${items4Page}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(modules => {
              let newState = this.state;
              newState.itemsTotal = modules.count;
              newState.modules = modules.modules;

              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener modulos: ${err.message}`);
            })
          }
  			});
    }
	}

  addModule = (module) => {
    if (this.props.logued.signedIn) {
      let {name, desc, active, friend } = module;

      return fetch('/api/addModule/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            name: name,
            desc: desc,
            active,
            friend
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(module => {
              this.refreshModules();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar modulo: ${err.message}`);
            });
          }
  			});
    }
  }

  updModule = (module) => {
    if (this.props.logued.signedIn) {
      let {_id, name, desc, active, friend} = module;
      let frnd = friend.map(f => f.id);

      return fetch('/api/updModule/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            name: name,
            desc: desc,
            active,
            friend: frnd
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(module => {
              let newState = this.state;
              for(let i = 0; i < newState.modules.length; i++) {
                if (newState.modules[i]._id === _id) {
                  newState.modules[i].name = name;
                  newState.modules[i].desc = desc;
                  newState.modules[i].active = active;
                  newState.modules[i].friend = friend;

                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar modulo: ${err.message}`);
            });
          }
  			});
    }
  }

  delModule = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delModule/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshModules();
              } else {
                this.props.showError('No fue posible eliminar el modulo.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar modulo: ${err.message}`);
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
    this.setState(newState, this.refreshModules);
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages = Math.ceil(itemsTotal / items4Page);

    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  render() {
    let {modules, itemsTotal, items4Page, currentPage, newModule} = this.state;

    let modulesList = null;
    if (itemsTotal > 0) {
      let showModules = modules.map((m, i) => (<ShowModule key={i} updModule={this.updModule} delModule={this.delModule} module={m} logued={this.props.logued}/>));
      modulesList = <div className='ModulesList'>
        <p>Listado de modulos <span className="label label-primary">{itemsTotal}</span></p>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          <div className="divModulesList">
            {showModules}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />

      </div>
    }

    let showNewModule = newModule ? <NewModule addModule={this.addModule} logued={this.props.logued} /> : null;

    return(
      <div className='AdmonModules'>

        {modulesList}

        <div className='ModulesList'>
          <Checkbox onChange={e => this.setState({newModule: e.target.checked})} checked={newModule}>Crear nuevo modulo</Checkbox>

          {showNewModule}
        </div>
      </div>
    );
  }
}

export default withToast(AdmonModules);
