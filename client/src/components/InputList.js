import React from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

const InputList = (props) => {
  let options = props.data.split(',').map((l, i) => (<option key={i} value={l.trim()}>{l.trim()}</option>));

  return(
    <FormGroup controlId={props.field}>
      <ControlLabel>{props.field}</ControlLabel>
      <FormControl
        componentClass='select'
        value={props.value}
        onChange={(event) => props.onChange(props.field, event.target.value)}
      >
      {options}
      </FormControl>
    </FormGroup>
  );
}

export default InputList;
