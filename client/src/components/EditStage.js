import React, { Component } from "react";
import { Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";
import RolStage from "./RolStage";
import AdmonFieldStage from "./AdmonFieldStage";
import NextStage from "./NextStage";

import './EditStage.css';
import './DatePicker.css';

class EditStage extends Component {
  state = {
    isLoading: false,
    es_name: '', // nombre
    es_desc: '', //
    es_rol: [], // permisos para ejecutar esta etapa del proceso
    es_rolstage: [], // usuarios de otras etapas que pueden ejecutar esta
    es_next: [], // proximas etapas que se pueden ejecutar desde esta
    es_active: false, // está activa la etapa?
  }

  fillState = (stage) => {
    let newState = this.state;
    newState.es_name = JSON.parse(JSON.stringify(stage.name));
    newState.es_desc = JSON.parse(JSON.stringify(stage.desc));
    if (stage.rol) {
      const f = stage.rol.map(m => {
        if (m._id) return {id: m._id, name: m.name, module: m.module._id};
        else return {id: m.id, name: m.name, module: m.module};
      });
      newState.es_rol = JSON.parse(JSON.stringify(f));
    } else {
      newState.es_rol = [];
    }
    if (stage.rolstage) {
      const f = stage.rolstage.map(m => {
        if (m._id) return {id: m._id, name: m.name, process: m.process._id};
        else return {id: m.id, name: m.name, process: m.process};
      });
      newState.es_rolstage = JSON.parse(JSON.stringify(f));
    } else {
      newState.es_rolstage = [];
    }
    if (stage.next) {
      newState.es_next = JSON.parse(JSON.stringify(stage.next));
    } else {
      newState.es_next = [];
    }

    newState.es_active = (stage.active === true);

    this.setState(newState);
  }

  async componentDidMount() {
    this.fillState(this.props.stage);
  }

  async componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.stage) !== JSON.stringify(nextProps.stage)) {
      this.fillState(nextProps.stage);
    }
  }

  validateForm() {
    let { es_name, es_desc } = this.state;

    return ((es_name.trim().length > 0) && (es_desc.trim().length > 5));

  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  addRol = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.es_rol.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.es_rol = newState.es_rol.concat(toAdd);
      this.setState(newState);
    }
  }

  delRol = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.es_rol.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.es_rol.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  addRolStage = (f) => {
    let newState = this.state;
    const {_id} = this.props.stage;
    const toAdd = f.filter(frnd => (!newState.es_rolstage.find(friend => (frnd.id === friend.id)) && (frnd.id !== _id)));
    if (toAdd.length > 0) {
      newState.es_rolstage = newState.es_rolstage.concat(toAdd);
      this.setState(newState);
    }
  }

  delRolStage = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.es_rolstage.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.es_rolstage.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  addNextStage = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.es_next.find(friend => (frnd._id === friend._id))));
    if (toAdd.length > 0) {
      newState.es_next = newState.es_next.concat(toAdd);
      this.setState(newState);
    }
  }

  delNextStage = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.es_next.findIndex(frnd => frnd._id === rol.id);
      if (index > -1) {
        newState.es_next.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  handleSubmit = async event => {
    let {es_name, es_desc, es_rol, es_rolstage, es_next, es_active } = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.updStage({name: es_name.trim(), desc: es_desc.trim(), rol: es_rol, rolstage: es_rolstage, next: es_next, active: es_active, _id: this.props.stage._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  render() {
    let { es_name, es_desc, es_active, es_rol, es_rolstage, es_next, isLoading } = this.state;

    return(
      <div className='EditStage'>
        <Tabs defaultActiveKey={1} id="editstage-tab">

          <Tab eventKey={1} title="Generales" className="tabEditStage">

            <FormGroup controlId="es_name">
              <ControlLabel>Nombre de la etapa</ControlLabel>
              <FormControl
                type="text"
                value={es_name}
                onChange={this.handleChange}
                placeholder="Nombre de la etapa" />
            </FormGroup>
            <FormGroup controlId="es_desc">
              <ControlLabel>Descripción</ControlLabel>
              <FormControl
                componentClass="textarea"
                value={es_desc}
                onChange={this.handleChange}
                placeholder="Descripción de la etapa" />
            </FormGroup>

            <Checkbox onChange={e => this.setState({es_active: e.target.checked})} checked={es_active}>Activa</Checkbox>

          </Tab>

          <Tab eventKey={2} title="Ejecutan esta etapa" className="tabEditStage">
            <Tabs defaultActiveKey={1} id="execstage-tab">
              <Tab eventKey={1} title="Con permisos" className="tabEditStage">
                <Friend logued={this.props.logued} addFriend={this.addRol} delFriend={this.delRol} friend={es_rol} header='Ejecutan la etapa' />
              </Tab>
              <Tab eventKey={2} title="Ejecutaron" className="tabEditStage">
                <RolStage logued={this.props.logued} addRolStage={this.addRolStage} delRolStage={this.delRolStage} rolstage={es_rolstage} header='Ejecutan la etapa' />
              </Tab>
            </Tabs>
          </Tab>

          <Tab eventKey={4} title="Próximas etapas" className="tabEditStage">
            <NextStage logued={this.props.logued} addNextStage={this.addNextStage} delNextStage={this.delNextStage} nextstage={es_next} header='Próximas etapas' />
          </Tab>

          <Tab eventKey={5} title="Campos" className="tabEditStage">
            <AdmonFieldStage stage={this.props.stage._id} logued={this.props.logued} />
          </Tab>
        </Tabs>

        <LoaderButton
          block
          bsStyle="primary"
          bsSize="large"
          disabled={!this.validateForm()}
          onClick={this.handleSubmit}
          type="button"
          isLoading={isLoading}
          text="Modificar etapa"
          loadingText="Modificando etapa…"
        />

      </div>
    );
  }
}

export default withToast(EditStage);
