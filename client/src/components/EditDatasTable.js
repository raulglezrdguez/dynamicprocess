import React, { Component } from "react";
import { Form } from "react-bootstrap";

import InputText from './InputText';
import InputBoolean from './InputBoolean';
import InputNumber from './InputNumber';
import InputList from './InputList';
import InputRef from './InputRef';
import InputImage from './InputImage';
import InputFile from './InputFile';
import InputDate from './InputDate';
import InputTime from './InputTime';

import withToast from './withToast';
import LoaderButton from "./LoaderButton";

import './EditDatasTable.css';

class EditDatasTable extends Component {
  state = {
    isLoading: false,
    fields: [], // campos de la tabla
  }

  getValue(field, values){
    const val = values.find(v => (v.field._id === field));
    return (val ? val.value : '');
  }

  arrangeFields = (props) => {
    let {values} = props.datastable;
    let {field} = props.datastable.table;
    let newState = this.state;
    newState.fields = field.map((f, i) => {
      let value = '';
      let data = '';
      switch (f.kind) {
        case 'lst':
          value = this.getValue(f._id, values);//f.value;
          data = f.value;
          break;
        case 'ref':
          value = this.getValue(f._id, values);//f.value;
          data = f.value;
          break;
        case 'img':
        case 'fle':
          data = this.getValue(f._id, values);
          value = data;
          break;
        case 'bln':
          data = this.getValue(f._id, values) === 'true';
          value = data;
          break;
        default:
          value = this.getValue(f._id, values);//f.value;
          data = '';
      }
      return {id: f._id, name: f.name, obligatory: f.obligatory, kind: f.kind, value, data}
    });
    this.setState(newState);
  }

  async componentDidMount() {
    this.arrangeFields(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    this.arrangeFields(nextProps);
  }

  isValidDate = (value) => {
    const date = value.split('-');

    if (date.length !== 3)
      return false;

    const day = parseInt(date[0], 10);
    const month = parseInt(date[1], 10);
    const year = parseInt(date[2], 10);

    if (isNaN(day)|| isNaN(month) || isNaN(year))
      return false;

    // Check the ranges of month and year
    if (year < 1900 || year > 3000 || month < 0 || month > 11)
      return false;

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
      monthLength[1] = 29;

    // Check the range of the day
    return ((day > 0) && (day <= monthLength[month]));
  }

  isValidTime = (value) => {
    const tm = value.split(':');

    // tiene mas o menos de 2 valores
    if (tm.length !== 2) return false;

    // deben ser numeros las horas y los minutos
    const hr = parseInt(tm[0], 10);
    const min = parseInt(tm[1], 10);
    if (isNaN(hr) || isNaN(min)) return false;

    // las horas deben 0 <= hr < 24
    if ((hr < 0) || (hr > 23)) return false;
    // los minutos deben 0 <= min < 60
    if ((min < 0) || (min > 59)) return false;

    return true;
  }

  validateForm() {
    let {fields} = this.state;

    let res = true;
    if (fields.length === 0) {
      res = false;
    } else {
      for(let i = 0; res && (i < fields.length); i++) {
        if (fields[i].obligatory) {
          switch (fields[i].kind) {
            case 'txt':
              if (fields[i].value.trim() === '') res = false;
              break;
            case 'bln':
              if ((fields[i].value !== true) && (fields[i].value !== false)) res = false;
              break;
            case 'num':
              if ((fields[i].value.trim() === '') || isNaN(fields[i].value)) res = false;
              break;
            case 'lst':
              if (fields[i].value.trim() === '') res = false;
              break;
            case 'img':
              if (typeof fields[i].value === 'object') {
                if (fields[i].value.type !== 'image/png') res = false;
              } else if (typeof fields[i].value === 'string'){
                if (fields[i].data === '') res = false;
              } else {
                res = false;
              }
              break;
            case 'fle':
              if (typeof fields[i].value === 'object') {
                if ((fields[i].value.type !== 'application/rar') && (fields[i].value.type !== 'application/zip')) res = false;
              } else if (typeof fields[i].value === 'string'){
                if (fields[i].data === '') res = false;
              } else {
                res = false;
              }
              break;
            case 'dte':
              if ((fields[i].value.trim() === '') || !this.isValidDate(fields[i].value)) res = false;
              break;
            case 'tme':
              if ((fields[i].value.trim() === '') || !this.isValidTime(fields[i].value)) res = false;
              break;
            case 'ref':
              if (fields[i].value.trim() === '') res = false;
              break;
            default:
              if (fields[i].value.trim() === '') res = false;
          }
        }
      }
    }
    return res;
  }

  handleChangeField = (name, value) => {
    let newState = this.state;

    for(let i = 0; i < newState.fields.length; i++) {
      if (newState.fields[i].name === name){
        newState.fields[i].value = value;
        if ((newState.fields[i].kind === 'fle') && (value === '')){
          newState.fields[i].data = '';
        }

        break;
      }
    }
    this.setState(newState);
  }

  handleSubmit = async event => {
    let newState = this.state;

    event.preventDefault();

    newState.fields.forEach((f, i) => {
      if (typeof f.values === 'string') {
        f.values = f.values.trim();
      }
    });

    this.setState(newState, () => {
      try {
        const toSave = this.state.fields.map(s => ({field: s.id, value: s.value.toString()}));
        this.props.updDatasTable({_id: this.props.datastable._id, values: toSave});
      } catch (e) {
        this.props.showError(`Error: ${e}`);
      }
    });
  }

  render() {

    const inputs = this.state.fields.map((f, i) => {
      let component = null;
      switch (f.kind) {
        case 'txt':
          component = <InputText key={i} value={f.value} onChange={this.handleChangeField} field={f.name} />
          break;
        case 'bln':
          component = <InputBoolean key={i} value={f.value} onChange={this.handleChangeField} field={f.name} />
          break;
        case 'num':
          component = <InputNumber key={i} value={f.value} onChange={this.handleChangeField} field={f.name} />
          break;
        case 'lst':
          component = <InputList key={i} value={f.value} onChange={this.handleChangeField} field={f.name} data={f.data} />
          break;
        case 'img':
          component = <InputImage key={i} value={f.value} onChange={this.handleChangeField} field={f.name} data={f.data} />
          break;
        case 'fle':
          component = <InputFile key={i} value={f.value} onChange={this.handleChangeField} field={f.name} data='' />
          break;
        case 'dte':
          component = <InputDate key={i} value={f.value} onChange={this.handleChangeField} field={f.name} />
          break;
        case 'tme':
          component = <InputTime key={i} value={f.value} onChange={this.handleChangeField} field={f.name} />
          break;
        case 'ref':
          component = <InputRef
            key={i}
            value={f.value}
            onChange={this.handleChangeField}
            field={f.name}
            data={f.data}
            refValues={this.props.refValues}

            />
        break;
        default:
          component = <InputText key={i} value={f.value} onChange={this.handleChangeField} field={f.name} />
      }
      return component;
    });

    return(
      <div className='EditDatasTable'>
        <Form onSubmit={this.handleSubmit}>

          {inputs}

          <LoaderButton
            block
            bsStyle="primary"
            bsSize="large"
            disabled={!this.validateForm()}
            type="submit"
            isLoading={this.state.isLoading}
            text="Modificar datos"
            loadingText="Modificando datos???"
          />

        </Form>
      </div>

    );
  }
}

export default withToast(EditDatasTable);
