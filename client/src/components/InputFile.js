import React, {Component} from "react";
import { Button, Glyphicon, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import ReactDOM from 'react-dom';

import './InputFile.css';

class InputFile extends Component {
  state = {
      file: '',
      fileName: '',
      clear: false
  }

  async componentDidMount() {
    this.arrangeState(this.props.value);
  }

  async componentWillReceiveProps(nextProps) {
    this.arrangeState(nextProps.value);
  }

  arrangeState = (file) => {
    if (typeof file === 'object') {
      this.setState({
        file: file,
        fileName: file.name
      });
    } else if (file !== '') {
      this.setState({
        file: '',
        fileName: 'archivo.' + file.split('.').pop()
      }, () => {
        let file = ReactDOM.findDOMNode(this.compressFile);
        file.value = '';
      });
    } else {
      this.setState({
        file: '',
        fileName: ''
      }, () => {
        let file = ReactDOM.findDOMNode(this.compressFile);
        file.value = '';
      });
    }
  }

  handleImageChange = (e) => {
    e.preventDefault();

    let file = e.target.files[0];
    this.arrangeState(file);

    this.props.onChange(this.props.field, file);

    this.setState({clear: false});
  }

  clearFile = () => {
    this.setState({
      file: '',
      fileName: '',
      clear: true
    }, () => {
      let file = ReactDOM.findDOMNode(this.compressFile);
      file.value = '';

      this.props.onChange(this.props.field, '');
    });
  }

  render() {
    let {field, data} = this.props;
    let {fileName} = this.state;
    let filePreview = null;
    if (fileName) {
      filePreview = <p className="InputFile-name">{fileName}</p>;
    } else if (data !== '') {
      let dt = data.split(',');
      if ((dt[0] !== undefined) && (typeof dt[0] === 'string')) {
        filePreview = <p className="InputFile-name">{dt[0]}</p>;
      }
    }

    return (
      <FormGroup controlId={field}>
        <ControlLabel>{field}</ControlLabel>
        <div className="InputFile">
          <div>
            <FormControl style={{fontSize: 'calc(6px + 1vw)'}}
              ref = {compressFile => { this.compressFile = compressFile }}
              type="file"
              onChange={this.handleImageChange}
              accept=".zip,.rar"
            />
          </div>
          <div>
            {filePreview}
          </div>
          <div>
            <Button bsStyle='danger' bsSize='xsmall' onClick={this.clearFile}>Quitar <Glyphicon glyph="remove-sign"></Glyphicon></Button>
          </div>
        </div>
      </FormGroup>
    )
  }
}

export default InputFile;
