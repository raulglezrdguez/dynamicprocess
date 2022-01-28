import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import withToast from '../components/withToast';

import './InputDate.css';

class InputDate extends Component {
  state = {
      day: 1, // dia
      month: 0, // mes
      year: 1970, // año
  }

  refreshDate = (value) => {
    const date = value.split('-');
    let newState = this.state;
    if (date.length === 3) {
      newState.day = parseInt(date[0], 10);
      newState.month = parseInt(date[1], 10);
      newState.year = parseInt(date[2], 10);
    } else {
      newState.day = 1;
      newState.month = 0;
      newState.year = 1970;
    }
    this.setState(newState);
  }

  async componentDidMount() {
    this.refreshDate(this.props.value);
  }

  async componentWillReceiveProps(nextProps) {
    this.refreshDate(nextProps.value);
  }

  changeDay = (newDay) => {
    let newState = this.state;
    newState.day = newDay;
    this.setState(newState, this.updateValue);
  }

  changeMonth = (newMonth) => {
    let newState = this.state;
    newState.month = newMonth;
    this.setState(newState, this.updateValue);
  }

  changeYear = (newYear) => {
    let newState = this.state;
    newState.year = newYear;
    this.setState(newState, this.updateValue);
  }

  isValidDate = (day, month, year) => {
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

  updateValue = () => {
    let {year, month, day} = this.state;
    if (!this.isValidDate(day, month, year)) {
      this.props.showError('Fecha incorrecta');
    }
    const value = day + '-' + month + '-' + year;
    this.props.onChange(this.props.field, value);
  }

  render() {
    let {day, month, year} = this.state;
    let {field} = this.props;

    const dayOptions = [];
    for(let i = 1; i < 32; i++) dayOptions.push(<option key={i} value={i}>{i}</option>);

    const currentYear = (new Date()).getFullYear() + 5;
    const yearOptions = [];
    for(let i = 1970; i < currentYear; i++) yearOptions.push(<option key={i} value={i}>{i}</option>);

    const monthOptions = [
      <option key={0} value='0'>Enero</option>,
      <option key={1} value='1'>Febrero</option>,
      <option key={2} value='2'>Marzo</option>,
      <option key={3} value='3'>Abril</option>,
      <option key={4} value='4'>Mayo</option>,
      <option key={5} value='5'>Junio</option>,
      <option key={6} value='6'>Julio</option>,
      <option key={7} value='7'>Agosto</option>,
      <option key={8} value='8'>Septiembre</option>,
      <option key={9} value='9'>Octubre</option>,
      <option key={10} value='10'>Noviembre</option>,
      <option key={11} value='11'>Diciembre</option>];

    return (
        <FormGroup controlId={field}>
          <ControlLabel>{field}</ControlLabel>
          <div className="InputDate">
            <div>
              <FormControl
                componentClass="select"
                value={day}
                onChange={(event) => this.changeDay(event.target.value)}
              >
                {dayOptions}
              </FormControl>
            </div>

            <div>
              <FormControl
                componentClass="select"
                value={month}
                onChange={(event) => this.changeMonth(event.target.value)}
              >
                {monthOptions}
              </FormControl>
            </div>

            <div>
              <FormControl
                componentClass="select"
                value={year}
                onChange={(event) => this.changeYear(event.target.value)}
              >
                {yearOptions}
              </FormControl>
            </div>

          </div>
        </FormGroup>
    );

  }

}

export default withToast(InputDate);
