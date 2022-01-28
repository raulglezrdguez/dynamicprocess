import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditModule from './EditModule';

import './ShowModule.css';

class ShowModule extends Component {
  state = {
    editing: false, // editando?
  }

  render() {
    const { module } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updModule} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditModule updModule={updModule} module={module} logued={this.props.logued} />;
    } else {

      bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <div>
        <p><small>{module.desc}</small></p>
        <p><small>El modulo está {module.active ? 'Activo' : 'Inactivo'}</small></p>
      </div>;
    }

    return (
        <div className='ShowModule'>
          <p>{module.name}</p>
          <div className='ShowModuleDesc'>
            {bEdit}
            <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delModule(module._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
          </div>
          <div>
            {content}
          </div>
        </div>
    );


  }
}

export default ShowModule;
