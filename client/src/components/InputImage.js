import React, {Component} from "react";
import { Button, Glyphicon, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import ReactDOM from 'react-dom';

import './InputImage.css';

class InputImage extends Component {
  state = {
      file: '',
      imagePreviewUrl: '',
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
      let reader = new FileReader();

      reader.onloadend = () => {
        this.setState({
          file: file,
          imagePreviewUrl: reader.result
        });
      }

      reader.readAsDataURL(file);
    } else if (this.props.data !== '') {
      let src = process.env.PUBLIC_URL + '/dyimages/thumbnails/' + this.props.data + '?id=' + new Date().getTime();
      this.setState({imagePreviewUrl: src});
    } else {
      this.setState({
        file: '',
        imagePreviewUrl: '',
      }, () => {
        let image = ReactDOM.findDOMNode(this.image);
        image.value = '';
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

  clearImage = () => {
    this.setState({
      file: '',
      imagePreviewUrl: '',
      clear: true
    }, () => {
      let image = ReactDOM.findDOMNode(this.image);
      image.value = '';

      this.props.onChange(this.props.field, '');
    });
  }

  render() {
    let {field, data} = this.props;
    let {clear, imagePreviewUrl} = this.state;
    let imagePreview = null;
    if (!clear){
      if (imagePreviewUrl) {
        imagePreview = <img src={imagePreviewUrl} alt='preview' className='imgThumb' />;
        } else if (data !== '') {
          let src = process.env.PUBLIC_URL + '/dyimages/thumbnails/' + data + '?tm=' + new Date().getTime();;
          imagePreview = <img src={src} alt='preview' className='imgThumb' />;
        }
    }

    return (
      <FormGroup controlId={field}>
        <ControlLabel>{field}</ControlLabel>

        <div className="InputImage">
          <div>
            <FormControl style={{fontSize: 'calc(6px + 1vw)'}}
              ref = {image => { this.image = image }}
              type="file"
              onChange={this.handleImageChange}
              accept=".png"
            />
          </div>
          <div>
            {imagePreview}
          </div>
          <div>
            <Button bsStyle='danger' bsSize='xsmall' onClick={this.clearImage}>Quitar <Glyphicon glyph="remove-sign"></Glyphicon></Button>
          </div>
        </div>

      </FormGroup>
    )
  }
}

export default InputImage;
