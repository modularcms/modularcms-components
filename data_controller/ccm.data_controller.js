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
            "localDataStore": ["ccm.store", { "name": "localDb" } ]
        },

        Instance: function () {
            this.start = async () => {

            };

            /**
             * -------------------------------------
             *  D Y N A M I C   D A T A S T O R E S
             * -------------------------------------
             */

            /**
             * Returns the data store for the corresponding website users mapping table
             * @param {string}  key     The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteUsersDataStore = async (key) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + key + '_users', url: 'https://ccm2.inf.h-brs.de'});
                return re;
            }

            /**
             * Returns the data store for the corresponding user websites mapping table
             * @param {string} username     The username
             * @returns {Promise<Credential>}
             */
            this.getUserWebsitesDataStore = async (username) => {
                let re = await this.ccm.store({name: 'fbroeh2s_user_' + username + '_websites', url: 'https://ccm2.inf.h-brs.de'});
                return re;
            }

            /**
             * Returns the data store for the corresponding website theme table
             * @param {string} key  The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteThemesDataStore = async (key) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + key + '_themes', url: 'https://ccm2.inf.h-brs.de'});
                return re;
            }

            /**
             * Returns the data store for the corresponding website theme layout table
             * @param {string} websiteKey   The website key
             * @param {string} themeKey     The layout key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteThemeLayoutDataStore = async (websiteKey, themeKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_theme_' + themeKey, url: 'https://ccm2.inf.h-brs.de'});
                return re;
            }

            /**
             * Returns the data store for the corresponding website pages table
             * @param {string} websiteKey   The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsitePagesDataStore = async (websiteKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_pages', url: 'https://ccm2.inf.h-brs.de'});
                return re;
            }

            /**
             * Returns the data store for the corresponding website page url mapping table
             * @param {string} websiteKey   The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsitePageUrlMappingDataStore = async (websiteKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_pages_url_mapping', url: 'https://ccm2.inf.h-brs.de'});
                return re;
            }

            /**
             * Returns the data store for the corresponding website page url mapping table
             * @param {string} username     The username
             * @returns {Promise<Credential>}
             */
            this.getUserLocalDataStore = async (username) => {
                let re = await this.ccm.store({name: 'localDb_' + username});
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
             * @param {string} username the username of the user that is creating the website
             * @returns {Promise<string>}
             */
            this.createWebsite = (domain, baseUrl, username) => new Promise(async (resolve, reject) => {
                // Check if domain is not already existing
                this.domains_websites_mapping.get(domain).then(() => {
                    reject();
                }).catch(async () => {
                    // Add website
                    const websiteKey = await this.websites.set({
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

                    // Add user to website
                    await this.addUserToWebsite(websiteKey, username, 'admin');

                    // Create standard theme
                    const standardTheme = {
                        name: 'Standard theme',
                        ccmComponent: {
                            url: '', // TODO
                            config: {} // TODO
                        },
                        custom: {
                            htmlUrl: null,
                            cssUrl: null
                        }
                    };
                    const themeKey = await this.createTheme(websiteKey, standardTheme);

                    // TODO Create standard layouts
                    const standardLayout = {
                        name: 'Standard layout 1',
                        ccmComponent: {
                            url: '', // TODO
                            config: {} // TODO
                        },
                        custom: {
                            htmlUrl: null,
                            cssUrl: null
                        }
                    };; //@TODO set right layout object
                    const layoutKey = await this.createLayout(websiteKey, themeKey, standardLayout);

                    // TODO Create start page
                    const startPage = {
                        parentKey: null,
                        title: 'Hello world!',
                        urlPart: '/',
                        meta: {
                            description: '',
                            keywords: '',
                            robots: true
                        },
                        themeKey: themeKey,
                        layoutKey: layoutKey,
                        blocks: [
                            {
                                "type" : "header",
                                "data" : {
                                    "text" : "Hello world!",
                                    "level" : 1
                                }
                            },
                            {
                                "type" : "paragraph",
                                "data" : {
                                    "text" : "This is a new website made with <b>modularcms</b>."
                                }
                            }
                        ]
                    };
                    const pageKey = await this.createPage(websiteKey, startPage);

                    // Publish page
                    await this.publishPage(websiteKey, pageKey, username, 'Initial start page commit');

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
            this.getTheme = async (websiteKey, themeKey) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                let themeGet = await websiteThemesDataStore.get(themeKey);
                let theme = themeGet.value;
                theme.themeKey = themeGet.key;
                return theme;
            }

            /**
             * Get all themes of a website
             * @param {string}  websiteKey  The website key
             * @returns {Promise<{}>}
             */
            this.getAllThemesOfWebsite = async (websiteKey) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                let themesGet = await websiteThemesDataStore.get();
                let re = [];
                for (let themeGet of themesGet) {
                    let theme = themeGet.value;
                    theme.themeKey = themeGet.key;
                    re.push(theme);
                }
                return re;
            }

            /**
             * Creates a theme for a website
             * @param {string}  websiteKey  The website key
             * @param {{}}      themeObject The theme object
             * @returns {Promise<string>}
             */
            this.createTheme = async (websiteKey, themeObject) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                let themeKey = await websiteThemesDataStore.set({
                    value: themeObject
                });
                return themeKey;
            }

            /**
             * Sets a theme object
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @param {{}}      themeObject The theme object
             * @returns {Promise<void>}
             */
            this.setThemeObject = async (websiteKey, themeKey, themeObject) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                themeObject['themeKey'] !== undefined && delete themeObject['themeKey'];
                await websiteThemesDataStore.set({
                    key: themeKey,
                    value: themeObject
                });
            }

            /**
             * Removes a theme
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @returns {Promise<void>}
             */
            this.removeTheme = async (websiteKey, themeKey) => {
                const websiteThemesDataStore = this.getWebsiteThemesDataStore(websiteKey);
                await websiteThemesDataStore.del(themeKey);
            }


            /**
             * ---------------
             *  L A Y O U T S
             * ---------------
             */

            /**
             * Get layout of website theme
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @param {string}  layoutKey   The layout key
             * @returns {Promise<{}>}
             */
            this.getLayout = async (websiteKey, themeKey, layoutKey) => {
                const websiteThemeLayoutsDataStore = this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                let layoutGet = await websiteThemeLayoutsDataStore.get(layoutKey);
                let layout = layoutGet.value;
                layout.layoutKey = layoutGet.key;
                return layout;
            }

            /**
             * Get all layouts of a website theme
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @returns {Promise<{}>}
             */
            this.getAllLayoutsOfTheme = async (websiteKey, themeKey) => {
                const websiteThemeLayoutsDataStore = this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                let layoutsGet = await websiteThemeLayoutsDataStore.get();
                let re = [];
                for (let layoutGet of layoutsGet) {
                    let layout = layoutGet.value;
                    layout.layoutKey = layoutGet.key;
                    re.push(layout);
                }
                return re;
            }

            /**
             * Creates a layout for a website theme
             * @param {string}  websiteKey      The website key
             * @param {string}  themeKey        The website theme key
             * @param {{}}      layoutObject    The layout object
             * @returns {Promise<string>}
             */
            this.createLayout = async (websiteKey, themeKey, layoutObject) => {
                const websiteThemeLayoutsDataStore = this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                let layoutKey = await websiteThemeLayoutsDataStore.set({
                    value: layoutObject
                });
                return layoutKey;
            }

            /**
             * Sets the layout object for a website theme
             * @param {string}  websiteKey      The website key
             * @param {string}  themeKey        The theme key
             * @param {string}  layoutKey       The layout key
             * @param {{}}      layoutObject    The layout object
             * @returns {Promise<void>}
             */
            this.setLayoutObject = async (websiteKey, themeKey, layoutKey, layoutObject) => {
                const websiteThemeLayoutsDataStore = this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                layoutObject['layoutKey'] !== undefined && delete layoutObject['layoutKey'];
                await websiteThemeLayoutsDataStore.set({
                    key: layoutKey,
                    value: layoutObject
                });
            }

            /**
             * removes a layout from a website theme
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @returns {Promise<void>}
             */
            this.removeLayout = async (websiteKey, themeKey) => {
                const websiteThemeLayoutsDataStore = this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                await websiteThemeLayoutsDataStore.del(themeKey);
            }


            /**
             * ------------
             *  P A G E S
             * ------------
             */

            /**
             * Get page of website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @returns {Promise<any>}
             */
            this.getPage = async (websiteKey, pageKey) => {
                const websitePagesDataStore = this.getWebsitePagesDataStore(websiteKey);
                let pageGet = await websitePagesDataStore.get(pageKey);
                let page = pageGet.value;
                page.pageKey = pageGet.key;
                return page;
            }

            /**
             * Get page by page url
             * @param {string}  websiteKey  The website key
             * @param {string}  pageUrl     The page url
             * @returns {Promise<any>}
             */
            this.getPageByUrl = async (websiteKey, pageUrl) => {
                const websitePageUrlMappingDataStore = this.getWebsitePageUrlMappingDataStore(websiteKey);
                const pageUrlMappingGet = websitePageUrlMappingDataStore.get(pageUrl);
                const pageKey = pageUrlMappingGet.key;
                const page = this.getPage(websiteKey, pageKey);
                return page;
            }

            /**
             * Get complete page url of website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @returns {Promise<string>}
             */
            this.getFullPageUrl = async (websiteKey, pageKey) => {
                const websitePagesDataStore = this.getWebsitePagesDataStore(websiteKey);

                // Build url the tree up
                let url = '';
                let currentPageKey = pageKey;
                do {
                    let page = await this.getPage(websiteKey, currentPageKey);
                    url = page.urlPart + url;
                    currentPageKey = page.parentKey;
                } while(currentPageKey != null)

                return url;
            }

            /**
             * Get all pages of a website
             * @param {string}  websiteKey  The website key
             * @returns {Promise<{}>}
             */
            this.getAllPagesOfWebsite = async (websiteKey) => {
                const websitePagesDataStore = this.getWebsitePagesDataStore(websiteKey);
                let pagesGet = await websitePagesDataStore.get();
                let re = [];
                for (let pageGet of pagesGet) {
                    let page = pageGet.value;
                    page.pageKey = pageGet.key;
                    re.push(page);
                }
                return re;
            }

            /**
             * Creates a page for a website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @param {{}}      pageObject  The page object
             * @returns {Promise<string>}
             */
            this.createPage = async (websiteKey, pageObject) => {
                const websitePagesDataStore = this.getWebsitePagesDataStore(websiteKey);
                let pageKey = await websitePagesDataStore.set({
                    value: pageObject
                });
                return pageKey;
            }

            /**
             * Sets the page object for a website
             * @param {string}          websiteKey      The website key
             * @param {string}          pageKey         The page key
             * @param {{}}              pageObject      The layout object
             * @param {string|false}    username        The editing username
             * @param {string|false}    commitMessage   The commit message
             * @returns {Promise<void>}
             */
            this.setPageObject = async (websiteKey, pageKey, pageObject, username = false, commitMessage = false) => {
                const websitePagesDataStore = this.getWebsitePagesDataStore(websiteKey);
                pageObject['pageKey'] !== undefined && delete pageObject['pageKey'];
                if (username !== false && commitMessage !== false) {
                    if (pageObject.changeLog === undefined) {
                        pageObject['changeLog'] = [];
                    }
                    pageObject.changeLog.push({
                        timestamp: (new Date()).getTime(),
                        username: username,
                        commitMessage: commitMessage,
                        publish: false
                    });
                }
                await websitePagesDataStore.set({
                    key: pageKey,
                    value: pageObject
                });
            }

            /**
             * Publishs the page for a website
             * @param {string}          websiteKey      The website key
             * @param {string}          pageKey         The page key
             * @param {string|false}    username        The editing username
             * @param {string|false}    commitMessage   The commit message
             * @returns {Promise<void>}
             */
            this.publishPage = async (websiteKey, pageKey, username = false, commitMessage = false) => {
                const websitePagesDataStore = this.getWebsitePagesDataStore(websiteKey);
                let page = this.getPage(websiteKey, pageKey);
                if (username !== false && commitMessage !== false) {
                    if (page.changeLog === undefined) {
                        page['changeLog'] = [];
                    }
                    page.changeLog.push({
                        timestamp: (new Date()).getTime(),
                        username: username,
                        commitMessage: commitMessage,
                        publish: true
                    });
                }
                await websitePagesDataStore.set({
                    key: pageKey + '_live',
                    value: page
                });

                // Set page url mapping
                const websitePageUrlMappingDataStore = this.getWebsitePageUrlMappingDataStore(websiteKey);
                const pageUrl = await this.getFullPageUrl(websiteKey, pageKey);
                await websitePageUrlMappingDataStore.set({
                    key: pageUrl,
                    value: pageKey
                })
            }

            /**
             * removes a page from a website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @returns {Promise<void>}
             */
            this.removePage = async (websiteKey, pageKey) => {
                const websitePagesDataStore = this.getWebsitePagesDataStore(websiteKey);
                await websitePagesDataStore.del(pageKey);

                // Delete live version
                try {
                    await websitePagesDataStore.del(pageKey + '_live');
                } catch(e) {}

                // Delete url mapping
                const websitePageUrlMappingDataStore = this.getWebsitePageUrlMappingDataStore(websiteKey);
                try {
                    const pageUrl = await this.getFullPageUrl(websiteKey, pageKey);
                    websitePageUrlMappingDataStore.del(pageUrl);
                } catch(e) {}
            }


            /**
             * -----------------------------------
             *  L O C A L   E N V I R O N M E N T
             * -----------------------------------
             */

            /**
             * Get selected website key
             * @returns {Promise<any>}
             */
            this.getSelectedWebsiteKey = async () => {
                const username = await this.getCurrentWorkingUsername();
                const localUserDataStore = this.getUserLocalDataStore(username);
                try {
                    let websiteKey = await localUserDataStore.get('selectedWebsite');
                    return websiteKey;
                } catch (e) {
                    try {
                        let userWebsites = this.getUserWebsites(username);
                        if (userWebsites.length >= 1) {
                            return userWebsites[0].websiteKey;
                        }
                    } catch (e) {}
                }
                return null;
            }

            /**
             * Set the selected website key
             * @param {string}  username    The username
             * @returns {Promise<any>}
             */
            this.setSelectedWebsiteKey = async (websiteKey) => {
                const username = await this.getCurrentWorkingUsername();
                const localUserDataStore = this.getUserLocalDataStore(username);
                await localUserDataStore.set({
                    key: 'selectedWebsite',
                    value: websiteKey
                });
            }

            /**
             * Get the current working username
             * @returns {Promise<any>}
             */
            this.getCurrentWorkingUsername = async () => {
                const username = await this.localDataStore.get('username');
                return username;
            }

            /**
             * Set the current working username
             * @param {string}  username    The username
             * @returns {Promise<any>}
             */
            this.setCurrentWorkingUsername = async (username) => {
                await this.localDataStore.set({
                    key: 'username',
                    value: username
                });
            }
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();