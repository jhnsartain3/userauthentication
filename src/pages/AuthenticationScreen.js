import React, {Component} from "react";
import AccessApiWrapper from "../http/AccessApiWrapper";
import '../css/signin.css'
import TextField from '@material-ui/core/TextField';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

class AuthenticationScreen extends Component {
    constructor(props) {
        super(props);

        let currentPage = window.location.href;
        if (!currentPage.includes('/login') && !currentPage.includes('/signup'))
            window.location.href = currentPage + 'login'

        let username = "";
        let password = "";

        let buttonText = "";
        let alternativeActionLinkText = "";
        let alternativeActionLink = "";
        let userWantsToLogin;

        if (localStorage.getItem('userWantsToBeRemembered')) {
            username = localStorage.getItem('username');
            password = localStorage.getItem('password');
        }

        if (currentPage.includes('/login')) {
            buttonText = "Login";
            alternativeActionLinkText = "Don't have an account? Sign Up";
            userWantsToLogin = true;
            alternativeActionLink = "/signup";
        } else if (currentPage.includes('/signup')) {
            buttonText = "Create Account";
            alternativeActionLinkText = "Already have an account? Login";
            userWantsToLogin = false;
            alternativeActionLink = "/login";
        } else {
            buttonText = "Login";
            alternativeActionLinkText = "Don't have an account? Sign Up";
            userWantsToLogin = true;
            alternativeActionLink = "/signup";
        }

        this.state = {
            username: username,
            password: password,
            buttonText: buttonText,
            alternativeActionLinkText: alternativeActionLinkText,
            userWantsToLogin: userWantsToLogin,
            accountWasCreatedSuccessfully: false,
            isUsernameFieldValid: true,
            helperTextUsernameField: '',
            helperTextPasswordField: '',
            isPasswordFieldValid: true,
            rememberMeChecked: true,
            alternativeActionLink: alternativeActionLink
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleRememberMeClicked = this.handleRememberMeClicked.bind(this);
        this.forgotPassword = this.forgotPassword.bind(this);
        this.resetFields = this.resetFields.bind(this);
        this.onChange = this.onChange.bind(this);
        this.checkResultsForCredentialsErrors = this.checkResultsForCredentialsErrors.bind(this);
        this.checkForMessages = this.checkForMessages.bind(this);
    }

    handleLogin = async event => {
        window.location.href = window.location.href + "/login"
    }

    handleSubmit = async event => {
        let currentPage = window.location.href;

        this.resetFields()

        if (currentPage.includes('/login')) {
            this.login();
        } else if (currentPage.includes('/signup')) {
            this.createAccount();
        } else {
            this.login();
        }
    }

    onChange = async event => {
        this.setState(
            {
                [event.target.name]: event.target.value
            }
        )
    };

    login() {
        console.log("Attempting login");
        let userCredentials = this.getUserCredentials();

        let accessApiWrapperAuthentication = new AccessApiWrapper('AuthenticationApi');

        accessApiWrapperAuthentication.postData('/api/authentication/GetAuthenticationToken', userCredentials).then((result) => {
            if (result.token === undefined || result.token === null || result.token.length < 100) {
                console.log("Token was not returned, login failed");

                this.checkForMessages(result);

                this.checkResultsForCredentialsErrors(result);
            }
            if (result.token.length > 100) {
                console.log("No errors detected, proceeding to login")

                let dataToSend = {token: result};

                this.saveCredentialsToLocalStorage();

                window.parent.postMessage(dataToSend, "*");
            } else
                console.log("Login failed for unknown reason");
        }).catch((error) => {
            console.log("Failed to send token to client");
            console.log(error);
        });
    }

    createAccount() {
        console.log("Attempting Account Creation");
        let userCredentials = this.getUserCredentials();

        let accessApiWrapperUsers = new AccessApiWrapper('UsersApi');

        accessApiWrapperUsers.postData('/api/user', userCredentials).then((result) => {
                console.log(result);

                if (result.id === undefined || result.id === null || result.id.length < 5) {
                    console.log("Id was not returned, account creation failed");

                    this.checkForMessages(result);

                    this.setState({accountWasCreatedSuccessfully: false});

                    this.checkResultsForCredentialsErrors(result);
                } else {
                    if (result.id.length > 5) {
                        console.log("No errors detected, proceeding to login")
                        this.setState({accountWasCreatedSuccessfully: true})
                        this.saveCredentialsToLocalStorage();
                    } else {
                        console.log('id was less than 5 characters')
                        this.setState({accountWasCreatedSuccessfully: false})
                    }
                }
            }
        ).catch((error) => {
            console.log(error)
            this.setState({accountWasCreatedSuccessfully: false})
        });
    }

    resetFields() {
        this.setState({
            isUsernameFieldValid: true,
            helperTextUsernameField: null,
            isPasswordFieldValid: true,
            helperTextPasswordField: null
        });
    }

    checkResultsForCredentialsErrors(result) {
        if (result.errors !== undefined || result.errors !== null) {
            console.log("Errors exist")

            if (result.errors.Username !== undefined && result.errors.Username !== null) {
                console.log("Error(s) with the username");

                if (result.errors.Username[0].includes('must be a string or array type with a minimum length')) {
                    this.setState({
                        isUsernameFieldValid: false,
                        helperTextUsernameField: '* ' + 'Minimum length of 3 characters'
                    });
                } else {
                    this.setState({
                        isUsernameFieldValid: false,
                        helperTextUsernameField: '* ' + result.errors.Username[0]
                    });
                }
            }

            if (result.errors.Password !== undefined && result.errors.Password !== null) {
                console.log("Error(s) with the password");

                if (result.errors.Password[0].includes('must be a string or array type with a minimum length')) {
                    this.setState({
                        isPasswordFieldValid: false,
                        helperTextPasswordField: '* ' + 'Minimum length of 8 characters'
                    });
                } else {
                    this.setState({
                        isPasswordFieldValid: false,
                        helperTextPasswordField: '* ' + result.errors.Password[0]
                    });
                }
            }
        }
    }

    checkForMessages(result) {
        if (result.Message !== null && result.Message !== undefined) {
            if (result.Message.includes('value is already in use')) {
                console.log('value is already in use');
                this.setState({
                    isUsernameFieldValid: false,
                    helperTextUsernameField: 'Username is already taken'
                });
            } else console.log(result.Message)
        }
    }

    getUserCredentials() {
        return {
            "username": this.state.username,
            "password": this.state.password
        }
    }

    saveCredentialsToLocalStorage() {
        console.log("Should credentials be saved to localstorage?")
        if (this.state.rememberMeChecked) {
            localStorage.setItem('userWantsToBeRemembered', this.state.rememberMeChecked)
            localStorage.setItem('username', this.state.username);
            localStorage.setItem('password', this.state.password);
            console.log("Credentials were saved to localstorage")
        } else console.log("Credentials will not be saved to localstorage")
    }

    forgotPassword() {
        alert("Please send an email to jhnsartain3@gmail.com")
    }

    handleRememberMeClicked() {
        this.setState({rememberMeChecked: !this.state.rememberMeChecked})
    }

    render() {
        return (
            <div>
                <div className="alert alert-success" role="alert"
                     style={{display: this.state.accountWasCreatedSuccessfully ? "block" : "none"}}>
                    Account was created successfully <input type="button" className="btn btn-link" value="Login"
                                                            onClick={this.handleLogin}/>
                </div>

                <Container component="main" maxWidth="xs">
                    <div>
                        <div style={{justifyContent: "center", display: "flex"}}>
                            <Avatar style={{backgroundColor: '#FD0054'}}>
                                <LockOutlinedIcon/>
                            </Avatar></div>
                        <div className="mt-2" style={{justifyContent: "center", display: "flex"}}>
                            <Typography component="h1" variant="h5">
                                Sign in
                            </Typography>
                        </div>
                        <div>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                value={this.state.username}
                                error={!this.state.isUsernameFieldValid}
                                fullWidth
                                id="username"
                                helperText={this.state.helperTextUsernameField}
                                onChange={this.onChange}
                                label="Username"
                                name="username"
                                autoComplete="username"
                                autoFocus
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                helperText={this.state.helperTextPasswordField}
                                fullWidth
                                value={this.state.password}
                                onChange={this.onChange}
                                error={!this.state.isPasswordFieldValid}
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary"
                                                   checked={this.state.rememberMeChecked}
                                                   onClick={this.handleRememberMeClicked}/>}
                                label="Remember me"
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                color="primary"
                                onClick={this.handleSubmit}
                            >{this.state.buttonText}</Button>
                            <Grid container className="mt-3">
                                <Grid item xs>
                                    <Link href="mailto:jhnsartain3@gmail.com" variant="body2"
                                          onClick={this.forgotPassword}>Forgot password?</Link>
                                </Grid>
                                <Grid item>
                                    <Link variant="body2"
                                          href={this.state.alternativeActionLink}>{this.state.alternativeActionLinkText}</Link>
                                </Grid>
                            </Grid>
                        </div>
                    </div>
                    <Box mt={8}>
                        <Typography variant="body2" color="textSecondary" align="center">
                            {'© ' + new Date().getFullYear() + ' - '}
                            <Link color="inherit" href="https://sartainstudios.com/">Sartain Studios</Link>
                        </Typography>
                    </Box>
                </Container>
            </div>
        );
    }
}

export default AuthenticationScreen;