import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditStage from './EditStage';

import './ShowStage.css';

class ShowStage extends Component {
  state = {
    editing: false, // editando?
  }

  render() {
    const { stage } = this.props;

    let bEdit = null;
    let content = null;

    if (this.state.editing) {
      let {updStage} = this.props;

      bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <EditStage updStage={updStage} stage={stage} logued={this.props.logued} />;
    } else {

      bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;

      content = <div>
        <p><small>{stage.desc}. Está <strong><i>{stage.active ? 'Activa' : 'Inactiva'}</i></strong>. </small></p>
      </div>;
    }

    return (
        <div className='ShowStage'>
          <p>{stage.name}</p>
          <div className='ShowStageDesc'>
            {bEdit}
            <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delStage(stage._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
          </div>
          <div>
            {content}
          </div>
        </div>
      );
  }
}

export default ShowStage;
