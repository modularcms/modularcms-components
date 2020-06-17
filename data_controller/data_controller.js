/**
 * @overview example ccm component that just renders "Hello, World!"
 * @author André Kless <andre.kless@web.de> 2017-2018
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'data_controller',

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.js',

        config: {
            "domains_websites_mapping": ["ccm.store", { "name": "fbroeh2s_domains_websites_mapping", "url": "https://ccm2.inf.h-brs.de" } ],
            "websites": ["ccm.store", { "name": "fbroeh2s_websites", "url": "https://ccm2.inf.h-brs.de" } ],
            "users": ["ccm.store", { "name": "fbroeh2s_users", "url": "https://ccm2.inf.h-brs.de" } ],
        },

        Instance: function () {
            this.start = async () => {

            };

            /**
             * ---------------------
             *  D A T A S T O R E S
             * ---------------------
             */

            /**
             * Returns the data store for the corresponding website users mapping table
             * @param {string}  key     The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteUsersDataStore = async (key) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + key + '_users'});
                return re;
            }

            /**
             * Returns the data store for the corresponding user websites mapping table
             * @param {string} username     The username
             * @returns {Promise<Credential>}
             */
            this.getUserWebsitesDataStore = async (username) => {
                let re = await this.ccm.store({name: 'fbroeh2s_user_' + username + '_websites'});
                return re;
            }

            /**
             * Returns the data store for the corresponding website users mapping table
             * @param {string} key  The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteThemesDataStore = async (key) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + key + '_themes'});
                return re;
            }


            /**
             * -----------------
             *  W E B S I T E S
             * -----------------
             */

            /**
             * Returns the website object to an website key
             * @param {string} key  The website key
             * @returns {Promise<{}>}
             */
            this.getWebsite = async (key) => {
                let storeGet = await this.websites.get(key);
                let re = storeGet.value;
                re.websiteKey = key;
                return re;
            };

            /**
             * Returns the website object to an website domain
             * @param {string} domain   the website domain
             * @returns {Promise<{}>}
             */
            this.getWebsiteFromDomain = async (domain) => {
                let storeGet = await this.domains_websites_mapping.get(domain);
                let re = this.getWebsiteFromDomain(storeGet.websiteKey);
                return re;
            };

            /**
             * Returns the permissions object for a website
             * @param {string} key  the website key
             * @returns {Promise<{}>}
             */
            this.getWebsitePermissions = async (key) => {
                let admins = this.getWebsiteAdminNames(key);
                let allowedEditUsers = admins;
                allowedEditUsers.push('%user%');
                return {
                    creator: '%user%',
                    realm: 'modularcms',
                    group: allowedEditUsers,
                    access: {
                        get: 'all',
                        set: 'group',
                        del: 'group'
                    }
                }
            };

            /**
             * Creates a new website
             * @param {string} domain   the website domain
             * @param {string} baseUrl  the base url
             * @returns {Promise<string>}
             */
            this.createWebsite = (domain, baseUrl) => new Promise(async (resolve, reject) => {
                // Check if domain is not already existing
                this.domains_websites_mapping.get(domain).then(() => {
                    reject();
                }).catch(async () => {
                    // Add website
                    let websiteKey = await this.websites.set({
                        value: {
                            domain: domain,
                            baseUrl: baseUrl
                        },
                        "_": await this.getWebsitePermissions()
                    });

                    // Add domain mapping
                    await this.domains_websites_mapping.set({
                        key: domain,
                        value: {
                            domain: domain,
                            baseUrl: baseUrl
                        },
                        "_": await this.getWebsitePermissions()
                    });

                    // TODO Add user to website


                    // TODO Add standard theme


                    // TODO Add standard layouts


                    // TODO Add startpage


                    resolve();
                });
            });

            /**
             * Sets the website object for a website key
             * @param {string} key              The website key
             * @param {{}} websiteObject    The website object
             * @returns {Promise<void>}
             */
            this.setWebsiteObject = async (key, websiteObject) => {
                websiteObject['websiteKey'] !== undefined && delete websiteObject['websiteKey'];
                await this.websites.set({
                    key: key,
                    value: websiteObject,
                    "_": await this.getWebsitePermissions(key)
                });
            };

            /**
             * Returns the belonging website users
             * @param {string}  key The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteUsers = async (key) => {
                const websiteUsersDataStore = this.getWebsiteUsersDataStore(key);
                const usersGet = await websiteUsersDataStore.get();
                let re = [];
                for (let userGet of usersGet) {
                    let user = userGet.value;
                    user.userKey = userGet.key;
                    re.push(user);
                }
                return re;
            };

            /**
             * Returns the website administrator names
             * @param   {string}    key     The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteAdminNames = async (key) => {
                const websiteUsers = this.getWebsiteUsers(key);
                let re = [];
                for (let user of websiteUsers) {
                    if (user.role == 'admin') {
                        re.push(user.username);
                    }
                }
                return re;
            }

            /**
             * Removes an website
             * @param {string} key The website key
             * @returns {Promise<void>}
             */
            this.removeWebsite = async (key) => {
                let website = this.getWebsite(key);
                await this.websites.del(key);
                await this.domains_websites_mapping.del(website.domain);

                // Remove all data from user_<username>_websites
                const websiteUsersDataStore = this.getWebsiteUsersDataStore(key);
                const websiteUsersDataStoreData = websiteUsersDataStore.get();
                for (let entry of websiteUsersDataStoreData) {
                    websiteUsersDataStore.del(entry.key);

                    const userWebsitesDataStore = this.getUserWebsitesDataStore(entry.key);
                    userWebsitesDataStore.del(key);
                }

                // TODO remove themes
                // TODO remove layouts
            };


            /**
             * -----------
             *  U S E R S
             * -----------
             */

            /**
             * Returns the user object to an username
             * @param {string} username The username
             * @returns {Promise<{}>}
             */
            this.getUserFromUsername = async (username) => {
                let storeGet = await this.users.get(username);
                let re = storeGet.value;
                re.username = username;
                return re;
            };

            /**
             * Returns the permissions object for a user
             * @returns {Promise<{}>}
             */
            this.getUserPermissions = async () => {
                return {
                    creator: '%user%',
                    realm: 'modularcms',
                    access: {
                        get: 'all',
                        set: 'creator',
                        del: 'creator'
                    }
                }
            };

            /**
             * Creates a new user
             * @param {string} username The username
             * @returns {Promise<string>}
             */
            this.createUser = (username) => new Promise(async (resolve, reject) => {
                // Check if domain is not already existing
                this.users.get(username).then(() => {
                    reject();
                }).catch(async () => {
                    // Add website
                    let websiteKey = await this.users.set({
                        key: username,
                        value: {
                            image: null
                        },
                        "_": await this.getUserPermissions()
                    });
                    resolve();
                });
            });

            /**
             * Returns the belonging websites to a user
             * @param {string}  key The username
             * @returns {Promise<Array<{}>>}
             */
            this.getUserWebsites = async (username) => {
                const userWebsitesDataStore = this.getUserWebsitesDataStore(username);
                const websitesGet = await userWebsitesDataStore.get();
                let re = [];
                for (let websiteGet of websitesGet) {
                    let website = websiteGet.value;
                    website.websiteKey = websiteGet.key;
                    re.push(website);
                }
                return re;
            };

            /**
             * Sets the user object for a username
             * @param {string} username     The username
             * @param {{}} userObject   The user object
             * @returns {Promise<void>}
             */
            this.setUserObject = async (username, userObject) => {
                userObject['username'] !== undefined && delete userObject['username'];
                await this.users.set({
                    key: username,
                    value: userObject,
                    "_": await this.getUserPermissions()
                });
            };

            /**
             * Removes a user
             * @param {string} username The username
             * @returns {Promise<void>}
             */
            this.removeUser = async (username) => {
                await this.users.del(username);

                //Remove all data from user_<username>_websites
                const userWebsitesDataStore = this.getUserWebsitesDataStore(username);
                const userWebsitesDataStoreData = userWebsitesDataStore.get();
                for (let entry of userWebsitesDataStoreData) {
                    userWebsitesDataStore.del(entry.key);

                    const websiteUsersDataStore = this.getWebsiteUsersDataStore(entry.key);
                    websiteUsersDataStore.del(username);
                }
            };

            /**
             * Returns the permissions object for a user website mapping
             * @param   {string}    key     The website key
             * @returns {Promise<{}>}
             */
            this.getUserWebsiteMappingPermissions = async (key) => {
                let admins = this.getWebsiteAdminNames(key);
                let allowedEditUsers = admins;
                allowedEditUsers.push('%user%');
                return {
                    creator: '%user%',
                    realm: 'modularcms',
                    group: allowedEditUsers,
                    access: {
                        get: 'all',
                        set: 'group',
                        del: 'group'
                    }
                }
            };

            /**
             * Add another user to own website
             * @param {string} websiteKey   The website key
             * @param {string} username     The username
             * @param {string} role         The given user rolen
             * @returns {Promise<void>}
             */
            this.addUserToWebsite = async (websiteKey, username, role) => {
                // Add entry to user_<username>_websites
                const userWebsitesDataStore = this.getUserWebsitesDataStore(username)
                userWebsitesDataStore.set({
                    key: websiteKey,
                    value: {
                        role: role
                    },
                    "_": await this.getUserWebsiteMappingPermissions(websiteKey)
                });

                // Add entry to website_<websiteKey>_users
                const websitesUserDataStore = this.getWebsiteUsersDataStore(websiteKey)
                websitesUserDataStore.set({
                    key: username,
                    value: {
                        role: role
                    },
                    "_": await this.getUserWebsiteMappingPermissions(websiteKey)
                });

                // Update website permissions if user should be a new admin
                if (role == 'admin') {
                    let website = await this.getWebsite(websiteKey);
                    await this.setWebsiteObject(websiteKey, website);
                }
            };


            /**
             * -------------
             *  T H E M E S
             * -------------
             */

            /**
             * Get theme of website
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @returns {Promise<{}>}
             */
            this.getThemeOfWebsite = async (websiteKey, themeKey) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                let themeGet = await websiteThemesDataStore.get(themeKey);
                let theme = themeGet.value;
                theme.themeKey = themeGet.key;
                return theme;
            }

            /**
             * Creates a theme for a website
             * @param {string}  websiteKey  The website key
             * @param {{}}      themeObject The theme object
             * @returns {Promise<string>}
             */
            this.createThemeForWebsite = async (websiteKey, themeObject) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                let themeKey = await websiteThemesDataStore.set({
                    value: themeObject
                });
                return themeKey;
            }

            /**
             * Creates a theme for a website
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @returns {Promise<void>}
             */
            this.removeThemeForWebsite = async (websiteKey, themeKey) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                await websiteThemesDataStore.del(themeKey);
            }



            /**
             * ---------------
             *  L A Y O U T S
             * ---------------
             */




            /**
             * ------------
             *  P A G E S
             * ------------
             */
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();