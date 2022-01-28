import React, { Component } from "react";
// import { Panel, Checkbox } from "react-bootstrap";
import { Checkbox } from "react-bootstrap";

import NewField from './NewField';
import ShowField from './ShowField';

import withToast from './withToast';
import Pagination from './Pagination';

import './AdmonFields.css';

class AdmonFields extends Component {
  state = {
      // table: '', // id de la tabla a que pertenecen los fields
      fields: [], // fields de la pagina activa
      currentPage: 1, // pagina que se muestra
      items4Page: 1, // fields por pagina
      itemsTotal: 0, // cantidad de fields total
      newField: false, // muestro formulario para crear nuevo campo?
  }

  refreshFields = (table) => {
    if (this.props.logued.signedIn) {
      let { items4Page, currentPage } = this.state;
      // let { table } = this.props;
      let skip = (currentPage - 1) * items4Page;

  		fetch(`/api/getFields?token=${this.props.logued.token}&skip=${skip}&limit=${items4Page}&table=${table}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(fields => {
              let newState = this.state;
              newState.itemsTotal = fields.count;
              newState.fields = fields.fields;

              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener campos: ${err.message}`);
            })
          }
  			});
    }
	}

  addField = (field) => {
    if (this.props.logued.signedIn) {
      let { name, kind, value, desc, obligatory } = field;
      let { table } = this.props;

      return fetch('/api/addField/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            name,
            desc,
            obligatory,
            kind,
            value,
            table
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(fld => {
              this.refreshFields(table);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar campo: ${err.message}`);
            });
          }
  			});
    }
  }

  updField = (field) => {
    if (this.props.logued.signedIn) {
      let { _id, name, kind, value, desc, obligatory } = field;
      let { table } = this.props;

      return fetch('/api/updField/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            id: _id,
            name,
            desc,
            obligatory,
            kind,
            value,
            table
          }),
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(fld => {
              let newState = this.state;
              for(let i = 0; i < newState.fields.length; i++) {
                if (newState.fields[i]._id === _id) {
                  newState.fields[i].name = name;
                  newState.fields[i].kind = kind;
                  newState.fields[i].value = value;
                  newState.fields[i].desc = desc;
                  newState.fields[i].obligatory = obligatory;

                  break;
                }
              }
              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar campo: ${err.message}`);
            });
          }
  			});
    }
  }

  delField = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delField/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshFields(this.props.table);
              } else {
                this.props.showError('No fue posible eliminar el campo.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar campo: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshFields(this.props.table);
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.table !== nextProps.table){
      this.refreshFields(nextProps.table);
    }
  }


  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, () => this.refreshFields(this.props.table));
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages= Math.ceil(itemsTotal / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    }, this.refreshFields(this.props.table));
  }

  handleChangeNewField = checked => {
    this.setState({newField: checked});
  }

  render() {
    let { fields, itemsTotal, items4Page, currentPage, newField } = this.state;

    let fieldsList = null;
    if (itemsTotal > 0) {
      let showFields = fields.map((f, i) => (<ShowField key={i} updField={this.updField} delField={this.delField} field={f} logued={this.props.logued} />));
      fieldsList = <div className='FieldsList'>
        <p>Listado de campos <span className="label label-primary">{itemsTotal}</span></p>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          {showFields}
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />

      </div>
    }

    let showNewField = newField ? <NewField addField={this.addField} logued={this.props.logued} /> : null;

    return(
        <div className='AdmonFields'>
          <div className='FieldsList'>

            {fieldsList}

          </div>

          <div className='FieldsList'>
            <Checkbox onChange={e => this.handleChangeNewField(e.target.checked)} checked={newField}>Crear nuevo campo</Checkbox>

            {showNewField}
          </div>
      </div>
    );
  }
}

export default withToast(AdmonFields);

/*
<Panel>
  <Panel.Heading>Campos</Panel.Heading>
  <Panel.Body className='AdmonFields'>
    <div className='FieldsList'>

      {fieldsList}

    </div>

    <div className='FieldsList'>
      <Checkbox onChange={e => this.handleChangeNewField(e.target.checked)} checked={newField}>Crear nuevo campo</Checkbox>

      {showNewField}
    </div>
</Panel.Body>
</Panel>

*/
