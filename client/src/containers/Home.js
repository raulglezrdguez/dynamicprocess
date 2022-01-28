import React, { Component } from "react";
import { Link } from "react-router-dom";

import "./Home.css";

class Home extends Component {

  render() {
    let {logued} = this.props;

    let lander = logued.signedIn
              ? <div className="lander">
                  <h3>Bienvenido a la pagina de Procesos dinámicos.</h3>
                  <p>Haga clic en el botón <strong>Comenzar</strong> para trabajar con sus Procesos.</p>
                  <div>
                    <Link to="/admmodules" className="btn btn-success btn-lg">Comenzar</Link>
                  </div>
                </div>
              : <div className="lander">
                  <h3>Bienvenido a la pagina de Procesos dinámicos.</h3>
                  <p>Debe loguearse para entrar al sistema o revisar los reportes públicos.</p>
                  <div>
                    <Link to="/login" className="btn btn-primary btn-lg">Login</Link>
                    <Link to="/report" className="btn btn-success btn-lg">Reportes</Link>
                  </div>
                </div>;
    return (
      <div className="Home">
        {lander}
      </div>
    );
  }
}

export default Home;
