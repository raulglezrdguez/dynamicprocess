import React, { Component } from "react";
// import { FormGroup, Input, Label } from "reactstrap";
import { Checkbox, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";

import './NewField.css';

class NewField extends Component {
  state = {
    isLoading: false,
    f_name: '', // nombre
    f_desc: '', //
    f_obligatory: false,
    f_kind: 'txt', //
    f_value: '', //
    f_textFields: [], // las tables con los campos de tipo txt obligatory que tienen

  }

  refreshTextFields = () => {
    let {logued} = this.props;

    if (logued.signedIn) {
      let roles = logued.rol.map(r => r);
      const rol = JSON.stringify(roles);

  		fetch(`/api/getTxtFields?token=${logued.token}&rol=${rol}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(tables => {

              let newState = this.state;
              newState.f_textFields = tables.tables;

              this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener tablas: ${err.message.message}`);
            })
          }
  			});
    }
	}

  async componentDidMount() {
    this.refreshTextFields();
  }

  validateForm() {
    let { f_name, f_desc, f_kind, f_value } = this.state;
    let res = true;

    if ((f_kind === 'ref') && (f_value.trim() === ',')) res = false;
    if ((f_kind === 'lst') && (f_value.trim() === '')) res = false;

    return (res &&
      f_name.trim().length > 0 &&
      f_desc.trim().length > 5);
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleChangeKind = event => {
    let newState = this.state;
    const kind = event.target.value;
    newState.f_kind = kind;
    if (kind === 'ref') {
      if (newState.f_textFields.length > 0) {
        newState.f_value = newState.f_textFields[0]._id + ',' + newState.f_textFields[0].field[0]._id;
      } else {
        newState.f_value = ',';
      }
    } else {
      newState.f_value = '';
    }
    this.setState(newState);
  }

  handleChangeObligatory = checked => {
    this.setState({f_obligatory: checked});
  }

  handleSubmit = async event => {
    let {f_name, f_kind, f_value, f_desc, f_obligatory} = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.addField({name: f_name.trim(), kind: f_kind, value: f_value.trim(), desc: f_desc.trim(), obligatory: f_obligatory});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  buildTableFields = (tableId) => {
    let {f_textFields} = this.state;
    let fields = [];
    for(let i = 0; i < f_textFields.length; i++) {
      if (f_textFields[i]._id === tableId) {
        fields = f_textFields[i].field.map((f, i) => (<option key={i} value={f._id}>{f.name}</option>));

        break;
      }
    }

    return fields;
  }

  handleChangeRef = event => {
    let { f_textFields } = this.state;
    let newState = this.state;

    let field = '';
    for(let i = 0; i < f_textFields.length; i++) {
      if (f_textFields[i]._id === event.target.value) {
        field = f_textFields[i].field[0]._id;

        break;
      }
    }

    newState.f_value = event.target.value + ',' + field;
    this.setState(newState);
  }

  handleChangeRefField = event => {
    let newState = this.state;
    let v = newState.f_value.split(',');
    if (v.length > 0) {
      newState.f_value = v[0] + ',' + event.target.value;
      this.setState(newState);
    }
  }

  render() {
    let {f_name, f_desc, f_kind, f_textFields, f_value} = this.state;
    let values = null;

    if (f_kind === 'lst'){
      values = <FormGroup controlId="f_value">
        <ControlLabel>Valores</ControlLabel>
        <FormControl
          type="text"
          value={f_value}
          onChange={this.handleChange}
          placeholder="Valor1, Valor2, Valor3" />
      </FormGroup>
    } else if (f_kind === 'ref') {
      let tableOptions = f_textFields.map((t, i) => (<option key={i} value={t._id}>{t.name}</option>));
      let v = f_value.split(',');
      let defaultRefValue = (v.length > 0) ? v[0] : null;
      let defaultFieldValue = (v.length > 1) ? v[1] : null;
      let fieldOptions = null;
      if (defaultRefValue !== null) {
        fieldOptions = this.buildTableFields(defaultRefValue);
      }

      // console.log(defaultRefValue);
      // console.log(defaultFieldValue);
      // console.log(fieldOptions);

      values = [
        <FormGroup controlId="f_table" key={1}>
          <ControlLabel>Tabla</ControlLabel>
          <FormControl
            componentClass="select"
            value={defaultRefValue}
            onChange={this.handleChangeRef}
          >
            {tableOptions}
          </FormControl>
        </FormGroup>,
        <FormGroup controlId="ef_txtField" key={2}>
          <ControlLabel>Campo</ControlLabel>
          <FormControl
            componentClass="select"
            value={defaultFieldValue}
            onChange={this.handleChangeRefField}
          >
            {fieldOptions}
          </FormControl>
        </FormGroup>
      ];

    }

    let refOption = null;
    if (f_textFields.length > 0) refOption = <option value="ref">Referencia a otra tabla</option>;

    let divKind = <FormGroup controlId="f_kind">
      <ControlLabel>Tipo</ControlLabel>
      <FormControl
        componentClass="select"
        defaultValue={f_kind}
        onChange={this.handleChangeKind}
      >
        <option value="txt">Texto</option>
        <option value="lst">Lista de valores</option>
        <option value="num">Numero</option>
        <option value="img">Imagen</option>
        <option value="fle">Fichero</option>
        <option value="dte">Fecha</option>
        <option value="tme">Hora</option>
        <option value="bln">Boolean</option>
        {refOption}
      </FormControl>
    </FormGroup>;
    if (values) {
      divKind = <div className="divNewField">
        {divKind}

        {values}
      </div>
    }

    return(
      <div className='NewField'>

        {divKind}

        <FormGroup controlId="f_name">
          <ControlLabel>Nombre del campo</ControlLabel>
          <FormControl
            type="text"
            value={f_name}
            onChange={this.handleChange}
            placeholder="Nombre del campo" />
        </FormGroup>
        <FormGroup controlId="f_desc">
          <ControlLabel>Descripción</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={f_desc}
            onChange={this.handleChange}
            placeholder="Descripción del campo" />
        </FormGroup>

        <Checkbox onChange={e => this.handleChangeObligatory(e.target.checked)} checked={this.state.f_obligatory}>Obligatorio</Checkbox>

        <LoaderButton
          block
          bsStyle="primary"
          bsSize="large"
          onClick={this.handleSubmit}
          disabled={!this.validateForm()}
          type="button"
          isLoading={this.state.isLoading}
          text="Crear campo"
          loadingText="Adicionando campo…"
        />

      </div>

    );
  }
}

export default withToast(NewField);
