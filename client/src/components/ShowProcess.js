import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditProcess from './EditProcess';

import './ShowProcess.css';

class ShowProcess extends Component {
  state = {
    editing: false, // editando?
  }

  render() {
    const { tprocess, process } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updProcess} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditProcess updProcess={updProcess} tprocess={tprocess} process={process} logued={this.props.logued} />;
    } else {

      bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;
      content = <div>
        <p><small>{process.desc}</small></p>
        <p><small>Está <strong><i>{process.active ? 'Activo' : 'Inactivo'}</i></strong>. Es <strong><i>{process.tprocess.name}</i></strong>.</small></p>
      </div>;
    }

    return (
      <div className='ShowProcess'>
        <p>{process.name}</p>
        <div className='ShowProcessDesc'>
          {bEdit}
          <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delProcess(process._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
        </div>
        <div>
          {content}
        </div>
      </div>);

  }
}

export default ShowProcess;
