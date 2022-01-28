import React, { Component } from "react";
// import { Panel, Checkbox, FormControl, Button, Glyphicon } from "react-bootstrap";
import { Checkbox, FormControl, Button, Glyphicon } from "react-bootstrap";

import withToast from './withToast';

import './Friend.css';

class Friend extends Component {
  state = {
    active: [], // permisos marcados para asignarlos a los friend
    modules: [], // los modulos
    module: '', // el modulo isActiveRolStage
    roles: [], // los roles del modulo activo
    friend: [] // todos los roles que se han seleccionado
  }

  refreshModules = () => {
    let {logued} = this.props;

    if (logued.signedIn) {

      fetch(`/api/getModules?token=${logued.token}&active=true`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(modules => {
              let newState = this.state;
              newState.modules = modules.modules;
              if (modules.modules.length > 0) newState.module = modules.modules[0]._id;
              else  newState.module = '';
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
    let {logued} = this.props;

    if (logued.signedIn) {
      let { module } = this.state;

  		fetch(`/api/getRoles?token=${logued.token}&module=${module}&active=true`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(roles => {
              let newState = this.state;
              newState.roles = roles.roles;
              newState.active = newState.roles.map(r => ({id: r._id, value: false, name: r.name, module: module}));
              this.setState(newState, () => this.refreshFriends(this.props.friend));
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener roles: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshFriends = (friends) => {
    let {modules} = this.state;
    let newState = this.state;
    newState.friend = friends.filter(f => modules.some(m => m._id === f.module)).map(f => {
      const m = modules.find(m => m._id === f.module);
      let moduleName = m ? m.name : '';
      return {id: f.id, name: f.name, module: f.module, moduleName, value: false}
    });
    this.setState(newState);
  }

  isActive = (id) => {
    let {active} = this.state;
    let res = false;
    for(let i = 0; i < active.length; i++) {
      if (active[i].id === id) {
        res = active[i].value;

        break;
      }
    }
    return res;
  }

  isActiveFriend = (id) => {
    let {friend} = this.state;
    let res = false;
    for(let i = 0; i < friend.length; i++) {
      if (friend[i].id === id) {
        res = friend[i].value;

        break;
      }
    }
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

  setActiveFriend = (id) => {
    let newState = this.state;
    for(let i = 0; i < newState.friend.length; i++) {
      if (newState.friend[i].id === id) {
        newState.friend[i].value = !newState.friend[i].value;

        break;
      }
    }

    this.setState(newState);
  }

  async componentDidMount() {
    this.refreshModules();
  }

  async componentWillReceiveProps(nextProps){
    this.refreshFriends(nextProps.friend);
  }

  handleChangeModule = event => {
    this.setState({
      module: event.target.value
    }, this.refreshRoles);
  }

  add = event => {
    event.preventDefault();

    const rol = [];
    this.state.active.forEach(a => {
      if (a.value) rol.push({id: a.id, module: a.module, name: a.name});
    });

    if (rol.length > 0) this.props.addFriend(rol);
    else this.props.showError('Marque los permisos');
  }

  del = event => {
    event.preventDefault();

    const rol = [];
    this.state.friend.forEach(f => {
      if (f.value) rol.push({id: f.id});
    });

    if (rol.length > 0) this.props.delFriend(rol);
  }

  render() {
    let {modules, module, roles, friend} = this.state;

    const moduleOptions = modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));
    const rolChecks = roles.map((r, i) => (
      <Checkbox key={i} onChange={() => this.setActive(r._id)} checked={this.isActive(r._id)}>{r.name}</Checkbox>
    ));
    let arrows = null;
    if (roles.length > 0) {
      arrows = <div className='FriendArrows'>
        <Button bsStyle="primary" onClick={this.add} style={{margin:'.3em'}}><Glyphicon glyph="arrow-down"></Glyphicon></Button>
        <Button bsStyle="primary" onClick={this.del} style={{margin:'.3em'}}><Glyphicon glyph="arrow-up"></Glyphicon></Button>
      </div>;
    }
    const friendChecks = friend.map((f, i) => (
      <Checkbox key={i}
        onChange={() => this.setActiveFriend(f.id)}
        checked={this.isActiveFriend(f.id)}>
        {f.name} - {f.moduleName}
      </Checkbox>
    ));
    let friendLabel = null;
    if (friendChecks.length > 0){
      friendLabel = <p style={{margin:'.3em'}}>Permisos asignados</p>;
    }

    // let header = 'Amigos';
    // if (this.props.header) header = this.props.header;

    return(
      <div className='Friend'>
        <div className='FriendBody'>
          <div className='FriendBlock'>
            <FormControl key={1}
              componentClass="select"
              onChange = {this.handleChangeModule}
              defaultValue = {module} >
              {moduleOptions}
            </FormControl>

            {rolChecks}
          </div>

          {arrows}

          <div className='FriendBlock'>
            {friendLabel}
            <div style={{textAlign: 'left'}}>
              {friendChecks}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withToast(Friend);

/*
<Panel className='Friend'>
  <Panel.Heading>{header}</Panel.Heading>
  <Panel.Body className='FriendBody'>
    <div className='FriendBlock'>
      <FormControl key={1}
        componentClass="select"
        onChange = {this.handleChangeModule}
        defaultValue = {module} >
        {moduleOptions}
      </FormControl>

      {rolChecks}
    </div>

    {arrows}

    <div className='FriendBlock'>
      {friendLabel}
      <div style={{textAlign: 'left'}}>
        {friendChecks}
      </div>
    </div>
  </Panel.Body>
</Panel>

*/
