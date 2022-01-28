import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import ShowDatasStage from './ShowDatasStage';
import ShowNextStage from './ShowNextStage';

class ShowRowProcess extends Component {
  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      stages: [], // listado de etapas que se muestra
    }
  }

  arrangeStages = (stages) => {
    let thestages = stages.sort((a,b) => a.date - b.date);
    this._isMounted && this.setState({stages: thestages});
  }

  async componentDidMount() {
    this._isMounted = true;
    this.arrangeStages(this.props.datarow.stages);
  }

  async componentWillReceiveProps(nextProps) {
    this.arrangeStages(nextProps.datarow.stages);
  }

  async componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    const {canEdit, process, refValues, addDataStage, updDataStage, delRegister, logued} = this.props;
    let {stages} = this.state;


    const laststage = stages.length - 1;
    const stagesList = stages.map((s, i) => (<ShowDatasStage key={i} refValues={refValues} stage={s} updDataStage={updDataStage} delDatasStage={this.props.delDatasStage} logued={logued} canEdit={canEdit && (i === laststage)} />))

    let nextstage = null;
    let register = '';
    if (laststage > -1) {
      nextstage = stages[laststage].next;
      register = stages[laststage].register;
    }

    let bDelete = canEdit && process && process.permission && process.permission.full ?
          <Button bsStyle='danger' bsSize='xsmall' onClick={() => delRegister(register)}>Eliminar <Glyphicon glyph="remove"></Glyphicon></Button> :
          null;

    return (<div className="Row Border">
      <div><span className="label label-primary">{this.props.position}</span>{' '}{bDelete}</div>

      {stagesList}

      <ShowNextStage canEdit={canEdit} refValues={refValues} register={register} stage={nextstage} addDataStage={addDataStage} logued={logued} />

    </div>);
  }
}

export default ShowRowProcess;
