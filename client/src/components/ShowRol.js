import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditRol from './EditRol';

import './ShowRol.css';

class ShowRol extends Component {
  state = {
    editing: false, // editando?
  }

  render() {
    const { rol } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updRol} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditRol updRol={updRol} rol={rol} logued={this.props.logued} />;
    } else {

      bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <div>
        <p><small>{rol.desc}</small></p>
        <p><small>El rol está {rol.active ? 'Activo' : 'Inactivo'}</small></p>
      </div>;
    }

    return (
      <div>
        <div className='ShowRol'>
          <p>{rol.name}</p>
          <div className='ShowRolDesc'>
            {bEdit}
            <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delRol(rol._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
          </div>
          <div>
            {content}
          </div>
        </div>
      </div>);
  }
}

export default ShowRol;
