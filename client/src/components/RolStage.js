import React, { Component } from "react";
import { Checkbox, FormControl, Button, Glyphicon } from "react-bootstrap";

import withToast from './withToast';

import './RolStage.css';

class RolStage extends Component {
  state = {
    active: [], // etapas que se han marcado, para pasar a formar parte de las etapas rolstage
    theprocess: [], // los procesos a los que tiene ecceso el usuario logueado
    process: '', // el proceso activo
    stages: [], // las etapas del proceso activo
    rolstage: [] // todas las etapas que se han seleccionado
  }

  refreshProcess = () => {
    let {logued} = this.props;

    if (logued.signedIn) {

      fetch(`/api/getProcess?token=${logued.token}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(process => {
              let newState = this.state;
              newState.theprocess = process.process;
              if (process.process.length > 0) newState.process = process.process[0]._id;
              else  newState.process = '';
              this.setState(newState, this.refreshStages);
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener procesos: ${err.message.message}`);
            })
          }
        });
    }
  }

  refreshStages = () => {
    let {logued} = this.props;

    if (logued.signedIn) {
      let { process } = this.state;

  		fetch(`/api/getStage?token=${logued.token}&process=${process}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(stages => {
              let newState = this.state;
              newState.stages = stages.stage;
              newState.active = newState.stages.map(r => ({id: r._id, value: false, name: r.name, process: process}));
              this.setState(newState, () => this.refreshRolStages(this.props.rolstage));
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener etapas: ${err.message.message}`);
            })
          }
  			});
    }
	}

  refreshRolStages = (rolstages) => {
    let {theprocess} = this.state;
    let newState = this.state;
    newState.rolstage = rolstages.map(f => {
      const p = theprocess.find(p => (p._id === f.process));
      let processName = p ? p.name : '';
      // for(let i = 0; i < theprocess.length; i++){
      //   if (theprocess[i]._id === f.process){
      //     processName = theprocess[i].name;
      //
      //     break;
      //   }
      // }
      return {id: f.id, name: f.name, process: f.process, processName, value: false}
    });
    this.setState(newState);
  }

  isActive = (id) => {
    let {active} = this.state;
    const act = active.find(a => (a.id === id));
    const res = act ? act.value : false;
    // let res = false;
    // for(let i = 0; i < active.length; i++) {
    //   if (active[i].id === id) {
    //     res = active[i].value;
    //
    //     break;
    //   }
    // }
    return res;
  }

  isActiveRolStage = (id) => {
    let {rolstage} = this.state;
    const act = rolstage.find(rs => (rs.id === id));
    const res = act ? act.value : false;
    // let res = false;
    // for(let i = 0; i < rolstage.length; i++) {
    //   if (rolstage[i].id === id) {
    //     res = rolstage[i].value;
    //
    //     break;
    //   }
    // }
    return res;
  }

  setActive = (id) => {
    let newState = this.state;
    for(let i = 0; i < newState.active.length; i++) {
      if (newState.active[i].id === id) {
        newState.active[i].value = !newState.active[i].value;

        break;
      }
    }

    this.setState(newState);
  }

  setActiveRolStage = (id) => {
    let newState = this.state;
    for(let i = 0; i < newState.rolstage.length; i++) {
      if (newState.rolstage[i].id === id) {
        newState.rolstage[i].value = !newState.rolstage[i].value;

        break;
      }
    }

    this.setState(newState);
  }

  async componentDidMount() {
    this.refreshProcess();
  }

  async componentWillReceiveProps(nextProps){
    this.refreshRolStages(nextProps.rolstage);
  }

  handleChangeProcess = event => {
    this.setState({
      process: event.target.value
    }, this.refreshStages);
  }

  add = event => {
    event.preventDefault();

    const rol = [];
    this.state.active.forEach(a => {
      if (a.value) rol.push({id: a.id, process: a.process, name: a.name});
    });

    if (rol.length > 0) this.props.addRolStage(rol);
    else this.props.showError('Marque los permisos');
  }

  del = event => {
    event.preventDefault();

    const rol = [];
    this.state.rolstage.forEach(f => {
      if (f.value) rol.push({id: f.id});
    });

    if (rol.length > 0) this.props.delRolStage(rol);
  }

  render() {
    let {theprocess, process, rolstage} = this.state;

    const processOptions = theprocess.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));
    let stageChecks = [];
    for(let i = 0; i < theprocess.length; i++){
      if(theprocess[i]._id === process) {
        stageChecks = theprocess[i].stage.map((s, i) => (<Checkbox key={i} onChange={() => this.setActive(s._id)} checked={this.isActive(s._id)}>{s.name}</Checkbox>));

        break;
      }
    }
    // const stageChecks = stages.map((r, i) => (
    //   <Checkbox key={i} onChange={() => this.setActive(r._id)} checked={this.isActive(r._id)}>{r.name}</Checkbox>
    // ));

    const rolstageChecks = rolstage.map((f, i) => (
      <Checkbox key={i}
        onChange={() => this.setActiveRolStage(f.id)}
        checked={this.isActiveRolStage(f.id)}>
        {f.name} - {f.processName}
      </Checkbox>
    ));

    let rolstageLabel = null;
    if (rolstageChecks.length > 0){
      rolstageLabel = <p style={{margin:'.3em'}}>Etapas asignadas</p>;
    }

    // let header = 'Ejecutan etapa';
    // if (this.props.header) header = this.props.header;

    return(
      <div className='RolStage'>
          <div className='RolStageBody'>
            <div className='RolStageBlock'>
              <FormControl key={1}
                componentClass="select"
                onChange = {this.handleChangeProcess}
                defaultValue = {process} >
                {processOptions}
              </FormControl>

              {stageChecks}
            </div>
            <div className='RolStageArrows'>
              <Button bsStyle="primary" onClick={this.add} style={{margin:'.3em'}}><Glyphicon glyph="arrow-down"></Glyphicon></Button>
              <Button bsStyle="primary" onClick={this.del} style={{margin:'.3em'}}><Glyphicon glyph="arrow-up"></Glyphicon></Button>
            </div>
            <div className='RolStageBlock'>
              {rolstageLabel}
              <div style={{textAlign: 'left'}}>
                {rolstageChecks}
              </div>
            </div>
          </div>
      </div>
    );
  }
}

export default withToast(RolStage);

/*
<Panel>
  <Panel.Heading>{header}</Panel.Heading>
  <Panel.Body className='RolStageBody'>
    <div className='RolStageBlock'>
      <FormControl key={1}
        componentClass="select"
        onChange = {this.handleChangeProcess}
        defaultValue = {process} >
        {processOptions}
      </FormControl>

      {stageChecks}
    </div>
    <div className='RolStageArrows'>
      <Button bsStyle="primary" onClick={this.add} style={{margin:'.3em'}}><Glyphicon glyph="arrow-down"></Glyphicon></Button>
      <Button bsStyle="primary" onClick={this.del} style={{margin:'.3em'}}><Glyphicon glyph="arrow-up"></Glyphicon></Button>
    </div>
    <div className='RolStageBlock'>
      {rolstageLabel}
      <div style={{textAlign: 'left'}}>
        {rolstageChecks}
      </div>
    </div>
  </Panel.Body>
</Panel>

*/
