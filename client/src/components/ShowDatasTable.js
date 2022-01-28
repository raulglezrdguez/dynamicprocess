import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import EditDatasTable from './EditDatasTable';

import './ShowDatasTable.css';

class ShowDatasTable extends Component {
  state = {
    editing: false, // editando?
  }

  getRefValue = (tableField, ref) => {
    let result = 'No encontrado';
    let {refValues} = this.props;
    const tfSplit = tableField.split(',');

    const rv = refValues.find(r => ((r.table === tfSplit[0]) && (r.field === tfSplit[1])));
    if (rv) {
      const val = rv.values.find(v => (v.id === ref));
      if (val) result = val.value;
    }

    return result;
  }

  getValueField = (id) => {
    let result = null;
    const value = this.props.datastable.values.find(v => v.field._id === id);
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

  getDate(date){
    const dt = date.split('-');
    if (dt.length === 3) {
      const month = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][dt[1]];
      return dt[0] + '-'+ month + '-' + dt[2];
    } else {
      return '';
    }
  }

  render() {
    const { editable, datastable, refValues, viewType, position } = this.props;
    const { editing } = this.state;

    let bEdit = null;

    if (viewType === 'table') {
      const fields = datastable.table.field;
      let tdCells = [];
      if (editing) {
        let {updDatasTable} = this.props;
        bEdit = <Button disabled={!editable} bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

        tdCells = [<td key={0}>{bEdit}</td>, <td key={1}>{position}</td>];
        tdCells.push(
          <td key={2} colSpan={fields.length + 2} align='center'>
            <EditDatasTable updDatasTable={updDatasTable} datastable={datastable} refValues={refValues} logued={this.props.logued} />
          </td>);
      } else {
        bEdit = <Button disabled={!editable} bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}><Glyphicon glyph="pencil"></Glyphicon></Button>;

        tdCells = [<td key={0}>{bEdit}</td>, <td key={1}>{position}</td>];
        if (fields.length > 0) {
          fields.forEach((f, i) => {
            tdCells.push(<td key={i+2}>{this.getValueField(f._id)}</td>);
          });
          const date = new Date(datastable.date);
          let fecha = date.getDate() + '-' + (date.getMonth() + 1) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();
          tdCells.push(<td key={fields.length+3}>{fecha}</td>);
          tdCells.push(<td key={fields.length+4} align='right'>
                <Button disabled={!editable} bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delDatasTable(datastable._id)}><Glyphicon glyph="remove-sign"></Glyphicon></Button>
              </td>);
        } else {
          tdCells.push(<td key={2} colSpan={fields.length + 2} align='center'>Sin datos</td>);
        }
      }

      return (<tr align='left'>
        {tdCells}
      </tr>);
    } else {
      let content = null;

      if (editing) {
        let {updDatasTable} = this.props;

        bEdit = <Button disabled={!editable} bsStyle='warning' bsSize='xsmall' onClick={() => this.setState({editing: false})}>Cancelar <Glyphicon glyph="pencil"></Glyphicon></Button>;

        content = <EditDatasTable updDatasTable={updDatasTable} datastable={datastable} refValues={refValues} logued={this.props.logued} />;
      } else {
        bEdit = <Button disabled={!editable} bsStyle='success' bsSize='xsmall' onClick={() => this.setState({editing: true})}>Editar <Glyphicon glyph="pencil"></Glyphicon></Button>;
        const innerContent = datastable.values.map((dt, i) => {
          if (dt.field.kind === 'ref') return <small key={i}><strong>{dt.field.name}: </strong>{this.getRefValue(dt.field.value, dt.value)}. </small>
          else if (dt.field.kind === 'img') {
            return <small key={i}>{this.getValueField(dt.field._id)}</small>;
          } else if (dt.field.kind === 'fle') {
            return <small key={i}><strong>{dt.field.name}: </strong>{this.getValueField(dt.field._id)}. </small>
          } else if (dt.field.kind === 'dte') {
            return <small key={i}><strong>{dt.field.name}: </strong>{this.getDate(dt.value)}. </small>
          } else return <small key={i}><strong>{dt.field.name}: </strong>{dt.value}. </small>
        });
        content = <p>{innerContent}</p>;
      }

      return (<div className='ShowDatasTable'>
        <p>{datastable.name}</p>
        <div className='ShowDatasTableDesc'>
          {bEdit}
          <Button disabled={!editable} bsStyle='danger' bsSize='xsmall' onClick={() => this.props.delDatasTable(datastable._id)}><Glyphicon glyph="remove-sign"></Glyphicon> Eliminar</Button>
        </div>
        <div>
          {content}
        </div>
      </div>);

    }

  }
}

export default ShowDatasTable;
