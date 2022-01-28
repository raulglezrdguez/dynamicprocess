import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl } from "react-bootstrap";

import NewDatasTable from '../components/NewDatasTable';
import ShowDatasTable from '../components/ShowDatasTable';
import SaveContent from '../components/SaveContent';
import SummaryDatas from '../components/SummaryDatas';

import ImportContent from '../components/ImportContent';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import './AdmonDataTable.css';

class AdmonDataTable extends Component {
  state = {
      activeModules: true, // mostrar los modulos activos
      modules: [], // modulos a que tiene acceso el usuario
      module: '', // modulo activo
      activeTables: true, // mostrar las tablas activas
      tables: [], // tablas del modulo activo
      table: '', // tabla activa
      datastable: [], // datos de la tabla activa
      refValues: [], // valores de los campos por referencia
      currentPage: 1, // pagina que se muestra
      items4Page: 10, // datatables por pagina
      itemsTotal: 0, // cantidad de datatables total
      newDatasTable: false, // muestro formulario para crear nuevos datos en la tabla?
      viewType: 'table',
  }

  refreshTables = () => {
    if (this.props.logued.signedIn) {

  		fetch(`/api/getTablesData?token=${this.props.logued.token}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(tables => {
              const tbls = tables.tables; // tablas
              let mdlsArray = []; // modulos
              tbls.forEach(tbl => { if (!mdlsArray.find(m => (m._id === tbl.module._id))) mdlsArray.push(tbl.module); });

              let newState = this.state;
              newState.modules = mdlsArray;
              newState.tables = tbls;

              const mdl = mdlsArray.find(m => (m.active === newState.activeModules));
              if (mdl) {
                newState.module = mdl._id;
                const tbl = tbls.find(t => ((t.module._id === newState.module) && (t.active === newState.activeTables)));
                newState.table = tbl ? tbl._id : '';
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
	}

  refreshDatasTable = () => {
    let {logued} = this.props;

    if (logued.signedIn) {
      let { items4Page, currentPage, table } = this.state;
      let skip = (currentPage - 1) * items4Page;

  		fetch(`/api/getDatasTable?token=${logued.token}&skip=${skip}&limit=${items4Page}&table=${table}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(datas => {

              let newState = this.state;
              newState.itemsTotal = datas.count;
              if (datas.datas.length > 0) {
                newState.datastable = datas.datas;
              } else {
                newState.datastable = [];
                newState.currentPage = 1;
              }
              this.setState(newState, this.refreshRefValues);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener datos: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshRefValues = () => {
    let {logued} = this.props;
    let {tables, table} = this.state;

    if (logued.signedIn) {
      if (table !== '') {
        let getValues = [];
        tables.find(t => t._id === table).field.forEach(f => { if (f.kind === 'ref') getValues.push(f.value); });
        if (getValues.length > 0) {
          const refs = JSON.stringify(getValues);
          fetch(`/api/getDatasTablesFields?token=${logued.token}&refs=${refs}`, {
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
  }

  uploadImage = (file, id, field) => {
    var data = new FormData();
    data.append('imageFile', file);
    data.append('id', id);
    data.append('field', field);

    fetch('/api/addDyImage', {
          method: 'POST',
          body: data
        }).then(response => {
          if (!response.ok) {
            response.json().then(err => {
              this.props.showError(`No fue posible subir imagen: ${err.message}`);
            });
          }
        });
  }

  uploadFile = (file, id, field) => {
    var data = new FormData();
    data.append('compressedFile', file);
    data.append('id', id);
    data.append('field', field);

    fetch('/api/addDyFile/', {
          method: 'POST',
          body: data
        }).then(response => {
          if (!response.ok) {
            response.json().then(err => {
              this.props.showError(`No fue posible subir fichero: ${err.message}`);
            });
          }
        });
  }

  addDatasTable = (datatable) => {
    if (this.props.logued.signedIn) {
      let {table, values} = datatable;
      let flds = values.filter(v => ((typeof v.value === 'string') || (typeof v.value === 'boolean')));

      return fetch('/api/addDatasTable/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            table,
            values: flds
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(dt => {
              const _id = dt.datatable._id;

              let imgs = [];
              let files = [];
              let upd = false;
              values.forEach(v => {
                if (typeof v.value === 'object') {
                  if (v.value.type === 'image/png') {
                    upd = true;
                    imgs.push(v);
                    flds.push({field: v.field, value: _id + '-' + v.field + '.' + v.value.type.split('/')[1]});
                  } else if ((v.value.type === 'application/zip') || (v.value.type === 'application/rar')) {
                    upd = true;
                    files.push(v);
                    flds.push({field: v.field, value: _id + '-' + v.field + '.' + v.value.type.split('/')[1]});
                  }
                }
              });

              if (upd) {
                fetch('/api/updDatasTable/', {
            				method: 'POST',
                    body: JSON.stringify({
                      token: this.props.logued.token,
                      id: _id,
                      values: flds
                    }),
            				headers: { 'Content-Type': 'application/json' },
            			}).then(response => {
            				if (response.ok) {
                      response.json().then(dttbl => {
                        imgs.forEach((img, i) => {
                          this.uploadImage(img.value, _id, img.field);
                        });
                        files.forEach((file, i) => {
                          this.uploadFile(file.value, _id, file.field);
                        });
                        this.refreshDatasTable();
                      });
            				} else {
                      response.json().then(err => {
                        this.props.showError(`No fue posible modificar datos: ${err.message}`);
                      });
                    }
            			});
              } else {
                this.refreshDatasTable();
              }
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar datos: ${err.message}`);
            });
          }
  			});
    }
  }

  updDatasTable = (datatable) => {
    if (this.props.logued.signedIn) {
      let {_id, values} = datatable;

      let flds = [];
      let imgs = [];
      let files = [];
      values.forEach(v => {
        if ((typeof v.value === 'string') || (typeof v.value === 'boolean')) {
          flds.push(v);
        } else if (typeof v.value === 'object') {
          if (v.value.type === 'image/png') {
            imgs.push(v);
            flds.push({field: v.field, value: _id + '-' + v.field + '.' + v.value.type.split('/')[1]});
          } else if ((v.value.type === 'application/zip') || (v.value.type === 'application/rar')) {
            files.push(v);
            flds.push({field: v.field, value: _id + '-' + v.field + '.' + v.value.type.split('/')[1]});
          }
        }
      });

      return fetch('/api/updDatasTable/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            values: flds
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(datastable => {
              imgs.forEach((img, i) => {
                this.uploadImage(img.value, _id, img.field);
              });
              files.forEach((file, i) => {
                this.uploadFile(file.value, _id, file.field);
              });
              let newState = this.state;
              for(let i = 0; i < newState.datastable.length; i++) {
                if (newState.datastable[i]._id === _id) {
                  newState.datastable[i].values.forEach((v) => {
                    for(let j = 0; j < values.length; j++){
                      if (v.field._id === values[j].field) {
                        if (typeof values[j].value === 'object') {
                          if (values[j].value.type === 'image/png') {
                            v.value = _id + '-' + values[j].field + '.' + values[j].value.type.split('/')[1];
                          } else if ((values[j].value.type === 'application/zip') || (values[j].value.type === 'application/rar')) {
                            v.value = _id + '-' + values[j].field + '.' + values[j].value.type.split('/')[1];
                          }
                        } else {
                          v.value = values[j].value;
                        }

                        break;
                      }
                    }
                  });

                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar datos: ${err.message}`);
            });
          }
  			});
    }
  }

  delDatasTable = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delDatasTable/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshDatasTable();
              } else {
                this.props.showError('No fue posible eliminar los datos.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar datos: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshTables();
  }

  changePage = (newPage) => {
    let newState = this.state;
    const totalPages = Math.ceil(newState.itemsTotal / newState.items4Page);
    if (newPage < 1) newState.currentPage = 1;
    else if (newPage > totalPages) newState.currentPage = totalPages > 0 ? totalPages : 1;
    else newState.currentPage = newPage;
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
    const mdl = newState.modules.find(m => (m.active === newState.activeModules));
    newState.module = mdl ? mdl._id : '';
    this.setState(newState, this.setTable);
  }

  setTable = () => {
    let newState = this.state;
    const tbl = newState.tables.find(t => ((t.module._id === newState.module) && (t.active === newState.activeTables)));
    newState.table = tbl ? tbl._id : '';
    this.setState(newState, this.refreshDatasTable);
  }

  handleChange = event => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleChangeTable = event => {
    this.setState({table: event.target.value}, this.refreshDatasTable);
  }

  render() {
    let {activeModules, modules, module, activeTables, tables, table, itemsTotal, items4Page, currentPage, datastable, newDatasTable, refValues, viewType} = this.state;

    const modulesFilter = modules.filter(m => (m.active === activeModules));
    const moduleOptions = modulesFilter.map((m, i) => (<option key={i} value={m._id}>{m.name}</option>));
    const tablesFilter = tables.filter(t => ((t.module._id === module) && (t.active === activeTables)));
    const tableOptions = tablesFilter.map((t, i) => (<option key={i} value={t._id}>{t.name}</option>));

    let datastableList = null;
    if (itemsTotal > 0) {
      const initialPos = (currentPage - 1) * items4Page;
      let showDatasTable = datastable.map((dt, i) => (<ShowDatasTable key={i} editable={activeModules && activeTables} updDatasTable={this.updDatasTable} delDatasTable={this.delDatasTable} datastable={dt} refValues={refValues} viewType={viewType} position={initialPos + i + 1} logued={this.props.logued} />));
      if (viewType === 'table') {
        const field = (datastable[0] && datastable[0].table && datastable[0].table.field) ? datastable[0].table.field : [];
        let thHeads = [<th key={0}>Editar</th>, <th key={1}>#</th>];
        if (field.length > 0) {
          thHeads.push(field.map((f, i) => (<th key={i+2}>{f.name}</th>)));
          thHeads.push(<th key={field.length+3}>Creado</th>);
          thHeads.push(<th key={field.length+4}>Eliminar</th>);
        }
        // showDatasTable = <Table condensed responsive>
        showDatasTable = <table>
              <tbody>
                <tr>
                  {thHeads}
                </tr>
                {showDatasTable}
              </tbody>
            </table>
      }
      datastableList = <div className='DataTableList'>
        <p>Listado de datos <span className="label label-primary">{itemsTotal}</span></p>

        <SummaryDatas table={table} logued={this.props.logued} />

        <SaveContent content={datastable} refValues={refValues} logued={this.props.logued}/>

        <Form className="DataTableList">
          <FormGroup controlId="viewType">
            <FormControl
              componentClass="select"
              onChange = {this.handleChange}
              defaultValue = {viewType} >
                <option value="group">Ver Grupo</option>
                <option value="table">Ver Tabla</option>
            </FormControl>
          </FormGroup>
        </Form>


        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          <div className="divTablesList">
            {showDatasTable}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />

      </div>
    }

    let importContentOption = null;
    let newDatasTableOption = null;
    if ((table !== '') && activeModules && activeTables) {
      let showNewDatasTable = null;
      const td = tablesFilter.find((t) => (t._id === table));
      importContentOption = <ImportContent table={td} refreshDatasTable={this.refreshDatasTable} logued={this.props.logued} />
      if (newDatasTable) {
        showNewDatasTable = <NewDatasTable addDatasTable={this.addDatasTable} table={td} refValues={refValues} logued={this.props.logued} />;
      }
      newDatasTableOption = <div>
        <Checkbox onChange={e => this.setState({newDatasTable: e.target.checked})} checked={newDatasTable}>Crear nuevos datos</Checkbox>

        {showNewDatasTable}
      </div>;
    }


    return(
        <div className='AdmonDataTable'>

          <div className="DataTableList">
            <Form className='DataTableFormHeader'>

              <div className="DataTableList">
                <Checkbox onChange={e => this.setState({activeModules: e.target.checked}, this.setModule)} checked={activeModules}>Modulos Activos</Checkbox>
                <FormGroup controlId="module" style={{margin: '.5em'}}>
                  <FormControl
                    componentClass="select"
                    onChange = {this.handleChangeModule}
                    defaultValue = {module} >
                      {moduleOptions}
                  </FormControl>
                </FormGroup>
              </div>

              <div className="DataTableList">
                <Checkbox onChange={e => this.setState({activeTables: e.target.checked}, this.setTable)} checked={activeTables}>Tablas Activas</Checkbox>
                <FormGroup controlId="table" style={{margin: '.5em'}}>
                  <FormControl
                    componentClass="select"
                    onChange = {this.handleChangeTable}
                    defaultValue = {table} >
                      {tableOptions}
                  </FormControl>
                </FormGroup>
              </div>

            </Form>

            <div>
              {importContentOption}
            </div>
          </div>

          {datastableList}

          {newDatasTableOption}

        </div>
    );
  }
}

export default withToast(AdmonDataTable);
