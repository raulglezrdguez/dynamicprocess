import React from "react";
import { Checkbox } from "react-bootstrap";

const InputBoolean = (props) => {
  return (
    <Checkbox
      onChange={e => props.onChange(props.field, e.target.checked)}
      checked={props.value === true}>{props.field}
    </Checkbox>
  );
}

export default InputBoolean;
