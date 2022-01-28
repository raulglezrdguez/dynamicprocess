import React, { Component } from "react";
import { Button, Glyphicon } from "react-bootstrap";

import withToast from './withToast';

import './SummaryDatas.css';

class SummaryDatas extends Component {
  state = {
    datas: [], // datos del resumen
  }

  refreshSummary = (table) => {
    let {logued} = this.props;

    if (logued.signedIn) {

  		fetch(`/api/getSummaryDatas?token=${logued.token}&table=${table}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(datas => {
              this.setState({datas: datas});
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener resumen: ${err.message}`);
            })
          }
  			});
    }
	}

  async componentDidMount() {
    this.refreshSummary(this.props.table);
  }

  async componentWillReceiveProps(nextProps) {
    if (nextProps.table !== this.props.table){
      this.refreshSummary(nextProps.table);
    }
  }

  getDate(date) {
    const dt = new Date(date);
    const month = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return dt.getDate() + ' de '+ month[dt.getMonth()] + ' de ' + dt.getFullYear();
  }

  getReal(value, length) {
    const v = value.toString().split('.');
    if (v.length > 1) {
      return v[0] + '.' + v[1].substring(0, length);
    } else {
      return v.toString();
    }
  }

  render() {
    let {datas} = this.state;

    let innerDetail = [];
    let index = 0;
    let aux = '';

    for (let field in datas.sum) {
      if (datas.sum.hasOwnProperty(field)) {
        let type = datas.sum[field]['type'];
        switch(type){
          case 'txt':
          case 'img':
          case 'fle':
            innerDetail.push(<p key={index++}><strong>{field}.</strong> Cantidad: {datas.sum[field]['count']}.</p>);
          break;
          case 'num':
            if (datas.sum[field]['count'] > 0) {
              aux = 'Promedio: ' + this.getReal(datas.sum[field]['sum'] / datas.sum[field]['count'], 2);
            } else aux = '';
            innerDetail.push(<p key={index++}><strong>{field}.</strong> Cantidad: {datas.sum[field]['count']}. Suma total: {this.getReal(datas.sum[field]['sum'], 2)}. {aux}</p>)
          break;
          case 'bln':
            innerDetail.push(<p key={index++}><strong>{field}.</strong> Cantidad: {datas.sum[field]['count']}. Verdadero: {datas.sum[field]['true']}. Falso: {datas.sum[field]['false']}.</p>)
          break;
          case 'lst':
            aux = '';
            for(let fld in datas.sum[field]) {
              if (datas.sum[field].hasOwnProperty(fld)) {
                if ((['type', 'count'].indexOf(fld) === -1) && (datas.sum[field][fld] > 0)) {
                  aux += fld + ': ' + datas.sum[field][fld] + '. ';
                }
              }
            }
            innerDetail.push(<p key={index++}><strong>{field}.</strong> Cantidad: {datas.sum[field]['count']}. {aux}</p>)
          break;
          case 'dte':
            aux = 'Desde: ' + this.getDate(datas.sum[field]['min']) + '. Hasta: ' + this.getDate(datas.sum[field]['max']);
            innerDetail.push(<p key={index++}><strong>{field}.</strong> Cantidad: {datas.sum[field]['count']}. {aux}.</p>)
          break;
          case 'tme':
            innerDetail.push(<p key={index++}><strong>{field}.</strong> Cantidad: {datas.sum[field]['count']}. Desde: {datas.sum[field]['min']}. Hasta: {datas.sum[field]['max']}.</p>)
          break;
        default:
          innerDetail.push(<p key={index++}><strong>{field}.</strong> Sin datos.</p>);
        }
      }
    }

    return(
      <div className='SummaryDatas'>
        <Button className="SummaryRefresh" bsStyle='success' bsSize='xsmall' onClick={() => this.refreshSummary(this.props.table)}><Glyphicon glyph="refresh"></Glyphicon> Refrescar</Button>

        {innerDetail}
      </div>
    );
  }
}

export default withToast(SummaryDatas);
