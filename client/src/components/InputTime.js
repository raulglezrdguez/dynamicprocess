import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

import './InputTime.css';

class InputTime extends Component {
  state = {
      hour: 0, // hora
      minute: 1, // minuto
  }

  refreshTime = (value) => {
    const time = value.split(':');
    let newState = this.state;
    if (time.length === 2) {
      newState.hour = parseInt(time[0], 10);
      newState.minute = parseInt(time[1], 10);
    } else {
      newState.hour = 0;
      newState.minute = 1;
    }
    this.setState(newState);
  }

  async componentDidMount() {
    this.refreshTime(this.props.value);
  }

  async componentWillReceiveProps(nextProps) {
    this.refreshTime(nextProps.value);
  }

  changeHour = (newHour) => {
    let newState = this.state;
    newState.hour = newHour;
    this.setState(newState, this.updateValue);
  }

  changeMinute = (newMinute) => {
    let newState = this.state;
    newState.minute = newMinute;
    this.setState(newState, this.updateValue);
  }

  updateValue = () => {
    let {hour, minute} = this.state;
    const value = hour + ':' + minute;
    this.props.onChange(this.props.field, value);
  }

  render() {
    let {hour, minute} = this.state;
    let {field} = this.props;

    const hourOptions = [];
    for(let i = 0; i < 24; i++) hourOptions.push(<option key={i} value={i}>{i}</option>);

    const minuteOptions = [];
    for(let i = 0; i < 60; i++) minuteOptions.push(<option key={i} value={i}>{i}</option>);

    return (
        <FormGroup controlId={field}>
          <ControlLabel>{field}</ControlLabel>
          <div className="InputTime">
            <div>
              <FormControl
                componentClass="select"
                value={hour}
                onChange={(event) => this.changeHour(event.target.value)}
              >
                {hourOptions}
              </FormControl>
            </div>

            <div>
              <FormControl
                componentClass="select"
                value={minute}
                onChange={(event) => this.changeMinute(event.target.value)}
              >
                {minuteOptions}
              </FormControl>
            </div>
          </div>
        </FormGroup>
    );

  }

}

export default InputTime;
