import React, { Component } from "react";
import { Form, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import ShowPublicDatasTable from '../components/ShowPublicDatasTable';
import SavePublicContent from '../components/SavePublicContent';
import SummaryPublicDatas from '../components/SummaryPublicDatas';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import './AdmonPublicData.css';

class AdmonPublicData extends Component {
  state = {
      modules: [], // modulos a que tiene acceso el usuario
      module: '', // modulo activo
      tables: [], // tablas del modulo activo
      table: '', // tabla activa
      datastable: [], // datos de la tabla activa
      refValues: [], // valores de los campos por referencia
      currentPage: 1, // pagina que se muestra
      items4Page: 10, // datatables por pagina
      itemsTotal: 0, // cantidad de datatables total
      viewType: 'table',
  }

  refreshTables = () => {
  		fetch('/api/getPublicTables', {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(tables => {
              const tbls = tables.tables;
              let tblsArray = []; // tablas
              let mdlsArray = []; // modulos
              tbls.forEach(tbl => {
                tblsArray.push(tbl);
                if (!mdlsArray.find(m => (m._id === tbl.module._id))) mdlsArray.push(tbl.module);
              });

              let newState = this.state;
              newState.modules = mdlsArray;
              newState.tables = tblsArray;
              if (mdlsArray.length > 0) {
                newState.module = mdlsArray[0]._id;
                const tbl = tblsArray.find(t => (t.module._id === newState.module));
                if (tbl) newState.table = tbl._id;
                else newState.table = '';
              } else {
                newState.module = '';
                newState.table = '';
              }
              this.setState(newState, this.refreshDatasTable);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener tablas: ${err.message}`);
            })
          }
  			});
	}

  refreshDatasTable = () => {
      let { items4Page, currentPage, table } = this.state;
      let skip = (currentPage - 1) * items4Page;
  		fetch(`/api/getPublicDatas?skip=${skip}&limit=${items4Page}&table=${table}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(datas => {
              let newState = this.state;
              newState.itemsTotal = datas.count;
              newState.datastable = datas.datas;
              this.setState(newState, this.refreshRefValues);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener datos: ${err.message}`);
            })
          }
  			});
	}

  refreshRefValues = () => {
    let {tables, table} = this.state;

    if (table !== '') {
      let getValues = [];
      const fields = tables.find(t => t._id === table).field;
      fields.forEach(f => { if (f.kind === 'ref') getValues.push(f.value); });
      if (getValues.length > 0) {
        const refs = JSON.stringify(getValues);
        fetch(`/api/getPublicTablesFields?refs=${refs}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(datas => {
              let newState = this.state;
              newState.refValues = datas.datas;
              this.setState(newState, this.updPage);
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener listado: ${err.message}`);
            });
          }
        });
      }
    }
  }

  async componentDidMount() {
    this.refreshTables();
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, this.refreshDatasTable);
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages = Math.ceil(itemsTotal / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  handleChangeModule = event => {
    this.setState({module: event.target.value}, this.setTable);
  }

  setModule = () => {
    let newState = this.state;
    if (newState.modules.length > 0) newState.module = newState.modules[0]._id;
    else newState.module = '';
    this.setState(newState, this.setTable);
  }

  setTable = () => {
    let newState = this.state;
    const tbl = newState.tables.find(t => (t.module._id === newState.module));
    if (tbl) newState.table = tbl._id;
    else newState.table = '';
    this.setState(newState, this.refreshDatasTable);
  }

  handleChange = event => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleChangeTable = event => {
    this.setState({table: event.target.value}, this.refreshDatasTable);
  }

  render() {
    let { modules, module, tables, table, itemsTotal, items4Page, currentPage, datastable, refValues, viewType} = this.state;

    const moduleOptions = modules.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));
    const tableOptions = tables.map((t, i) => (<option key={i} value={t._id}>{t.name}</option>));

    let htmlcontent = null;
    if (itemsTotal > 0) {
      let datastableList = null;
      const initialPos = (currentPage - 1) * items4Page;
      let showPublicDatasTable = datastable.map((dt, i) => (<ShowPublicDatasTable key={i} datastable={dt} refValues={refValues} viewType={viewType} position={initialPos + i + 1} />));
      if (viewType === 'table') {
        const field = datastable[0].table.field;
        let thHeads = [<th key={1}>#</th>];
        if (field.length > 0) {
          thHeads.push(field.map((f, i) => (<th key={i+2}>{f.name}</th>)));
        }
        showPublicDatasTable = <table>
              <tbody>
                <tr>
                  {thHeads}
                </tr>
                {showPublicDatasTable}
              </tbody>
            </table>
      }
      datastableList = <div className='PublicDataList'>
        <p>Listado de datos <span className="label label-primary">{itemsTotal}</span></p>

        <SummaryPublicDatas table={table} />

        <SavePublicContent content={datastable} refValues={refValues} />

        <Form className='PublicDataFormHeader'>
          <FormGroup controlId="viewType" style={{margin: '.3em', border: '1px solid #fff', borderRadius: '.5em', padding: '.3em'}}>
            <ControlLabel>Vista</ControlLabel>
            <FormControl
              componentClass="select"
              onChange = {this.handleChange}
              defaultValue = {viewType} >
                <option value="group">Grupo</option>
                <option value="table">Tabla</option>
            </FormControl>
          </FormGroup>
        </Form>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          <div className="divTablesList">
            {showPublicDatasTable}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />

      </div>;

      htmlcontent = <div className='PublicDataList'>
        <Form className='PublicDataFormHeader'>

          <div style={{margin: '.3em', border: '1px solid #fff', borderRadius: '.5em'}}>
            <FormGroup controlId="module" style={{margin: '.5em'}}>
              <ControlLabel>Modulo</ControlLabel>
              <FormControl
                componentClass="select"
                onChange = {this.handleChangeModule}
                defaultValue = {module} >
                  {moduleOptions}
              </FormControl>
            </FormGroup>
          </div>

          <div style={{margin: '.3em', border: '1px solid #fff', borderRadius: '.5em'}}>
            <FormGroup controlId="table" style={{margin: '.5em'}}>
              <ControlLabel>Tabla</ControlLabel>
              <FormControl
                componentClass="select"
                onChange = {this.handleChangeTable}
                defaultValue = {table} >
                  {tableOptions}
              </FormControl>
            </FormGroup>
          </div>

        </Form>

        {datastableList}
      </div>;
    } else {
      htmlcontent = <p>No hay datos disponibles</p>;
    }

    return(
      <div className='AdmonPublicData'>

        {htmlcontent}

      </div>
    );
  }
}

export default withToast(AdmonPublicData);
