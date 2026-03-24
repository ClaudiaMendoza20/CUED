// PROTEGER TODAS LAS PÁGINAS
if(localStorage.getItem("login") !== "true"){
    window.location="login.html";
}

// LOGOUT GLOBAL
function logout(){
    localStorage.removeItem("login");
    window.location="login.html";
}