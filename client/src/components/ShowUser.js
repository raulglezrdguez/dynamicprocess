import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditUser from './EditUser';

import './ShowUser.css';

// import withToast from '../components/withToast';

class ShowUser extends Component {
  state = {
    editing: false, // editando?
  }

  render() {
    const { user } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updUser} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditUser updUser={updUser} user={user} logued={this.props.logued}/>;
    } else {
      let fecha = 'Al iniciar sistema';
      if (user.date !== undefined) {
        const date = new Date(user.date);
        fecha = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
      }

      bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <div>
          <p><small>{user.email}</small></p>
          <p><small>El usuario está {user.active ? 'Activo' : 'Inactivo'}</small></p>
          <p><small>Creado: {fecha}</small></p>
      </div>;
    }


    return (
      <div>
        <div className='ShowUser'>
          <p>{user.name}</p>
          <div className='ShowUserDesc'>
            {bEdit}
            <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delUser(user._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
          </div>
          <div>
            {content}
          </div>
        </div>
      </div>
    );
  }
}

export default ShowUser;
// export default withToast(ShowUser);
