import React, {Component} from "react";

import './ImportContent.css';

class ImportContent extends Component {
  state = {
    error: [], // arreglo de errores
  }

  isValidDate = (value) => {
    const date = value.split('-');

    if (date.length !== 3)
      return false;

    const day = parseInt(date[0], 10);
    const month = parseInt(date[1], 10);
    const year = parseInt(date[2], 10);

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

  isValidTime = (value) => {
    const tm = value.split(':');

    // tiene mas o menos de 2 valores
    if (tm.length !== 2) return false;

    // deben ser numeros las horas y los minutos
    const hr = parseInt(tm[0], 10);
    const min = parseInt(tm[1], 10);
    if (isNaN(hr) || isNaN(min)) return false;

    // las horas deben 0 <= hr < 24
    if ((hr < 0) || (hr > 23)) return false;
    // los minutos deben 0 <= min < 60
    if ((min < 0) || (min > 59)) return false;

    return true;
  }

  saveBulk = (toSave) => {
    let {table} = this.props;

    return fetch('/api/addBulkDatasTable/', {
        method: 'POST',
        body: JSON.stringify({
          token: this.props.logued.token,
          table: table._id,
          values: toSave
        }),
        headers: { 'Content-Type': 'application/json' }
      }).then(response => {
        if (response.ok) {
          this.props.refreshDatasTable();
        } else {
          response.json().then(err => {
            this.props.showError(`No fue posible adicionar datos: ${err.message}`);
          });
        }
      });
  }

  handleFileChosen = (file) => {
    let {table} = this.props;

    const handleFile = (e) => {
      if (table && table.field && (table.field.length > 0)) {
        const content = fileReader.result.split('\n').map(c => c.trim()).filter(c => c).map(c => c.split(',').map(c => c.trim()));
        let error = [];
        // verifico la cantidad de campos de la tabla y del fichero
        if (content[0].length === table.field.length) {
          // verifico los nombres de los campos de la tabla y del fichero
          let temp1 = content[0].join(',').toLowerCase();
          let temp2 = table.field.map(f => f.name).join(',').toLowerCase();
          if (temp1 === temp2) {
            // verifico que haya al menos un dato
            if (content.length > 1) {
              // verifico la cantidad de datos por filas
              temp1 = table.field.length;
              for(let i = 1; i < content.length; i++) {
                if (content[i].length !== temp1) {
                  error.push('La fila ' + i + ': ' + content[i].join(', ') + '; no contiene los datos correctos.');
                }
              }
              if (error.length === 0) {
                // verifico que existan los datos obligatorios
                for(let i = 0; i < table.field.length; i++) {
                  if (table.field[i].obligatory) {
                    for(let j = 1; j < content.length; j++) {
                      if (content[j][i] === '') {
                        error.push('En la fila ' + j + ' (' + content[j].join(', ') + ') falta el valor de la columna ' + (i + 1) + '.');
                      }
                    }
                  }
                }

                if (error.length === 0) {
                  // verifico que los tipos de los datos sean los correctos
                  for(let i = 0; i < table.field.length; i++) {
                    const knd = table.field[i].kind;
                    for(let j = 1; j < content.length; j++) {
                      if (knd === 'bln') {
                        if ((content[j][i] !== '') && (content[j][i] !== 'true') && (content[j][i] !== 'false')) {
                          error.push('En la fila ' + j + ' (' + content[j].join(', ') + ') el valor de la columna ' + (i + 1) + ' debe ser booleano.');
                        }
                      } else if (knd === 'num') {
                        if ((content[j][i] !== '') && isNaN(content[j][i])) {
                          error.push('En la fila ' + j + ' (' + content[j].join(', ') + ') el valor de la columna ' + (i + 1) + ' debe ser numérico.');
                        }
                      } else if (knd === 'lst') {
                        if ((content[j][i] !== '') && (table.field[i].value.split(',').map(v => v.trim()).indexOf(content[j][i]) === -1)) {
                          error.push('En la fila ' + j + ' (' + content[j].join(', ') + ') el valor de la columna ' + (i + 1) + ' debe ser uno de: ' + table.field[i].value + '.');
                        }
                      } else if (['img', 'fle', 'ref'].indexOf(knd) !== -1) {
                        if (content[j][i] !== '') {
                          error.push('En la fila ' + j + ' (' + content[j].join(', ') + ') el valor de la columna ' + (i + 1) + ' no está permitido.');
                        }

                      } else if (knd === 'dte') {
                        if ((content[j][i] !== '') && (!this.isValidDate(content[j][i]))) {
                          error.push('En la fila ' + j + ' (' + content[j].join(', ') + ') el valor de la columna ' + (i + 1) + ' debe ser una fecha (Ej: 30-1-2019).');
                        }
                      } else if (knd === 'tme') {
                        if ((content[j][i] !== '') && (!this.isValidTime(content[j][i]))) {
                          error.push('En la fila ' + j + ' (' + content[j].join(', ') + ') el valor de la columna ' + (i + 1) + ' debe ser una hora (Ej: 14:45).');
                        }
                      }
                    }
                  }

                  if (error.length === 0) {
                    let toSave = [];
                    for(let i = 1; i < content.length; i++) {
                      let innerArray = [];
                      for(let j = 0; j < table.field.length; j++) {
                        innerArray.push({field: table.field[j]._id, value: content[i][j]});
                      }
                      toSave.push(innerArray);
                    }
                    this.saveBulk(toSave);
                  }

                }

              }

            } else {
              error.push('No hay datos que importar.');
            }
          } else {
            error.push('No coinciden los nombres de los campos de la tabla y del fichero:');
            error.push('Campos de la tabla: ' + table.field.map(f => f.name).join(', ') + '.');
            error.push('Campos del fichero: ' + content[0].join(', ') + '.');
          }
        } else {
          error.push('No coincide la cantidad de campos de la tabla y del fichero:');
          error.push('Campos de la tabla: ' + table.field.map(f => f.name).join(', ') + '.');
          error.push('Campos del fichero: ' + content[0].join(', ') + '.');
        }
        this.setState({error});
      }
    }

    let fileReader = new FileReader();
    fileReader.onloadend = handleFile;
    fileReader.readAsText(file);
  }

  render() {
    let {error} = this.state;

    let errorList = null;
    if (error.length > 0) {
      let errorInner = error.map((e, i) => (<p key={i}>{e}</p>));
      errorList = <div className="ImportContentError"><p><strong>Error</strong>:</p>{errorInner}</div>;
    }

    return (
      <div className="ImportContent">
        <p>Importar .csv</p>
        <input type="file" id="file"
          accept=".csv"
          onChange={e => this.handleFileChosen(e.target.files[0])} />
        {errorList}
      </div>
    );
  }

}

export default ImportContent;
