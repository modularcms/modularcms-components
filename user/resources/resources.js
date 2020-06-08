/**
 * @overview data-based resources of ccm component for user authentication
 * @author André Kless <andre.kless@web.de> 2019-2020
 * @license The MIT License (MIT)
 */

ccm.files[ 'resources.js' ] = {
  "live": {},

  /** test configuration (relative paths) */
  "local": {
    "css": [ "ccm.load",
      "/modularcms-components/user/resources/default.css"
    ],
    "helper.1": "https://ccmjs.github.io/akless-components/modules/helper.mjs",
    "html": [ "ccm.get", "/modularcms-components/user/resources/resources.js", "html" ],
    "routing_sensor": [ "ccm.instance", "/modularcms-components/routing_sensor/versions/ccm.routing_sensor-1.0.0.js" ],
    "alertLogoutSuccessIconSrc": "/modularcms-components/user/resources/img/logout-success.svg",
    "alertLoginFailureIconSrc": "/modularcms-components/user/resources/img/login-failure.svg",
    "alertCloseIconSrc": "/modularcms-components/user/resources/img/close.svg"
  },

  /** HTML templates */
  "html": {
    "logged_in": {
      "id": "logged_in",
      "inner": [
        {
          "id": "avatar",
          "style": "background-image: url('%avatar%');"
        },
        {
          "id": "username",
          "inner": "%user%"
        },
        {
          "id": "logout",
          "onclick": "%click%",
          "inner": [
            {
              "tag": "img",
              "src": "https://modularcms.github.io/modularcms-components/user/resources/img/logout.svg"
            }
          ]
        }
      ]
    },
    "logged_out": {
      "id": "logged_out",
      "class": "well well-sm",
      "inner": {
        "id": "button",
        "class": "btn btn-default btn-xs",
        "inner": [
          {
            "tag": "span",
            "class": "glyphicon glyphicon-log-in"
          },
          "Login"
        ],
        "onclick": "%click%"
      }
    },
    "loginLoader": {
      "id": "loader",
      "class": "lds-ring",
      "inner": [{"inner":[]},{"inner":[]},{"inner":[]},{"inner":[]}]
    },
    "loginAlert": {
      "id": "login-alert",
      "inner": [
        {
          "id": "login-alert-icon",
          "tag": "img",
          "src": "%iconsrc%"
        },
        {
          "id": "login-alert-text",
          "inner": "%text%"
        },
        {
          "id": "login-alert-close",
          "tag": "img",
          "src": "%closesrc%",
          "onclick": "%close%"
        }
      ]
    },
    "login": {
      "id": "login-form",
      "class": "container",
      "inner": [
        {
          "id": "loginbox",
          "class": "mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2",
          "inner": {
            "class": "panel panel-info",
            "inner": [
              {
                "id": "loader-wrapper"
              },
              {
                "id": "login-logo-wrap",
                "inner": [
                  {
                    "tag": "img",
                    "src": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg"
                  }
                ]
              },
              {
                "id": "content",
                "inner": [
                  {
                    "id": "login-alert-wrapper"
                  },
                  {
                    "tag": "h1",
                    "class": "panel-heading",
                    "inner": "%title%"
                  },
                  {
                    "class": "panel-body",
                    "inner": [
                      {
                        "tag": "form",
                        "id": "loginform",
                        "class": "form-horizontal",
                        "role": "form",
                        "onsubmit": "%login%",
                        "inner": [
                          {
                            "tag": "input",
                            "id": "login-username",
                            "type": "text",
                            "class": "form-control",
                            "name": "user",
                            "placeholder": "Username",
                            "value": "%username%",
                            "required": true
                          },
                          {
                            "tag": "input",
                            "id": "login-password",
                            "type": "password",
                            "class": "form-control",
                            "name": "token",
                            "placeholder": "Password",
                            "required": true
                          },
                          {
                            "class": "form-group",
                            "inner": {
                              "class": "col-sm-12 controls",
                              "inner": [
                                {
                                  "tag": "input",
                                  "type": "submit",
                                  "id": "btn-login",
                                  "class": "btn btn-success",
                                  "value": "Login"
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "id": "panel-subline",
                "inner": [
                  {
                    "tag": "span",
                    "inner": "No account yet?&nbsp;"
                  },
                  {
                    "tag": "a",
                    "href": "/register",
                    "inner": "Create an account now"
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    "register": {
      "id": "login-form",
      "class": "container",
      "inner": [
        {
          "id": "loginbox",
          "class": "mainbox col-md-6 col-md-offset-3 col-sm-8 col-sm-offset-2",
          "inner": {
            "class": "panel panel-info",
            "inner": [
              {
                "id": "loader-wrapper"
              },
              {
                "id": "login-logo-wrap",
                "inner": [
                  {
                    "tag": "img",
                    "src": "https://modularcms.github.io/modularcms-components/cms/resources/img/logo.svg"
                  }
                ]
              },
              {
                "id": "content",
                "inner": [
                  {
                    "id": "login-alert-wrapper"
                  },
                  {
                    "tag": "h1",
                    "class": "panel-heading",
                    "inner": "%title%"
                  },
                  {
                    "class": "panel-body",
                    "inner": [
                      {
                        "tag": "form",
                        "id": "loginform",
                        "class": "form-horizontal",
                        "role": "form",
                        "onsubmit": "%login%",
                        "inner": [
                          {
                            "tag": "input",
                            "id": "login-username",
                            "type": "text",
                            "class": "form-control",
                            "name": "user",
                            "placeholder": "Username",
                            "value": "%username%",
                            "required": true
                          },
                          {
                            "tag": "input",
                            "id": "login-email",
                            "type": "email",
                            "class": "form-control",
                            "name": "email",
                            "placeholder": "Email address",
                            "value": "%email%",
                            "required": true
                          },
                          {
                            "tag": "input",
                            "id": "login-password",
                            "type": "password",
                            "class": "form-control",
                            "name": "password",
                            "placeholder": "Password",
                            "required": true,
                            "minlength": 8
                          },
                          {
                            "tag": "input",
                            "id": "login-password-repetition",
                            "type": "password",
                            "class": "form-control",
                            "name": "passwordRepetition",
                            "placeholder": "Password repetition",
                            "required": true,
                            "minlength": 8
                          },
                          {
                            "class": "form-group",
                            "inner": {
                              "class": "col-sm-12 controls",
                              "inner": [
                                {
                                  "tag": "input",
                                  "type": "submit",
                                  "id": "btn-login",
                                  "class": "btn btn-success",
                                  "value": "Register"
                                }
                              ]
                            }
                          }
                        ]
                      }
                    ]
                  }
                ]
              },
              {
                "id": "panel-subline",
                "inner": [
                  {
                    "tag": "span",
                    "inner": "Want to login instead?&nbsp;"
                  },
                  {
                    "tag": "a",
                    "href": "/login",
                    "inner": "Go to login"
                  }
                ]
              }
            ]
          }
        }
      ]
    }
  }

};