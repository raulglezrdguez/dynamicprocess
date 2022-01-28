import React, { Component } from "react";
import { FormGroup, FormControl, ControlLabel } from "react-bootstrap";

// import withToast from '../components/withToast';

class InputRef extends Component {
  state = {
    items: [], // items a mostrar en la forma {id, value}
  }

  setFirstItem = (props) => {
    let {items} = this.state;
    let {field, value} = props;
    let change = true;
    if (value !== '') {
      for(let i = 0; i < items.length; i++) {
        if (items[i].id === value) {
          change = false;

          break;
        }
      }
    }
    if (change && items && (items.length > 0) && field ) {
      this.props.onChange(field, items[0].id);
    }
  }

  refreshItems = (props) => {
    let {data, refValues} = props;
    let result = null;
    const dataSplit = data.split(',');

    for(let i = 0; i < refValues.length; i++) {
      if ((refValues[i].table === dataSplit[0]) && (refValues[i].field === dataSplit[1])){
        result = refValues[i].values;
        break;
      }
    }

    if (result !== null) {
      let newState = this.state;
      newState.items = result;
      this.setState(newState, () => this.setFirstItem(props));
    }
    // else {
    //   this.props.refreshRefValues(data);
    // }


  }

  async componentDidMount() {
    this.refreshItems(this.props);
  }

  async componentWillReceiveProps(nextProps) {
    // if (this.props.data !== nextProps.data) {
      this.refreshItems(nextProps);
    // } else if (nextProps.value === '') {
    //   this.setFirstItem(nextProps);
    // }
  }

  render() {
    let props = this.props;
    let options = this.state.items.map((opt, i) => (<option key={i} value={opt.id}>{opt.value}</option>));

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
}

export default InputRef;
// export default withToast(InputRef);
