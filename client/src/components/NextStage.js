import React, { Component } from "react";
import { Checkbox, FormControl, Button, Glyphicon } from "react-bootstrap";

import withToast from './withToast';

import './NextStage.css';

class NextStage extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      active: [], // etapas que se han marcado del proceso activo
      theprocess: [], // los procesos a que tiene acceso el usuario logueado
      process: '', // el proceso activo
      nextstage: [], // proximas etapas a la que ir desde la etapa actual
    }
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
              this._isMounted && this.setState(newState, this.refreshStages);
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
    let { theprocess, process } = this.state;

    let newState = this.state;
    if (process) {
      const prc = theprocess.find(p => p._id === process);
      if (prc) newState.active = prc.stage.map(s => ({id: s._id, value: false, name: s.name, process: process}));
      else newState.active = [];
    } else {
      newState.active = [];
    }
    this._isMounted && this.setState(newState, () => this.refreshNextStages(this.props.nextstage));
	}

  refreshNextStages = (nextstages) => {
    let {theprocess} = this.state;
    let newState = this.state;
    newState.nextstage = nextstages.map(f => {
      let processName = '';
      for(let i = 0; i < theprocess.length; i++){
        if (theprocess[i]._id === f.process){
          processName = theprocess[i].name;

          break;
        }
      }
      return {id: f._id, name: f.name, process: f.process, processName, value: false}
    });
    this._isMounted && this.setState(newState);
  }

  isActive = (id) => {
    let {active} = this.state;
    const act = active.find(a => (a.id === id));
    const res = act ? act.value : false;

    return res;
  }

  isActiveNextStage = (id) => {
    let {nextstage} = this.state;
    const act = nextstage.find(a => (a.id === id));
    const res = act ? act.value : false;

    return res;
  }

  setActive = (id) => {
    let newState = this.state;
    newState.active.forEach(act => {
      if (act.id === id) act.value = !act.value;
    });

    this._isMounted && this.setState(newState);
  }

  setActiveNextStage = (id) => {
    let newState = this.state;
    for(let i = 0; i < newState.nextstage.length; i++) {
      if (newState.nextstage[i].id === id) {
        newState.nextstage[i].value = !newState.nextstage[i].value;

        break;
      }
    }

    this._isMounted && this.setState(newState);
  }

  async componentDidMount() {
    this._isMounted = true;
    this.refreshProcess();
  }

  async componentWillReceiveProps(nextProps){
    this.refreshProcess();
  }

  async componentWillUnmount() {
    this._isMounted = false;
  }

  handleChange = event => {
    this._isMounted && this.setState({[event.target.id]: event.target.value});
  }

  handleChangeProcess = event => {
    this._isMounted && this.setState({
      process: event.target.value
    }, this.refreshStages);
  }

  add = event => {
    event.preventDefault();

    const rol = [];
    this.state.active.forEach(a => {
      if (a.value) {
        rol.push({_id: a.id, name: a.name, process: a.process});
      }
    });

    if (rol.length > 0) this.props.addNextStage(rol);
    else this.props.showError('Marque la etapa');
  }

  del = event => {
    event.preventDefault();

    const rol = [];
    this.state.nextstage.forEach(f => {
      if (f.value) rol.push({id: f.id});
    });

    if (rol.length > 0) this.props.delNextStage(rol);
  }

  render() {
    let {theprocess, process, nextstage} = this.state;

    const processOptions = theprocess.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));
    let stageChecks = [];
    for(let i = 0; i < theprocess.length; i++) {
      if(theprocess[i]._id === process) {
        stageChecks = theprocess[i].stage.map((s, i) => (<Checkbox key={i} onChange={() => this.setActive(s._id)} checked={this.isActive(s._id)}>{s.name}</Checkbox>));

        break;
      }
    }

    const nextstageChecks = nextstage.map((f, i) => (
      <Checkbox key={i}
        onChange={() => this.setActiveNextStage(f.id)}
        checked={this.isActiveNextStage(f.id)}>
        {f.name}({f.processName})
      </Checkbox>
    ));

    let nextstageLabel = null;
    if (nextstageChecks.length > 0){
      nextstageLabel = <p style={{margin:'.3em'}}>Etapas asignadas</p>;
    }

    return(
      <div className='NextStage'>
        <div className='NextStageBody'>
          <div className='NextStageBlock'>

            <FormControl key={1}
              componentClass="select"
              onChange = {this.handleChangeProcess}
              defaultValue = {process} >
              {processOptions}
            </FormControl>

            {stageChecks}
          </div>
          <div className='NextStageArrows'>
            <Button bsStyle="primary" onClick={this.add} style={{margin:'.3em'}}><Glyphicon glyph="arrow-down"></Glyphicon></Button>
            <Button bsStyle="primary" onClick={this.del} style={{margin:'.3em'}}><Glyphicon glyph="arrow-up"></Glyphicon></Button>
          </div>
          <div className='NextStageBlock'>
            {nextstageLabel}
            <div style={{textAlign: 'left'}}>
              {nextstageChecks}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withToast(NextStage);
