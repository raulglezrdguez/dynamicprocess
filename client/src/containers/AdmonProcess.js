import React, { Component } from "react";
import { Checkbox } from "react-bootstrap";

import NewProcess from '../components/NewProcess';
import ShowProcess from '../components/ShowProcess';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import './AdmonProcess.css';

class AdmonProcess extends Component {
  state = {
      tprocess: [], // tipos de procesos
      process: [], // procesos de la pagina activa
      currentPage: 1, // pagina que se muestra
      items4Page: 2, // procesos por pagina
      itemsTotal: 0, // cantidad de procesos total
      newProcess: false, // muestro formulario para crear nuevo proceso?
  }

  refreshTProcess = () => {
    let {logued} = this.props;

    if (logued.signedIn) {

  		fetch(`/api/getTProcess?token=${logued.token}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(tprocess => {
              let newState = this.state;
              newState.tprocess = tprocess.tprocess;
              this.setState(newState, this.refreshProcess);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener tipos de procesos: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshProcess = () => {
    let {logued} = this.props;

    if (logued.signedIn) {
      let { items4Page, currentPage } = this.state;
      let skip = (currentPage - 1) * items4Page;

  		fetch(`/api/getProcess?token=${logued.token}&skip=${skip}&limit=${items4Page}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(process => {
              let newState = this.state;
              newState.itemsTotal = process.count;
              newState.process = process.process;
              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener procesos: ${err.message}`);
            })
          }
  			});
    }
	}

  addProcess = (process) => {
    if (this.props.logued.signedIn) {

      let {name, desc, tprocess, active, friend, data} = process;

      return fetch('/api/addProcess/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            name,
            desc,
            tprocess,
            active,
            friend,
            data
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(result => {
              this.refreshProcess();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar proceso: ${err.message}`);
            });
          }
  			});
    }
  }

  updProcess = (process) => {
    if (this.props.logued.signedIn) {
      let {_id, name, desc, tprocess, active, friend, data} = process;
      let frnd = friend.map(f => f.id);
      let dts = data.map(d => d.id);

      return fetch('/api/updProcess/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            name,
            desc,
            tprocess,
            active,
            friend: frnd,
            data: dts
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(table => {
              let newState = this.state;
              for(let i = 0; i < newState.process.length; i++) {
                if (newState.process[i]._id === _id) {
                  newState.process[i].name = name;
                  newState.process[i].desc = desc;
                  newState.process[i].tprocess = this.state.tprocess.find(tp => (tp._id === tprocess));
                  newState.process[i].active = active;
                  newState.process[i].friend = friend;
                  newState.process[i].data = data;

                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar proceso: ${err.message}`);
            });
          }
  			});
    }
  }

  delProcess = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delProcess/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshProcess();
              } else {
                this.props.showError('No fue posible eliminar el proceso.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar proceso: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshTProcess();
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, this.refreshProcess);
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages = Math.ceil(itemsTotal / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  render() {
    let {tprocess, process, itemsTotal, items4Page, currentPage, newProcess} = this.state;

    let processList = null;
    if (itemsTotal > 0) {
      let showProcess = process.map((p, i) => (<ShowProcess key={i} updProcess={this.updProcess} delProcess={this.delProcess} tprocess={tprocess} process={p} logued={this.props.logued}/>));
      processList = <div className='ProcessList'>
        <p>Listado de procesos <span className="label label-primary">{itemsTotal}</span></p>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          <div className="divProcessList">
            {showProcess}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />

      </div>
    }

    let showNewProcess = newProcess ? <NewProcess addProcess={this.addProcess} tprocess={tprocess} logued={this.props.logued} /> : null;

    return(
      <div className='AdmonProcess'>

        {processList}

        <div className='ProcessList'>
          <Checkbox onChange={e => this.setState({newProcess: e.target.checked})} checked={newProcess}>Crear nuevo proceso</Checkbox>

          {showNewProcess}
        </div>
      </div>
    );
  }
}

export default withToast(AdmonProcess);
