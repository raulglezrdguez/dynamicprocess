import React, { Component } from "react";
import { Form, Checkbox, FormGroup, FormControl } from "react-bootstrap";

import ShowRowProcess from '../components/ShowRowProcess';
import CreateStage from '../components/CreateStage';
import SaveStagesContent from '../components/SaveStagesContent';

import Pagination from '../components/Pagination';
import withToast from '../components/withToast';

class AdmonDataStage extends Component {
  state = {
    alltprocess: [], // todos los tipos de procesos
    tprocess: '', // el tipo de proceso activo

    activeProcess: true, // mostrar los procesos activos?
    allprocess: [], // todos los procesos a que tiene acceso el usuario
    process: '', // proceso activo
    refProcess: null, // referencia al proceso activo

    refValues: [], // valores de los campos por referencia

    datarows: [], // filas de datos

    currentPage: 1, // pagina que se muestra
    items4Page: 10, // filas de datos de las etapas por pagina
    itemsTotal: 0, // cantidad de filas de datos total

    startingProcess: false, // muestro formulario de primera etapa?

    canAddStage: false, // puede adicionar el primer estado?

  }

  // procesos en los que el usuario tiene o puede entrar datos
  refreshDataProcess = () => {
    if (this.props.logued.signedIn) {
      let {activeProcess} = this.state;

  		fetch(`/api/getDataProcess?token=${this.props.logued.token}&active=${activeProcess}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(process => {
              const allprocess = process.process;
              let theprocess = '';
              let therefprocess = null;
              let alltprocess = [];
              let thetprocess = '';
              allprocess.forEach(prc => {
                if (!alltprocess.find(tp => (tp._id === prc.tprocess._id))) {
                  alltprocess.push(prc.tprocess);
                }
              });
              if (allprocess.length > 0) {
                theprocess = allprocess[0]._id;
                therefprocess = allprocess[0];
                thetprocess = allprocess[0].tprocess._id;
              }

              let newState = this.state;
              newState.alltprocess = alltprocess;
              newState.tprocess = thetprocess;
              newState.allprocess = allprocess;
              newState.process = theprocess;
              newState.refProcess = therefprocess;
              this.setState(newState, this.refreshRefValues);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener tablas: ${err.message}`);
            })
          }
  			});
    }
	}

  refreshDatasStage = () => {
    if (this.props.logued.signedIn) {
      let {process, currentPage, items4Page} = this.state;
      let skip = (currentPage - 1) * items4Page;

  		fetch(`/api/getDatasStage?token=${this.props.logued.token}&process=${process}&skip=${skip}&limit=${items4Page}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(stages => {
              let newState = this.state;
              newState.itemsTotal = stages.count;
              newState.datarows = stages.stages;
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener etapas: ${err.message}`);
            })
          }
  			});
    }
  }

  refreshRefValues = () => {
    let {allprocess} = this.state;
    let {logued} = this.props;

    if (logued.signedIn && allprocess && (allprocess.length > 0)) {
      let getValues = [];
      allprocess.forEach(p => p.stage.forEach(s => s.field.forEach(f => {if (f.kind === 'ref') getValues.push(f.value);})))
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
              // this.setState(newState);
              this.setState(newState, this.refreshCanAddStage);
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener referencias: ${err.message}`);
            });
          }
        });
      }
    } else {
      let newState = this.state;
      newState.refValues = [];
      newState.canAddStage = false;
      newState.itemsTotal = 0;
      newState.datarows = [];
      this.setState(newState);
    }
  }

  refreshCanAddStage = () => {
    const {logued} = this.props;
    const {allprocess, process} = this.state;
    const prc = allprocess.find(p => (p._id === process));

    if (prc && prc.firststage) {
      fetch(`/api/canAddStage?token=${logued.token}&stage=${prc.firststage._id}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(canAddStage => {
              this.setState({canAddStage: canAddStage.ok}, this.refreshDatasStage);
            });
          } else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener etapa: ${err.message}`);
            })
          }
        });
    } else {
      this.setState({canAddStage: false, itemsTotal: 0, datarows: []});
    }
  }

  addDataStage = (datas) => {
    if (this.props.logued.signedIn) {
      let {register, stage, values, next} = datas;
      let flds = values.filter(v => ((typeof v.value === 'string') || (typeof v.value === 'boolean')));

      return fetch('/api/addDatasStage/', {
          method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            register,
            stage,
            next,
            values: flds
          }),
          headers: { 'Content-Type': 'application/json' }
        }).then(response => {
          if (response.ok) {
            response.json().then(dt => {
              const _id = dt.datastage._id;

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
                fetch('/api/updDatasStage/', {
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
                        this.refreshDatasStage();
                      });
                    } else {
                      response.json().then(err => {
                        this.props.showError(`No fue posible modificar datos: ${err.message}`);
                      });
                    }
                  });
              } else {
                this.refreshDatasStage();
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

  updDataStage = (data) => {
    if (this.props.logued.signedIn) {
      let {next, stage, values} = data;
      const {_id} = stage;

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

      return fetch('/api/updDatasStage/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            next,
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
              this.refreshDatasStage();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar datos: ${err.message}`);
            });
          }
  			});
    }
  }

  delRegister = (id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delDatasRegister/${this.props.logued.token}/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshDatasStage();
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

  delDatasStage = (id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delDatasStage/${this.props.logued.token}/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }).then(response => {
          if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshDatasStage();
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
    this.refreshDataProcess();
  }

  handleChange = event => {
    this.setState({[event.target.id]: event.target.value});
  }

  handleChangeTProcess = event => {
    this.setState({tprocess: event.target.value}, this.setFirstProcess);
  }

  handleChangeProcess = event => {
    const _id = event.target.value;
    let newState = this.state;
    const p = newState.allprocess.find(p => (p._id === _id));
    newState.process = _id;
    newState.refProcess = p ? p : null;
    this.setState(newState, this.refreshCanAddStage);
    // this.setState({process: event.target.value});
  }

  setFirstProcess = () => {
    let newState = this.state;
    const p = newState.allprocess.find(p => (p.tprocess._id === newState.tprocess));
    if (p) {
      newState.process = p._id;
      newState.refProcess = p;
    } else {
      newState.process = '';
      newState.refProcess = null;
    }
    this.setState(newState);
  }

  changePage = (newPage) => {
    let newState = this.state;
    const totalPages = Math.ceil(newState.itemsTotal / newState.items4Page);
    if (newPage < 1) newState.currentPage = 1;
    else if (newPage > totalPages) newState.currentPage = totalPages > 0 ? totalPages : 1;
    else newState.currentPage = newPage;
    this.setState(newState, this.refreshDatasStage);
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages = Math.ceil(itemsTotal / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  render() {
    let {activeProcess, alltprocess, tprocess, allprocess, process, refProcess, refValues, datarows, startingProcess, itemsTotal, items4Page, currentPage, canAddStage} = this.state;
    const {logued} = this.props;

    const tprocessOptions = alltprocess.map((t, i) => (<option key={i} value={t._id}>{t.name}</option>));
    const processFilter = allprocess.filter(p => (p.tprocess._id === tprocess));
    const processOptions = processFilter.map((p, i) => (<option key={i} value={p._id}>{p.name}</option>));

    let datarowsDiv = null;
    if (datarows.length > 0) {
      const initialPos = (currentPage - 1) * items4Page;
      const datarowsList = datarows.map((dt, i) => (<ShowRowProcess canEdit={activeProcess} key={i} refValues={refValues} process={refProcess} datarow={dt} addDataStage={this.addDataStage} updDataStage={this.updDataStage} delRegister={this.delRegister} delDatasStage={this.delDatasStage} position={initialPos + i + 1} logued={logued}  />));
      datarowsDiv = <div className="Column">
        <p>Listado de procesos <span className="label label-primary">{itemsTotal}</span></p>

        <SaveStagesContent content={datarows} refValues={refValues} process={process} logued={logued} />

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          {datarowsList}
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
      </div>
    }

    let startingProcessOption = null;
    if (canAddStage && activeProcess && (process !== '')) {
      const prc = processFilter.find(p => (p._id === process));
      startingProcessOption = <div className="Column">
        <Checkbox onChange={e => this.setState({startingProcess: e.target.checked})} checked={startingProcess}>Iniciar proceso</Checkbox>

        {(startingProcess && prc && prc.firststage) ? <CreateStage refValues={refValues} stage={prc.firststage._id} register='' addDataStage={this.addDataStage} logued={logued} /> : null}
      </div>;
    }

    return(
      <div className='Column'>
        <div className="Column Border">
          <Checkbox onChange={e => this.setState({activeProcess: e.target.checked}, this.refreshDataProcess)} checked={activeProcess}>Procesos Activos</Checkbox>
          <Form className="Row">
            <FormGroup controlId="tprocess">
              <FormControl
                componentClass="select"
                onChange={this.handleChangeTProcess}
                value={tprocess} >
                  {tprocessOptions}
              </FormControl>
            </FormGroup>

            <FormGroup controlId="process">
              <FormControl
                componentClass="select"
                onChange = {this.handleChangeProcess}
                value = {process} >
                  {processOptions}
              </FormControl>
            </FormGroup>
          </Form>
        </div>

        {datarowsDiv}

        {startingProcessOption}

      </div>
    );
  }
}

export default withToast(AdmonDataStage);
