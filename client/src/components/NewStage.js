import React, { Component } from "react";
import { Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

// import { registerLocale } from 'react-datepicker';
// import es from 'date-fns/locale/es';

// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";
import RolStage from "./RolStage";
import NextStage from "./NextStage";

import './NewStage.css';
import './DatePicker.css';

// registerLocale('es', es);

class NewStage extends Component {
  state = {
    isLoading: false,
    s_name: '', // nombre
    s_desc: '', //
    s_rol: [], // permisos para ejecutar esta etapa del proceso
    s_rolstage: [], // usuarios de otras etapas que pueden ejecutar esta
    s_next: [], // proximas etapas que se pueden ejecutar desde esta
    s_active: false, // etapa activa?
    // s_datefrom: new Date(),
    // s_dateto: new Date(new Date().setDate(new Date().getDate() + 31)), // hoy mas 31 dias

  }

  validateForm() {
    let { s_name, s_desc } = this.state;

    return ((s_name.trim().length > 0) && (s_desc.trim().length > 5));
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  // handleChangeDateFrom = date => {
  //   this.setState({s_datefrom: date});
  // }
  //
  // handleChangeDateTo = date => {
  //   this.setState({s_dateto: date});
  // }

  addRol = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.s_rol.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.s_rol = newState.s_rol.concat(toAdd);
      this.setState(newState);
    }
  }

  delRol = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.s_rol.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.s_rol.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  addRolStage = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.s_rolstage.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.s_rolstage = newState.s_rolstage.concat(toAdd);
      this.setState(newState);
    }
  }

  delRolStage = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.s_rolstage.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.s_rolstage.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  addNextStage = (f) => {
    let newState = this.state;

    const toAdd = f.filter(frnd => (!newState.s_next.find(friend => (frnd._id === friend._id))));
    if (toAdd.length > 0) {
      newState.s_next = newState.s_next.concat(toAdd);
      this.setState(newState);
    }
  }

  delNextStage = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.s_next.findIndex(frnd => frnd._id === rol.id);
      if (index > -1) {
        newState.s_next.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  handleSubmit = async event => {
    // let { s_name, s_desc, s_rol, s_rolstage, s_next, s_datefrom, s_dateto } = this.state;
    let { s_name, s_desc, s_rol, s_rolstage, s_next, s_active } = this.state;
    let rol = s_rol.map(f => f.id);
    let rolstage = s_rolstage.map(f => f.id);
    let next = s_next.map(f => f._id);
    // const datefrom = new Date(s_datefrom).getTime();
    // const dateto = new Date(s_dateto).getTime();

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      // await this.props.addStage({name: s_name.trim(), desc: s_desc.trim(), rol, rolstage, next, datefrom, dateto});
      await this.props.addStage({name: s_name.trim(), desc: s_desc.trim(), rol, rolstage, next, active: s_active});
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
    // let { s_name, s_desc, s_datefrom, s_dateto, s_rol, s_rolstage, s_next, isLoading } = this.state;
    let { s_name, s_desc, s_active, s_rol, s_rolstage, s_next, isLoading } = this.state;

    return(
      <div className='NewStage'>
        <Tabs defaultActiveKey={1} id="newstage-tab">

          <Tab eventKey={1} title="Generales" className="tabNewStage">
            <FormGroup controlId="s_name">
              <ControlLabel>Nombre de la etapa</ControlLabel>
              <FormControl
                type="text"
                value={s_name}
                onChange={this.handleChange}
                placeholder="Nombre de la etapa" />
            </FormGroup>
            <FormGroup controlId="s_desc">
              <ControlLabel>Descripción</ControlLabel>
              <FormControl
                componentClass="textarea"
                value={s_desc}
                onChange={this.handleChange}
                placeholder="Descripción de la etapa" />
            </FormGroup>

            <Checkbox onChange={e => this.setState({s_active: e.target.checked})} checked={s_active}>Activa</Checkbox>

          </Tab>

          <Tab eventKey={2} title="Ejecutan esta etapa" className="tabNewStage">
            <Tabs defaultActiveKey={1} id="execstage-tab">
              <Tab eventKey={1} title="Con permisos" className="tabNewStage">
                <Friend logued={this.props.logued} addFriend={this.addRol} delFriend={this.delRol} friend={s_rol} header='Ejecutan la etapa' />
              </Tab>
              <Tab eventKey={2} title="Ejecutaron" className="tabNewStage">
                <RolStage logued={this.props.logued} addRolStage={this.addRolStage} delRolStage={this.delRolStage} rolstage={s_rolstage} header='Ejecutan la etapa' />
              </Tab>
            </Tabs>
          </Tab>

          <Tab eventKey={4} title="Próximas etapas" className="tabNewStage">
            <NextStage logued={this.props.logued} addNextStage={this.addNextStage} delNextStage={this.delNextStage} nextstage={s_next} header='Próximas etapas' />
          </Tab>
        </Tabs>

        <LoaderButton
          block
          bsStyle="primary"
          bsSize="large"
          onClick={this.handleSubmit}
          disabled={!this.validateForm()}
          type="button"
          isLoading={isLoading}
          text="Crear etapa"
          loadingText="Adicionando etapa…"
        />

      </div>

    );
  }
}

export default withToast(NewStage);
/*
<Panel>
  <Panel.Heading>Desde la fecha</Panel.Heading>
  <Panel.Body className='PanelDatePicker'>
    <DatePicker
      className='DatePicker'
      dateFormat="d MMMM yyyy"
      isClearable={true}
      locale='es'
      minDate={new Date()}
      maxDate={this.addDays(new Date(), 365)}
      onChange={this.handleChangeDateFrom}
      selected={s_datefrom}
      showMonthYearDropdown
      showWeekNumbers
      todayButton={"Hoy"}
    />
  </Panel.Body>
</Panel>
<Panel>
  <Panel.Heading>Hasta la fecha</Panel.Heading>
  <Panel.Body className='PanelDatePicker'>
    <DatePicker
      className='DatePicker'
      dateFormat="d MMMM yyyy"
      isClearable={true}
      locale='es'
      minDate={new Date()}
      maxDate={this.addDays(new Date(), 365)}
      onChange={this.handleChangeDateTo}
      selected={s_dateto}
      showMonthYearDropdown
      showWeekNumbers
      todayButton={"Hoy"}
    />
  </Panel.Body>
</Panel>

*/
