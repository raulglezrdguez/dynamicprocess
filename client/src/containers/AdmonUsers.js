import React, { Component } from "react";
import { Form, Checkbox } from "react-bootstrap";

import NewUser from '../components/NewUser';
import ShowUser from '../components/ShowUser';

import withToast from '../components/withToast';
import Pagination from '../components/Pagination';

import md5 from 'md5';

import './AdmonUsers.css';

class AdmonUsers extends Component {
  state = {
    users: [], // usuarios de la pagina activa
    active: true, // listar usuarios activos
    currentPage: 1, // pagina que se muestra
    items4Page: 10, // users por pagina
    itemsTotal: 0, // cantidad de users total
    newUser: false, // muestro formulario para crear nuevo usuario?
  }

  refreshUsers = () => {
    if (this.props.logued.signedIn) {
      let { items4Page, currentPage, active } = this.state;
      let skip = (currentPage - 1) * items4Page;
  		fetch(`/api/getMyUsers?token=${this.props.logued.token}&skip=${skip}&limit=${items4Page}&active=${active}`, {
  				method: 'GET',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(users => {
              let newState = this.state;
              newState.itemsTotal = users.count;
              newState.users = users.users;

              this.setState(newState, this.updPage);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible obtener usuario: ${err.message}`);
            })
          }
  			});
    }
	}

  addUser = (user) => {
    if (this.props.logued.signedIn) {
      let { name, email, password, rol, active } = user;

      return fetch('/api/addUser/', {
  				method: 'POST',
          body: JSON.stringify({
            token: this.props.logued.token,
            name: name,
            email: email,
            password: md5(password),
            rol: rol,
            active: active
          }),
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(user => {
              this.refreshUsers();
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible adicionar usuario: ${err.message}`);
            });
          }
  			});
    }
  }

  updUser = (user) => {
    if (this.props.logued.signedIn) {
      let {_id, name, email, password, rol, active} = user;
      let frnd = rol.map(f => f.id);

      let api = '/api/updUser/';
      let body = JSON.stringify({
        token: this.props.logued.token,
        id: _id,
        name: name,
        email: email,
        rol: frnd,
        active: active
      });

      if (password !== '') {
        api = '/api/updUserPass/';
        body = JSON.stringify({
          token: this.props.logued.token,
          id: _id,
          name: name,
          email: email,
          password: md5(password),
          rol: frnd,
          active: active
        });
      }

      return fetch(api, {
  				method: 'POST',
          body: body,
  				headers: { 'Content-Type': 'application/json' }
  			}).then(response => {
  				if (response.ok) {
            response.json().then(user => {
              let newState = this.state;
              for(let i = 0; i < newState.users.length; i++) {
                if (newState.users[i]._id === _id) {
                  newState.users[i].name = name;
                  newState.users[i].email = email;
                  newState.users[i].active = active;
                  newState.users[i].rol = rol;

                  break;
                }
              }
              this.setState(newState, this.refreshUsers);
            });
  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible modificar usuario: ${err.message}`);
            });
          }
  			});
    }
  }

  delUser = (_id) => {
    if (this.props.logued.signedIn) {

      return fetch(`/api/delUser/${this.props.logued.token}/${_id}`, {
  				method: 'DELETE',
  				headers: { 'Content-Type': 'application/json' },
  			}).then(response => {
  				if (response.ok) {
            response.json().then(res => {
              if (res.ok) {
                this.refreshUsers();
              } else {
                this.props.showError('No fue posible eliminar el usuario.');
              }
            });

  				} else {
            response.json().then(err => {
              this.props.showError(`No fue posible eliminar usuario: ${err.message}`);
            });
          }
  			});
    }
  }

  async componentDidMount() {
    this.refreshUsers();
  }

  changePage = (newPage) => {
    let newState = this.state;
    newState.currentPage = newPage;
    this.setState(newState, this.refreshUsers);
  }

  updPage = () => {
    let {currentPage, itemsTotal, items4Page} = this.state;
    const totalPages = Math.ceil(itemsTotal / items4Page);
    if ((currentPage !== 1) && (currentPage > totalPages)) {
      this.changePage(1);
    }
  }

  handleChangeActive = checked => {
    this.setState({active: checked}, this.refreshUsers);
  }

  handleChangeNewUser = checked => {
    this.setState({newUser: checked});
  }

  render() {
    let {users, itemsTotal, items4Page, currentPage, newUser} = this.state;

    let usersList = null;
    let usersPages = null;
    let showUsers = users.map((u, i) => (<ShowUser key={i} updUser={this.updUser} delUser={this.delUser} user={u} logued={this.props.logued}/>));
    if (itemsTotal > 0) {
      usersPages = <div>
        <p>Listado de usuarios <span className="label label-primary">{itemsTotal}</span></p>

        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
          <div className="divUsersList">
            {showUsers}
          </div>
        <Pagination onChangePage={this.changePage} totalPages={Math.ceil(itemsTotal / items4Page)} currentPage={currentPage} />
      </div>
    }
    usersList = <div className='UsersList'>
      <Form>
        <Checkbox onChange={e => this.handleChangeActive(e.target.checked)} checked={this.state.active}>Usuarios Activos</Checkbox>
      </Form>
      {usersPages}
    </div>;

    let showNewUser = newUser ? <NewUser addUser={this.addUser} logued={this.props.logued} /> : null;

    return(
        <div className='AdmonUsers'>

          {usersList}

          <div className='UsersList'>
            <Checkbox onChange={e => this.handleChangeNewUser(e.target.checked)} checked={newUser}>Crear nuevo usuario</Checkbox>

            {showNewUser}
          </div>

        </div>
    );
  }
}

export default withToast(AdmonUsers);
