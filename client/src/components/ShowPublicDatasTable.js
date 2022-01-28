import React, { Component } from "react";

import './ShowPublicDatasTable.css';

class ShowPublicDatasTable extends Component {
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

  getDate(date) {
    const dt = date.split('-');
    if (dt.length === 3) {
      const month = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][dt[1]];
      return dt[0] + ' de '+ month + ' de ' + dt[2];
    } else {
      return '';
    }
  }

  render() {
    const { datastable, viewType, position } = this.props;

    if (viewType === 'table') {
      const fields = datastable.table.field;
      let tdCells = [<td key={0}>{position}</td>];
      if (fields.length > 0) {
        fields.forEach((f, i) => {
          tdCells.push(<td key={i+1}>{this.getValueField(f._id)}</td>);
        });
      } else {
        tdCells.push(<td key={1} colSpan={fields.length + 1} align='center'>Sin datos</td>);
      }

      return (<tr align='left'>
        {tdCells}
      </tr>);
    } else {
      let content = null;

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

      return (<div className='ShowPublicDatasTable'>
        <p>{datastable.name}</p>
        <div>
          {content}
        </div>
      </div>);

    }

  }
}

export default ShowPublicDatasTable;
