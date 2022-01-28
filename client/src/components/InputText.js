import React from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

const InputText = (props) => {
  return(
    <FormGroup controlId={props.field}>
      <ControlLabel>{props.field}</ControlLabel>
      <FormControl
        type="text"
        value={props.value}
        onChange={(event) => props.onChange(props.field, event.target.value)}
      />
    </FormGroup>
  );
}

export default InputText;
