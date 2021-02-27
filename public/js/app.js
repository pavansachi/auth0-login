let auth0 = null;

/**
 * retrieve from auth_config.json
 */
const fetchAuthConfig = () => fetch("/auth_config.json");

const configureClient = async () => {
    const response = await fetchAuthConfig();
    const config = await response.json();

    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.clientId
    });
};

window.onload = async () => {
    await configureClient();

    updateUI();

    const isAuthenticated = await auth0.isAuthenticated();
    
    if (isAuthenticated) {
        // show the gated content
        return;
    }

    const query = window.location.search;
    
    /**
     * the query parameters must be removed from the URL so that if the user refreshes the page, 
     * the app does not try to parse the state and code parameters again. 
     * This is achieved with the window.history.replaceState method.
     */
    if (query.includes("code=") && query.includes("state=")) {

        // Process the login state
        await auth0.handleRedirectCallback();

        updateUI();

        // Use replaceState to redirect the user away and remove the querystring parameters
        window.history.replaceState({}, document.title, "/");
    }
}

const updateUI = async () => {
    const isAuthenticated = await auth0.isAuthenticated();

    document.getElementById("btn-logout").disabled = !isAuthenticated;
    document.getElementById("btn-login").disabled = isAuthenticated;

    if (isAuthenticated) {
        document.getElementById("gated-content").classList.remove("hidden");

        // document.getElementById(
        //     "ipt-access-token"
        // ).innerHTML = await auth0.getTokenSilently();
        document.getElementById("ipt-user-profile").textContent = beautify(
            await auth0.getUser(), null, 2, 100
        );
        const user = await auth0.getUser()
        document.getElementById("user-img").src = await user.picture

    } else {
        document.getElementById("gated-content").classList.add("hidden");
    }
};

const login = async () => {
    await auth0.loginWithRedirect({
        redirect_uri: window.location.origin
    });
};

const logout = () => {
    auth0.logout({
        returnTo: window.location.origin
    });
};
