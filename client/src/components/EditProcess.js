import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl, ControlLabel, Tabs, Tab } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";
import Friend from "./Friend";
import AdmonStages from "./AdmonStages";

import './EditProcess.css';

class EditProcess extends Component {
  state = {
    isLoading: false,
    ep_name: '', // nombre
    ep_desc: '', //
    ep_tprocess: '', // tipo de proceso
    ep_active: false,
    ep_friend: [],
    ep_data: [],
    ep_firststage: '', // id de la primera etapa
    ep_stages: [], //etapas de este proceso
  }

  refreshStages = () => {
    if (this.props.logued.signedIn) {

      fetch(`/api/getStage?token=${this.props.logued.token}&process=${this.props.process._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(stages => {
              let newState = this.state;
              newState.ep_stages = stages.stage;
              if ((newState.ep_firststage === '') && (stages.stage.length > 0)) {
                newState.ep_firststage = stages.stage[0]._id;
              }

              this.setState(newState);
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener etapas del proceso: ${err.message.message}`);
            })
          }
        });
    }
  }

  fillState = (process) => {
    let newState = this.state;
    newState.ep_name = JSON.parse(JSON.stringify(process.name));
    newState.ep_desc = JSON.parse(JSON.stringify(process.desc));
    newState.ep_active = JSON.parse(JSON.stringify(process.active));
    newState.ep_tprocess = JSON.parse(JSON.stringify(process.tprocess._id));
    // newState.firststage = JSON.parse(JSON.stringify(process.firststage));
    if (process.friend) {
      const f = process.friend.map(m => {
        if (m._id) return {id: m._id, name: m.name, module: m.module._id};
        else return {id: m.id, name: m.name, module: m.module};
      });
      newState.ep_friend = JSON.parse(JSON.stringify(f));
    } else {
      newState.ep_friend = [];
    }
    if (process.data) {
      const f = process.data.map(m => {
        if (m._id) return {id: m._id, name: m.name, module: m.module._id};
        else return {id: m.id, name: m.name, module: m.module};
      });
      newState.ep_data = JSON.parse(JSON.stringify(f));
    } else {
      newState.ep_data = [];
    }
    this.setState(newState, this.refreshStages);
  }

  async componentDidMount() {
    this.fillState(this.props.process);
  }

  async componentWillReceiveProps(nextProps) {
    this.fillState(nextProps.process);
  }

  validateForm() {
    return (this.state.ep_name.trim().length > 3 &&
            this.state.ep_desc.trim().length > 5);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  addFriend = (f) => {
    let newState = this.state;
    const toAdd = f.filter(frnd => (!newState.ep_friend.find(friend => (frnd.id === friend.id))));
    if (toAdd.length > 0) {
      newState.ep_friend = newState.ep_friend.concat(toAdd);
      this.setState(newState);
    }
  }

  delFriend = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.ep_friend.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.ep_friend.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  addData = (f) => {
    let newState = this.state;
    const toAdd = f.filter(frnd => (!newState.ep_data.find(dt => (frnd.id === dt.id))));
    if (toAdd.length > 0) {
      newState.ep_data = newState.ep_data.concat(toAdd);
      this.setState(newState);
    }
  }

  delData = (f) => {
    let newState = this.state;
    f.forEach(rol => {
      let index = newState.ep_data.findIndex(frnd => frnd.id === rol.id);
      if (index > -1) {
        newState.ep_data.splice(index, 1);
      }
    });

    this.setState(newState);
  }

  handleSubmit = async event => {
    let {ep_name, ep_desc, ep_tprocess, ep_active, ep_friend, ep_data, ep_firststage} = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.updProcess({name: ep_name.trim(), desc: ep_desc.trim(), tprocess: ep_tprocess, active: ep_active, friend: ep_friend, data: ep_data, firststage: ep_firststage, _id: this.props.process._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  render() {
    let {ep_name, ep_desc, ep_tprocess, ep_active, ep_friend, ep_data, isLoading} = this.state;

    const tprocessOptions = this.props.tprocess.map((tp, i) => (<option key={i} value={tp._id}>{tp.name}</option>));
    let fstage = null;
    // const stagesOptions = stages.map((s, i) => (<option key={i} value={s._id}>{s.name}</option>));
    // if (stagesOptions.length > 0) {
    //   fstage = <FormGroup controlId="firststage">
    //     <ControlLabel>Primera etapa</ControlLabel>
    //     <FormControl
    //       componentClass="select"
    //       defaultValue={firststage}
    //       onChange={this.handleChange} >
    //       {stagesOptions}
    //     </FormControl>
    //   </FormGroup>
    // }

    return(
      <div className='EditProcess'>
          <Form onSubmit={this.handleSubmit}>

            <Tabs defaultActiveKey={1} id="newprocess-tab">
              <Tab eventKey={1} title="Generales" className="tabEditProcess">

                <FormGroup controlId="ep_tprocess">
                  <ControlLabel>Tipo de proceso</ControlLabel>
                  <FormControl
                    componentClass="select"
                    value={ep_tprocess}
                    onChange={this.handleChange} >
                    {tprocessOptions}
                  </FormControl>
                </FormGroup>
                <FormGroup controlId="ep_name">
                  <ControlLabel>Nombre del proceso</ControlLabel>
                  <FormControl
                    autoFocus
                    type="text"
                    value={ep_name}
                    onChange={this.handleChange}
                    placeholder='ProcesoX'
                  />
                </FormGroup>
                <FormGroup controlId="ep_desc">
                  <ControlLabel>Descripción</ControlLabel>
                  <FormControl
                    componentClass="textarea"
                    value={ep_desc}
                    onChange={this.handleChange}
                    placeholder="Descripción del proceso" />
                </FormGroup>

                <Checkbox onChange={e => this.setState({ep_active: e.target.checked})} checked={ep_active}>Activo</Checkbox>
              </Tab>
              <Tab eventKey={2} title="Amigos" className="tabEditProcess">
                <Friend logued={this.props.logued} addFriend={this.addFriend} delFriend={this.delFriend} friend={ep_friend} />
              </Tab>
              <Tab eventKey={3} title="Ver datos" className="tabEditProcess">
                <Friend logued={this.props.logued} addFriend={this.addData} delFriend={this.delData} friend={ep_data} />
              </Tab>
              <Tab eventKey={4} title="Etapas" className="tabEditProcess">
                {fstage}

                <AdmonStages process={this.props.process._id} logued={this.props.logued} />
              </Tab>
            </Tabs>

            <LoaderButton
              block
              bsStyle="primary"
              bsSize="large"
              disabled={!this.validateForm()}
              type="submit"
              isLoading={isLoading}
              text="Modificar proceso"
              loadingText="Modificando proceso…"
            />

          </Form>
      </div>
    );
  }
}

export default withToast(EditProcess);
