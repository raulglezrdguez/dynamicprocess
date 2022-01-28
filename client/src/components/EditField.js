import React, { Component } from "react";
// import { FormGroup, Input, Label } from "reactstrap";
import { Checkbox, FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import withToast from './withToast';
import LoaderButton from "./LoaderButton";

import './EditField.css';

class EditField extends Component {
  state = {
    isLoading: false,
    ef_name: '', // nombre
    ef_desc: '', //
    ef_obligatory: false,
    ef_kind: 'txt', //
    ef_value: '', //
    ef_textFields: [], // las tables con los campos de tipo txt obligatory que tienen

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
              newState.ef_textFields = tables.tables;

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
    let {field} = this.props;
    let newState = this.state;
    newState.ef_name = JSON.parse(JSON.stringify(field.name));
    newState.ef_kind = JSON.parse(JSON.stringify(field.kind));
    newState.ef_value = JSON.parse(JSON.stringify(field.value));
    newState.ef_desc = JSON.parse(JSON.stringify(field.desc));
    newState.ef_obligatory = JSON.parse(JSON.stringify(field.obligatory));
    this.setState(newState, this.refreshTextFields);
  }

  async componentWillReceiveProps(nextProps) {
    let {field} = nextProps;
    let newState = this.state;
    newState.ef_name = JSON.parse(JSON.stringify(field.name));
    newState.ef_kind = JSON.parse(JSON.stringify(field.kind));
    newState.ef_value = JSON.parse(JSON.stringify(field.value));
    newState.ef_desc = JSON.parse(JSON.stringify(field.desc));
    newState.ef_obligatory = JSON.parse(JSON.stringify(field.obligatory));
    this.setState(newState);
  }

  validateForm() {
    let { ef_name, ef_desc, ef_kind, ef_value } = this.state;
    let res = true;

    if ((ef_kind === 'ref') && (ef_value.trim() === ',')) res = false;
    if ((ef_kind === 'lst') && (ef_value.trim() === '')) res = false;

    return (res &&
      ef_name.trim().length > 0 &&
      ef_desc.trim().length > 5);

  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleChangeKind = event => {
    let newState = this.state;
    const kind = event.target.value;
    newState.ef_kind = kind;
    if (kind === 'ref') {
      if (newState.ef_textFields.length > 0) {
        newState.ef_value = newState.ef_textFields[0]._id + ',' + newState.ef_textFields[0].field[0]._id;
      } else {
        newState.ef_value = ',';
      }
    } else {
      newState.ef_value = '';
    }
    this.setState(newState);
  }

  handleChangeObligatory = checked => {
    this.setState({ef_obligatory: checked});
  }


  handleSubmit = async event => {
    let {ef_name, ef_kind, ef_value, ef_desc, ef_obligatory} = this.state;

    event.preventDefault();

    this.setState({ isLoading: true });

    try {
      await this.props.updField({name: ef_name.trim(), kind: ef_kind, value: ef_value.trim(), desc: ef_desc.trim(), obligatory: ef_obligatory, _id: this.props.field._id});
    } catch (e) {
      this.props.showError(`Error: ${e}`);
    }

    this.setState({ isLoading: false });
  }

  buildTableFields = (tableId) => {
    let {ef_textFields} = this.state;
    let fields = [];
    for(let i = 0; i < ef_textFields.length; i++) {
      if (ef_textFields[i]._id === tableId) {
        fields = ef_textFields[i].field.map((f, i) => (<option key={i} value={f._id}>{f.name}</option>));

        break;
      }
    }

    return fields;
  }

  handleChangeRef = event => {
    let { ef_textFields } = this.state;
    let newState = this.state;

    let field = '';
    for(let i = 0; i < ef_textFields.length; i++) {
      if (ef_textFields[i]._id === event.target.value) {
        field = ef_textFields[i].field[0]._id;

        break;
      }
    }

    newState.ef_value = event.target.value + ',' + field;
    this.setState(newState);
  }

  handleChangeRefField = event => {
    let newState = this.state;
    let v = newState.ef_value.split(',');
    if (v.length > 0) {
      newState.ef_value = v[0] + ',' + event.target.value;
      this.setState(newState);
    }
  }

  render() {
    let {ef_name, ef_desc, ef_kind, ef_textFields, ef_value} = this.state;
    let values = null;

    if (ef_kind === 'lst'){
      values = <FormGroup controlId="ef_value">
        <ControlLabel>Valores</ControlLabel>
        <FormControl
          type="text"
          value={ef_value}
          onChange={this.handleChange}
          placeholder="Valor1, Valor2, Valor3" />
      </FormGroup>
    } else if (ef_kind === 'ref') {
      let tableOptions = ef_textFields.map((t, i) => (<option key={i} value={t._id}>{t.name}</option>));
      let v = ef_value.split(',');
      let defaultRefValue = (v.length > 0) ? v[0] : null;
      let defaultFieldValue = (v.length > 1) ? v[1] : null;
      let fieldOptions = null;
      if (defaultRefValue !== null) {
        fieldOptions = this.buildTableFields(defaultRefValue);
      }

      values = [
        <FormGroup controlId="ef_table" key={1}>
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
    if (ef_textFields.length > 0) refOption = <option value="ref">Referencia a otra tabla</option>;

    let divKind = <FormGroup controlId="ef_kind">
      <ControlLabel>Tipo</ControlLabel>
      <FormControl
        componentClass="select"
        value={ef_kind}
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
      divKind = <div className="divEditField">
        {divKind}

        {values}
      </div>
    }

    return(
      <div className='EditField'>

        {divKind}

        <FormGroup controlId="ef_name">
          <ControlLabel>Nombre del campo</ControlLabel>
          <FormControl
            type="text"
            value={ef_name}
            onChange={this.handleChange}
            placeholder="Nombre del campo" />
        </FormGroup>
        <FormGroup controlId="ef_desc">
          <ControlLabel>Descripción</ControlLabel>
          <FormControl
            componentClass="textarea"
            value={ef_desc}
            onChange={this.handleChange}
            placeholder="Descripción del campo" />
        </FormGroup>

        <Checkbox onChange={e => this.handleChangeObligatory(e.target.checked)} checked={this.state.ef_obligatory}>Obligatorio</Checkbox>

        <LoaderButton
          block
          bsStyle="primary"
          bsSize="large"
          disabled={!this.validateForm()}
          onClick={this.handleSubmit}
          type="button"
          isLoading={this.state.isLoading}
          text="Modificar campo"
          loadingText="Modificando campo…"
        />

      </div>
    );
  }
}

export default withToast(EditField);
