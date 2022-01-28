import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditTable from './EditTable';

import './ShowTable.css';

class ShowTable extends Component {
  state = {
    editing: false, // editando?
  }

  render() {
    const { table } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updTable} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditTable updTable={updTable} table={table} logued={this.props.logued} />;
    } else {

      bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <div>
        <p><small>{table.desc}</small></p>
        <p><small>La tabla está {table.active ? 'Activa' : 'Inactiva'}</small></p>
        <p><small>Los datos son {table.free ? 'públicos' : 'privados'}</small></p>
      </div>;
    }

    return (
      <div>
        <div className='ShowTable'>
          <p>{table.name}</p>
          <div className='ShowTableDesc'>
            {bEdit}
            <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delTable(table._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
          </div>
          <div>
            {content}
          </div>
        </div>
      </div>);
  }
}

export default ShowTable;
