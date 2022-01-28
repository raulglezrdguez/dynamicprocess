import React, { Component } from "react";
import { Checkbox, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import NewStage from './NewStage';
import ShowStage from './ShowStage';

import withToast from './withToast';
import Pagination from './Pagination';

import './AdmonStages.css';

class AdmonStages extends Component {
  state = {
    allstages: [], // todas las etapas del proceso
    firstStage: '', // primera etapa del proceso
    currentPage: 1, // pagina que se muestra
    items4Page: 1, // etapas por pagina
    newStage: false, // muestro formulario para crear nueva etapa?
  }

  orderStages = (firstStage, stages) => {
    const findFrom = (pos, stages, id) => {
      for(let i = pos; i < stages.length; i++) {
        if (stages[i]._id === id) return i;
      }
      return -1;
    }

    let nextStage = firstStage;
    let orderedStages = JSON.parse(JSON.stringify(stages));
    let pos = 0;

    while (pos < orderedStages.length) {
      const stg = findFrom(pos, orderedStages, nextStage);
      if (stg === -1) return orderedStages;
      else {
        // intercambio los valores
        [orderedStages[pos], orderedStages[stg]] = [orderedStages[stg], orderedStages[pos]];
        if (orderedStages[pos].next.length > 0) nextStage = orderedStages[pos].next[0]._id;
        else return orderedStages;
        pos++;
      }
    }

    return orderedStages;
  }

  refreshStages = (process) => {
    if (this.props.logued.signedIn) {
  		fetch(`/api/getStage?token=${this.props.logued.token}&process=${process}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(stages => {
              let newState = this.state;
              newState.firstStage = stages.firststage;
              // newState.allstages = stages.stage;
              newState.allstages = this.orderStages(stages.firststage, stages.stage);

              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener etapas: ${err.message}`);
            })
          }
  			});
    }
	}

  addStage = (stage) => {
    if (this.props.logued.signedIn) {
      // let { name, desc, rol, rolstage, next, datefrom, dateto } = stage;
      let { name, desc, rol, rolstage, next, active } = stage;
      let { process } = this.props;

      return fetch('/api/addStage/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            process,
            name,
            desc,
            rol,
            rolstage,
            next,
            active
            // datefrom,
            // dateto
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(fld => {
              this.setState({newStage: false}, () => this.refreshStages(process));
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar etapa: ${err.message}`);
            });
          }
  			});
    }
  }

  updStage = (stage) => {
    if (this.props.logued.signedIn) {
      // let { _id, name, desc, rol, rolstage, next, datefrom, dateto } = stage;
      let { _id, name, desc, rol, rolstage, next, active } = stage;

      let upd_rol = rol ? rol.map(f => f.id) : [];
      let upd_rolstage = rolstage ? rolstage.map(f => f.id) : [];
      let upd_next = next ? next.map(f => f._id) : [];

      return fetch('/api/updStage/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            process: this.props.process,
            name,
            desc,
            rol: upd_rol,
            rolstage: upd_rolstage,
            next: upd_next,
            active
            // datefrom,
            // dateto
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(fld => {
              let newState = this.state;
              for(let i = 0; i < newState.allstages.length; i++) {
                if (newState.allstages[i]._id === _id) {
                  newState.allstages[i].name = name;
                  newState.allstages[i].desc = desc;
                  newState.allstages[i].rol = rol;
                  newState.allstages[i].rolstage = rolstage;
                  newState.allstages[i].next = next;
                  newState.allstages[i].active = active;
                  // newState.allstages[i].datefrom = datefrom;
                  // newState.allstages[i].dateto = dateto;

                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar etapa: ${err.message}`);
            });
          }
  			});
    }
  }

  delStage = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delStage/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshStages(this.props.process);
              } else {
                this.props.showError('No fue posible eliminar la etapa.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar etapa: ${err.message}`);
            });
          }
  			});
    }
  }

  setFirstStage = () => {
    if (this.props.logued.signedIn) {
      fetch('/api/setFirstStage/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            process: this.props.process,
            firststage: this.state.firstStage,
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (!response.ok) {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar primera etapa: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshStages(this.props.process);
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.process !== nextProps.process){
      this.refreshStages(nextProps.process);
    }
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, () => this.refreshStages(this.props.process));
  }

  updPage = () => {
    let {allstages, currentPage, items4Page} = this.state;
    const totalPages= Math.ceil(allstages.length / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  render() {
    let { allstages, firstStage, items4Page, currentPage, newStage } = this.state;

    let stagesList = null;
    if (allstages.length > 0) {
      const stagesOptions = allstages.map((s, i) => (<option key={i} value={s._id}>{s.name}</option>));

      const stages = allstages.filter((s, i) => ((i >= ((currentPage - 1) * items4Page)) && (i < (currentPage * items4Page))));
      let showStages = stages.map((s, i) => (<ShowStage key={i} updStage={this.updStage} delStage={this.delStage} stage={s} logued={this.props.logued} />));
      stagesList = <div className='StagesList'>
        <FormGroup controlId="firstStage">
          <ControlLabel>Primera etapa</ControlLabel>
          <FormControl
            componentClass="select"
            defaultValue={firstStage}
            onChange={(e) => this.setState({firstStage: e.target.value}, this.setFirstStage)} >
            {stagesOptions}
          </FormControl>
        </FormGroup>

        <p>Listado de etapas <span className="label label-primary">{allstages.length}</span></p>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(allstages.length / items4Page)} currentPage={currentPage} />
          <div className="divStagesList">
            {showStages}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(allstages.length / items4Page)} currentPage={currentPage} />

      </div>
    }

    let showNewStage = newStage ? <NewStage addStage={this.addStage} logued={this.props.logued} /> : null;

    return(
        <div className='AdmonStagesBody'>

          {stagesList}

          <div className='StagesList'>
            <Checkbox onChange={e => this.setState({newStage: e.target.checked})} checked={newStage}>Crear nueva etapa</Checkbox>

            {showNewStage}
          </div>
      </div>);
  }
}

export default withToast(AdmonStages);
