"use strict";

const PRODUCTION_URL = "https://www.openstreetmap.org";
const DEVELOPMENT_URL = "https://master.apis.dev.openstreetmap.org";
const REDIRECT_PATH = window.location.origin + window.location.pathname;

const $ = document.querySelector.bind(document);

const productionRadio = $("#production");
const developmentRadio = $("#development");

const redirectUri = $("#redirectUri");

const oauth2Url = $("#oauth2url");

const tabsContainer = $("#tabsContainer");

const messageModal = $("#messageModal");
const messageModalTitle = $("#messageModalTitle");
const messageModalContent = $("#messageModalContent");

const scopesCheckboxes = [
  $("#read_prefs"),
  $("#write_prefs"),
  $("#write_diary"),
  $("#write_api"),
  $("#read_gpx"),
  $("#write_gpx"),
  $("#write_notes"),
  $("#write_redactions"),
  $("#openid"),
];

const clientId = $("#clientId");

function getToken() {
  let scope = "";
  scopesCheckboxes.forEach((s) => {
    if (s.checked) {
      scope += s.id + " ";
    }
  });
  scope = scope.slice(0, -1);
  if (!clientId.value) {
    alert("Please provide client ID.");
    return;
  }
  if (!scope) {
    alert("Please select scopes.");
    return;
  }

  const url = productionRadio.checked ? PRODUCTION_URL : DEVELOPMENT_URL;

  const auth = osmAuth.osmAuth({
    url: url,
    client_id: clientId.value,
    redirect_uri: REDIRECT_PATH,
    scope: scope,
    singlepage: true,
  });

  localStorage.setItem("serverUrl", url);
  localStorage.setItem("clientId", clientId.value);
  localStorage.setItem("scope", scope);

  auth.authenticate();
}

function main() {
  resize();
  redirectUri.innerText = REDIRECT_PATH;

  const serverUrl = localStorage.getItem("serverUrl");

  const auth = osmAuth.osmAuth({
    url: serverUrl,
    client_id: localStorage.getItem("clientId"),
    redirect_uri: REDIRECT_PATH,
    scope: localStorage.getItem("scope"),
    singlepage: true,
  });

  const code = window.location.search
    .slice(1)
    .split("&")[0]
    .replace("code=", "");

  if (code && code != "error=access_denied") {
    // Recived code - get access token
    auth.authenticate(() => {
      window.location.href = REDIRECT_PATH;
    });
  } else if (auth.authenticated()) {
    // Recived access token - display it to user
    messageModalTitle.innerText = "Your token"
    messageModalContent.innerText = localStorage.getItem(
      serverUrl + "oauth2_" + "access_token"
    );
    messageModal.checked = true;
    auth.logout();
  }
}

function resize() {
  if (window.innerWidth < 900) {
    tabsContainer.classList.remove("two");
  } else {
    tabsContainer.classList.add("two");
  }
}

function about() {
  messageModalTitle.innerText = "About"
    messageModalContent.innerHTML = `This tool allows you to obtain the bearer access token needed to perform most 
    <a href="https://openstreetmap.org" target="_blank">openstreetmap</a> api requests authorised by the
    <a href="https://oauth.net/2/" target="_blank">oAuth2</a> standard.
    <br /> <br />
    All your data is stored only in your browser. The access token is deleted from memory after being displayed. During authentication, you connect directly to the OpenStreetMap servers. 
    <br /> <br />
    If your token is not displayed after all the steps make sure that your application is <strong>NOT</strong> marked as confidential.
    <br /> <br />
    Provided by <a href="https://interactivemaps.xyz" target="_blank">Interactive Maps</a>.`
    messageModal.checked = true;
}

window.addEventListener("resize", resize);

productionRadio.addEventListener("change", () => {
  oauth2Url.setAttribute("href", PRODUCTION_URL + "/oauth2/applications");
});
developmentRadio.addEventListener("change", () => {
  oauth2Url.setAttribute("href", DEVELOPMENT_URL + "/oauth2/applications");
});

main();
