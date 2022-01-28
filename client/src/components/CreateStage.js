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

class CreateStage extends Component {

  constructor(props) {
    super(props);

    this._isMounted = false;

    this.state = {
      isLoading: false,
      thestage: null, // la etapa que hay que crear
      fields: [], // los campos de la etapa
      next: '', // la proxima etapa a la que se sigue desde esta
    }
  }

  refreshTheStage = (props) => {
    const {logued, stage} = props;
    if (logued.signedIn) {
  		fetch(`/api/getTheStage?token=${logued.token}&stage=${stage}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(thestage => {
              let newState = this.state;
              newState.thestage = thestage.stage;
              if (newState.thestage && newState.thestage.field) {
                newState.fields = newState.thestage.field.map((f, i) => {
                  let value = '';
                  let data = '';
                  switch (f.kind) {
                    case 'lst':
                      value = f.value.split(',')[0];
                      data = f.value;
                      break;
                    case 'ref':
                      value = '';
                      data = f.value;
                      break;
                    case 'dte':
                      value = '1-0-1970';
                      data = '';
                      break;
                    case 'tme':
                      value = '0:0';
                      data = '';
                      break;
                    case 'bln':
                      value = false;
                      data = false;
                      break;
                    default:
                      value = '';
                      data = '';
                  }
                  return {id: f._id, name: f.name, obligatory: f.obligatory, kind: f.kind, value, data}
                });
              }
              this._isMounted && this.setState(newState);
            });
  				} else {
            response.json().then(err => {
              props.showError(`No fue posible obtener etapa: ${err.message}`);
            })
          }
  			});
    }
  }

  async componentDidMount() {
    this._isMounted = true;
    this.refreshTheStage(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    this.refreshTheStage(nextProps);
  }

  async componentWillUnmount() {
    this._isMounted = false;
  }

  handleChange = event => {
    this._isMounted && this.setState({
      [event.target.id]: event.target.value
    });
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
        if (fields[i].obligatory){
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
              if ((typeof fields[i].value !== 'object') || (fields[i].value.type !== 'image/png')) res = false;
              break;
            case 'fle':
              if ((typeof fields[i].value !== 'object') ||
                  ((fields[i].value.type !== 'application/zip') && (fields[i].value.type !== 'application/rar'))) res = false;
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

        break;
      }
    }
    this._isMounted && this.setState(newState);
  }

  handleCreate = () => {
    let newState = this.state;

    newState.fields.forEach((f, i) => {
      if (typeof f.values === 'string') {
        f.values = f.values.trim();
      }
    });

    this._isMounted && this.setState(newState, async () => {
      let {register, stage, addDataStage} = this.props;
      let {next} = this.state;

      this._isMounted && this.setState({ isLoading: true });

      try {
        const toSave = this.state.fields.map(s => ({field: s.id, value: s.value}));
        await addDataStage({register, stage, values: toSave, next});
      } catch (e) {
        this.props.showError(`Error: ${e}`);
      }

      this._isMounted && this.setState({ isLoading: false });

    });

  }

  render() {
    let {fields, thestage, isLoading} = this.state;
    let {refValues} = this.props;

    const inputs = fields.map((f, i) => {
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
          component = <InputImage key={i} value={f.value} onChange={this.handleChangeField} field={f.name} data='' />
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
            refValues={refValues}

            />
        break;
        default:
          component = <InputText key={i} value={f.value} onChange={this.handleChangeField} field={f.name} />
      }
      return component;
    });

    let nexts = thestage ? thestage.next.map((n, i) => (
      <LoaderButton
        key={i}
        block
        bsStyle="primary"
        bsSize="small"
        onClick={() => this._isMounted && this.setState({next: n._id}, this.handleCreate)}
        disabled={!this.validateForm()}
        type="button"
        isLoading={isLoading}
        text={n.name}
        loadingText="Adicionando etapa…"
      />

    )) : null;

    if ((nexts === null) || (nexts.length === 0)) {
      nexts = <LoaderButton
        block
        bsStyle="primary"
        bsSize="small"
        onClick={() => this._isMounted && this.setState({next: null}, this.handleCreate)}
        disabled={!this.validateForm()}
        type="button"
        isLoading={isLoading}
        text='Ok'
        loadingText="Adicionando etapa…"
      />
    }

    return(
      <div className='Column Border'>
        <Form>

          {inputs}

          {nexts}

        </Form>
      </div>

    );
  }
}

export default withToast(CreateStage);
