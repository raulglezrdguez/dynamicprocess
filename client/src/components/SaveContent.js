import React, { Component } from "react";
import { Form, FormGroup, FormControl, Button, Glyphicon } from "react-bootstrap";

import FileSaver from 'file-saver';

import withToast from '../components/withToast';

import './SaveContent.css';

class SaveContent extends Component {
  state = {
    fileName: 'datos', // nombre del fichero
    saveAll: '0', // guardo todo el contenido (1) o la página activa (0)
  }

  handleChange = event => {
    this.setState({[event.target.id]: event.target.value});
  }

  getRefValue = (tableField, ref) => {
    let result = 'No encontrado';
    let {refValues} = this.props;
    const tfSplit = tableField.split(',');

    const rv = refValues.find(r => ((r.table === tfSplit[0]) && (r.field === tfSplit[1])));
    if (rv) {
      const val = rv.values.find(v => (v.id === ref));
      if (val) result = val.value;
    }

    return result;
  }

  save = (content) => {
    const {fileName} = this.state;

    if (content.length > 0) {
      let fields = [];
      fields = content[0].table.field.map(f => f.name);

      let values = content.map(c => {
          let val = {};
          c.values.forEach(v => {
            if (v.field.kind === 'ref') val[v.field.name] = this.getRefValue(v.field.value, v.value);
            else val[v.field.name] = v.value;
          });
          return val;
        }
      );
      let lines = fields.join(',');
      values.forEach(v => {
        lines += '\r\n';
        fields.forEach((f, i) => {
          if (i === 0) lines += v[f];
          else lines += ',' + v[f];
        });
      });

      let blob = new Blob([lines], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, fileName+'.csv');
    }

  }

  saveSubmit = async event => {
    event.preventDefault();

    const {saveAll} = this.state;
    const {logued, content} = this.props;

    if (content.length > 0) {
      if (saveAll === '0') {
        this.save(content);
      } else {
        if (logued.signedIn) {
          const tableId = content[0].table._id;

      		fetch(`/api/getDatasTable?token=${logued.token}&table=${tableId}`, {
      				method: 'GET',
      				headers: { 'Content-Type': 'application/json' },
      			}).then(response => {
      				if (response.ok) {
                response.json().then(datas => {
                  this.save(datas.datas);
                });
      				} else {
                response.json().then(err => {
                  this.props.showError(`No fue posible obtener datos: ${err.message}`);
                })
              }
      			});
        }
      }
    }
  }

  render() {
    const { saveAll, fileName } = this.state;

    return(
      <div className="SaveContent">
        <Form inline onSubmit={this.saveSubmit}>
          <Button type="submit" className='btn-primary' disabled={fileName.trim()===''}><Glyphicon glyph="briefcase"></Glyphicon> Exportar</Button>{' '}
          <FormGroup controlId="saveAll">
            <FormControl
              componentClass="select"
              value={saveAll}
              onChange={this.handleChange}
            >
              <option value='0'>Esta página</option>
              <option value='1'>Todo</option>
            </FormControl>
          </FormGroup>
          <FormGroup controlId="fileName">
            <FormControl
              type="text"
              value={fileName}
              onChange={this.handleChange}
              placeholder="nombre del fichero" />
          </FormGroup>
        </Form>
      </div>
    );

  }
}

export default withToast(SaveContent);
