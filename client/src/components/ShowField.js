import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditField from './EditField';

import './ShowField.css';

class ShowField extends Component {
  state = {
    editing: false, // editando?
  }

  render() {
    const { field } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updField} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditField updField={updField} field={field} logued={this.props.logued} />;
    } else {
      bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;
      const fkind = [
        {id: 'txt', name: 'texto'},
        {id: 'lst', name: 'lista de valores'},
        {id: 'num', name: 'número'},
        {id: 'img', name: 'imagen'},
        {id: 'fle', name: 'fichero'},
        {id: 'dte', name: 'fecha'},
        {id: 'tme', name: 'hora'},
        {id: 'bln', name: 'boolean'},
        {id: 'ref', name: 'referencia a otra tabla'}].find(k => k.id === field.kind);
      const fkindname = fkind ? fkind.name : 'desconocido';
      content = <div>
        <p><small>{field.desc}</small></p>
        <p><small>El campo es <strong><i>{field.obligatory ? 'Obligatorio' : 'Opcional'}</i></strong>, de tipo <strong><i>{fkindname}</i></strong></small></p>
      </div>;
    }

    return (
      <div>
        <div className='ShowField'>
          <p>{field.name}</p>
          <div className='ShowFieldDesc'>
            {bEdit}
            <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delField(field._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
          </div>
          <div>
            {content}
          </div>
        </div>
      </div>);
  }
}

export default ShowField;
