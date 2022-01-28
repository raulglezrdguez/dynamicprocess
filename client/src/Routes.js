import React from "react";
import { Route, Switch } from "react-router-dom";
import asyncComponent from "./components/AsyncComponent";
import AppliedRoute from "./components/AppliedRoute";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import UnauthenticatedRoute from "./components/UnauthenticatedRoute";

const AsyncHome = asyncComponent(() => import("./containers/Home"));
const AsyncLogin = asyncComponent(() => import("./containers/Login"));
const AsyncChangePass = asyncComponent(() => import("./containers/ChangePass"));
const AsyncAdmonModules = asyncComponent(() => import("./containers/AdmonModules"));
const AsyncAdmonRoles = asyncComponent(() => import("./containers/AdmonRoles"));
const AsyncAdmonUsers = asyncComponent(() => import("./containers/AdmonUsers"));
const AsyncAdmonOtherUser = asyncComponent(() => import("./containers/AdmonOtherUser"));
const AsyncAdmonTables = asyncComponent(() => import("./containers/AdmonTables"));
const AsyncAdmonDataTable = asyncComponent(() => import("./containers/AdmonDataTable"));
const AsyncAdmonDataStage = asyncComponent(() => import("./containers/AdmonDataStage"));
const AsyncAdmonPublicData = asyncComponent(() => import("./containers/AdmonPublicData"));
const AsyncAdmonProcess = asyncComponent(() => import("./containers/AdmonProcess"));

// const AsyncAdmonForms = asyncComponent(() => import("./containers/AdmonForms"));
// const AsyncClient = asyncComponent(() => import("./containers/Client"));
// const AsyncAdmon = asyncComponent(() => import("./containers/Admon"));
// const AsyncReport = asyncComponent(() => import("./containers/Report"));

const AsyncNotFound = asyncComponent(() => import("./components/NotFound"));

export default ({ childProps }) =>
  <Switch>
    <AppliedRoute path="/" exact component={AsyncHome} props={childProps} />
    <UnauthenticatedRoute path="/login" exact component={AsyncLogin} props={childProps} />
    <AuthenticatedRoute path="/changepass" exact component={AsyncChangePass} props={childProps} />
    <AuthenticatedRoute path="/admmodules" exact component={AsyncAdmonModules} props={childProps} />
    <AuthenticatedRoute path="/admroles" exact component={AsyncAdmonRoles} props={childProps} />
    <AuthenticatedRoute path="/admusers" exact component={AsyncAdmonUsers} props={childProps} />
    <AuthenticatedRoute path="/admotheruser" exact component={AsyncAdmonOtherUser} props={childProps} />
    <AuthenticatedRoute path="/admtables" exact component={AsyncAdmonTables} props={childProps} />
    <AuthenticatedRoute path="/admdatatable" exact component={AsyncAdmonDataTable} props={childProps} />
    <AuthenticatedRoute path="/admdatastage" exact component={AsyncAdmonDataStage} props={childProps} />
    <UnauthenticatedRoute path="/admpubdata" exact component={AsyncAdmonPublicData} props={childProps} />
    <AuthenticatedRoute path="/admprocess" exact component={AsyncAdmonProcess} props={childProps} />

    { /* Finally, catch all unmatched routes */ }
    <Route component={AsyncNotFound} />
  </Switch>;


/*


<AuthenticatedRoute path="/client" exact component={AsyncClient} props={childProps} />
<AuthenticatedRoute path="/adm" exact component={AsyncAdmon} props={childProps} />
<AuthenticatedRoute path="/admforms" exact component={AsyncAdmonForms} props={childProps} />
<UnauthenticatedRoute path="/report" exact component={AsyncReport} props={childProps} />

*/
