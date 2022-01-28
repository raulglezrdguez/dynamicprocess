import React, { Component } from "react";
import { Button, Glyphicon, Label } from "react-bootstrap";

import CreateStage from './CreateStage';

class ShowNextStage extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      editing: false, // está editando el estado?
      canAddStage: false, // puede adicionar el proximo estado?
    }
  }

  refreshCanAddStage = (props) => {
    const {stage, register, logued} = props;

    if (stage && stage._id) {
      fetch(`/api/canAddStage?token=${logued.token}&stage=${stage._id}&register=${register}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(canAddStage => {
              this._isMounted && this.setState({canAddStage: canAddStage.ok});
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener etapa: ${err.message}`);
            })
          }
        });
    } else {
      this._isMounted && this.setState({canAddStage: false});
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    this.refreshCanAddStage(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    this.refreshCanAddStage(nextProps);
  }

  async componentWillUnmount() {
    this._isMounted = false;
  }

  addDataStage = (datas) => {
    this._isMounted && this.setState({editing: false}, () => this.props.addDataStage(datas));
  }

  render() {
    let {editing, canAddStage} = this.state;
    let {canEdit, refValues, register, stage} = this.props;

    let bEdit = null;
    let content = null;

    if (stage) {
      if (canEdit && canAddStage) {
        if (editing) {
          bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this._isMounted && this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;
          content = <CreateStage stage={stage._id} register={register} refValues={refValues} addDataStage={this.addDataStage} logued={this.props.logued} />
        } else {
          bEdit = <Button bsStyle='success' bsSize='xsmall' onClick={() => this._isMounted && this.setState({editing: true})}>{stage.name} <Glyphicon glyph="pencil"></Glyphicon></Button>;
        }
      } else {
        bEdit = <Label bsStyle="info">{stage.name}</Label>;
      }
    } else {
      bEdit = <Label bsStyle="success"><Glyphicon glyph="ok"></Glyphicon></Label>;
    }

    return (<div className="Column">
      {bEdit}

      {content}
    </div>);
  }
}

export default ShowNextStage;
