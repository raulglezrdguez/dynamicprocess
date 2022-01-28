import React, { Component } from "react";
import { Form, FormGroup, FormControl, Button, Glyphicon } from "react-bootstrap";

import FileSaver from 'file-saver';

import withToast from '../components/withToast';

class SaveStagesContent extends Component {
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

  valuesFind(id, values) {
    let val = values.find(v => v.field._id === id);
    if (val) {
      if (val.field.kind === 'ref') return this.getRefValue(val.field.value, val.value);
      else return val.value;
    } else {
      return '';
    }
  }

  save = (content) => {
    const {fileName} = this.state;

console.log(content);

    if (content.length > 0) {
      const stages = content.sort((a, b) => (b.stages.length - a.stages.length));
      let fields = [];
      stages.forEach(s1 => {
        let fld1 = [];
        let values = [];
        s1.stages.forEach(s2 => {
          s2.stage.field.forEach(f => fld1.push(f));
          s2.values.forEach(v => values.push(v));
        });
        if (fields.length === 0) {
          fields.push({fields: fld1, values: [values]});
        } else {
          let contains = false;
          let i = 0;
          while(!contains && (i < fields.length)) {
            for(let j = 0; j < fld1.length; j++) {
              if (!fields[i].fields[j] || !fld1[j] || (fields[i].fields[j]._id !== fld1[j]._id)) {
                break;
              } else if (j === fld1.length - 1) {
                contains = true;

                fields[i].values.push(values);

                break;
              }
            }
            i++;
          }
          if (!contains) {
            fields.push({fields: fld1, values: [values]});
          }
        }
      });

      let lines = '';
      let ids = [];
      fields.forEach((f, sheet) => {
        ids = f.fields.map(fld => fld._id);
        lines += f.fields.map(fld => fld.name).join('|');
        f.values.forEach((v, i) => {
          lines += '\r\n';
          lines += ids.map(id => this.valuesFind(id, v)).join('|');
        });

        lines += '\r\n\r\n\r\n';
      });

      let blob = new Blob([lines], {type: "text/plain;charset=utf-8"});
      FileSaver.saveAs(blob, fileName + '.csv');

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
          let {process} = this.props;

      		fetch(`/api/getDatasStage?token=${logued.token}&process=${process}`, {
      				method: 'GET',
      				headers: { 'Content-Type': 'application/json' },
      			}).then(response => {
      				if (response.ok) {
                response.json().then(stages => {
                  this.save(stages.stages);
                });
      				} else {
                response.json().then(err => {
                  this.props.showError(`No fue posible obtener etapas: ${err.message}`);
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
      <div className="Row Border">
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

export default withToast(SaveStagesContent);
