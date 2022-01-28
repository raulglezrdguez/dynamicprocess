import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import ModifyStage from './ModifyStage';

class ShowDatasStage extends Component {

  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      editing: false, // está editando el estado?
      canEditStage: false, // el usuario puede editar la etapa?
    }
  }

  refreshCanEditStage = (props) => {
    const {canEdit, logued, stage} = props;

    if (canEdit && logued.signedIn && stage && (stage._id !== '')) {
      fetch(`/api/canEditStage?token=${logued.token}&stage=${stage._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(canEditStage => {
              this._isMounted && this.setState({canEditStage: canEditStage.ok});
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener etapa: ${err.message}`);
            })
          }
        });
    } else {
      this._isMounted && this.setState({canEditStage: false});
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    this.refreshCanEditStage(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    this.refreshCanEditStage(nextProps);
  }

  async componentWillUnmount() {
    this._isMounted = false;
  }

  getRefValue = (field, ref) => {
    let result = 'No encontrado';
    let {refValues} = this.props;
    const tfSplit = field.split(',');

    const rv = refValues.find(r => ((r.table === tfSplit[0]) && (r.field === tfSplit[1])));
    if (rv) {
      const val = rv.values.find(v => (v.id === ref));
      if (val) result = val.value;
    }

    return result;
  }

  getValueField = (id) => {
    let result = null;
    const value = this.props.stage.values.find(v => v.field._id === id);
    let src = '';
    let downsrc = '';
    switch(value.field.kind) {
      case 'img':
        src = process.env.PUBLIC_URL + '/dyimages/thumbnails/';
        downsrc = process.env.PUBLIC_URL + '/dyimages/';
        if (value.value === '') {
          src += 'empty.png';
          downsrc += 'empty.png';
        } else {
          src += value.value + '?id=' + new Date().getTime();
          downsrc += value.value + '?id=' + new Date().getTime();
        }
        result = <a href={downsrc} download={value.value}><img src={src} alt='sin imagen' /></a>
      break;
      case 'fle':
        if (value.value !== '') {
          src = process.env.PUBLIC_URL + '/dyfiles/' + value.value;
          result = <a href={src} download={value.value}>{value.value.split('.').pop()}</a>;
        } else {
          result = '';
        }
      break;
      case 'dte':
        result = this.getDate(value.value);
      break;
      case 'ref':
        result = this.getRefValue(value.field.value, value.value);
      break;
      default:
        result = value.value;
    }
    return result;
  }

  getDate(date) {
    const dt = date.split('-');
    if (dt.length === 3) {
      const month = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][dt[1]];
      return dt[0] + '-'+ month + '-' + dt[2];
    } else {
      return '';
    }
  }

  fillContent(values) {
    return values.map((dt, i) => {
      if (dt.field.kind === 'ref') return <small key={i}><strong>{dt.field.name}: </strong>{this.getRefValue(dt.field.value, dt.value)}. </small>
      else if (dt.field.kind === 'img') {
        return <small key={i}>{this.getValueField(dt.field._id)}</small>;
      } else if (dt.field.kind === 'fle') {
        return <small key={i}><strong>{dt.field.name}: </strong>{this.getValueField(dt.field._id)}. </small>
      } else if (dt.field.kind === 'dte') {
        return <small key={i}><strong>{dt.field.name}: </strong>{this.getDate(dt.value)}. </small>
      } else return <small key={i}><strong>{dt.field.name}: </strong>{dt.value}. </small>
    });
  }

  render() {
    let {editing, canEditStage} = this.state;
    let {refValues, canEdit, stage, updDataStage} = this.props;

    let bEdit = null;
    let content = null;
    if (canEdit && canEditStage) {
      if (editing) {
        bEdit = <Button bsStyle='warning' bsSize='xsmall' onClick={() => this._isMounted && this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;
        content = <ModifyStage stage={stage} refValues={refValues} updDataStage={updDataStage} logued={this.props.logued} />
      } else {
        bEdit = <div className='Row' style={{alignSelf: 'stretch', justifyContent: 'space-between'}}>
          <Button bsStyle='success' bsSize='xsmall' onClick={() => this._isMounted && this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>
          <Button bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delDatasStage(stage._id)}><Glyphicon glyph="remove"></Glyphicon> Eliminar</Button>
        </div>;
        let innerContent = this.fillContent(stage.values);
        content = <p>{innerContent}</p>;
      }
    } else {
      let innerContent = this.fillContent(stage.values);
      content = <p>{innerContent}</p>;
    }

    return (<div className="Column Border">
      {bEdit}

      {content}
    </div>);
  }
}

export default ShowDatasStage;
