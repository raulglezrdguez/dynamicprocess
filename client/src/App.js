import React, { Component } from 'react';
import { Link, withRouter } from "react-router-dom";

import {Nav, Navbar, NavDropdown, MenuItem} from 'react-bootstrap';

import Routes from "./Routes";
import RouteNavItem from "./components/RouteNavItem";

import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    logued: {
      signedIn: false,
      owner: '',
      name: '',
      email: '',
      token: '',
      rol: [],
      id: ''
    },
  }

  redirectUser = () => {
    // this.props.history.push("/admmodules");
    this.props.history.push("/admdatastage");
  }

  onSignin = data => {
		// let logued = { signedIn: true, owner: data.owner, name: data.name, email: data.email, token: data.token, rol: data.rol };
		let logued = { signedIn: true, name: data.name, email: data.email, token: data.token, rol: data.rol };
		this.setState({ logued }, this.redirectUser );
	}

  onSignout = () => {
		fetch(`/api/signout/${this.state.logued.token}`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
			}).then(response => {
				if (response.ok) {
					this.setState({ logued: { signedIn: false, owner: '', name: '', email: '', token: '', rol: [], id: '' } }, () => {
						this.props.history.push("/login");
					});
				}
			});
	}


  render() {
    let { logued } = this.state;

    const childProps = {
      logued: logued,
			onSignin: this.onSignin,
			onSignout: this.onSignout
    };

    const currentYear = new Date().getFullYear();

    let menu = <Nav>
      <NavDropdown title='Publico' id="public-dropdown">
        <MenuItem eventKey={2} onClick={() => this.props.history.push("/admpubdata")}>Tablas</MenuItem>
      </NavDropdown>
    </Nav>;
    let userMenu = <RouteNavItem eventKey={1} href="/login">Login</RouteNavItem>;
    // let userMenu = <NavItem eventKey={1}><Link to="/login">Login</Link></NavItem>;
    // let userMenu = <NavItem eventKey={1} href="/login">Login</NavItem>;
    if (this.state.logued.signedIn) {
      menu = <Nav>
        <NavDropdown title='Administración' id="admon-dropdown">
          <MenuItem eventKey={2} onClick={() => this.props.history.push("/admmodules")}>Modulos</MenuItem>
          <MenuItem eventKey={3} onClick={() => this.props.history.push("/admroles")}>Roles</MenuItem>
          <MenuItem eventKey={4} onClick={() => this.props.history.push("/admtables")}>Tablas</MenuItem>
          <MenuItem eventKey={5} onClick={() => this.props.history.push("/admprocess")}>Procesos</MenuItem>
          <MenuItem divider />
          <MenuItem eventKey={6} onClick={() => this.props.history.push("/admusers")}>Usuarios</MenuItem>
          <MenuItem eventKey={7} onClick={() => this.props.history.push("/admotheruser")}>Otros usuarios</MenuItem>
        </NavDropdown>
        <NavDropdown title='Datos' id="data-dropdown">
          <MenuItem eventKey={8} onClick={() => this.props.history.push("/admdatatable")}>Tablas</MenuItem>
          <MenuItem eventKey={9} onClick={() => this.props.history.push("/admdatastage")}>Procesos</MenuItem>
        </NavDropdown>
        <NavDropdown title='Publico' id="public-dropdown">
          <MenuItem eventKey={10} onClick={() => this.props.history.push("/admpubdata")}>Tablas</MenuItem>
        </NavDropdown>
      </Nav>;
      userMenu = <NavDropdown title={this.state.logued.name} id="user-dropdown">
				<MenuItem eventKey={1} onClick={() => this.props.history.push("/changepass")}>Cambiar contraseña</MenuItem>
				<MenuItem eventKey={2} onClick={this.onSignout}>Salir</MenuItem>
			</NavDropdown>;
    }

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
        </header>

        <div className='App container'>
          <Navbar inverse fluid collapseOnSelect>
            <Navbar.Header>
              <Navbar.Brand>
                <Link to="/">Inicio</Link>
              </Navbar.Brand>
              <Navbar.Toggle />
            </Navbar.Header>
            <Navbar.Collapse>
              {menu}
              <Nav pullRight>
                {userMenu}
              </Nav>
            </Navbar.Collapse>
          </Navbar>
        </div>

        <div >
          <Routes childProps={childProps} />
        </div>

        <div className="App-footer">
          <p>Joven Club &copy; {currentYear}</p>
        </div>

      </div>
    );
  }
}

export default withRouter(App);
