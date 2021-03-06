/**
 * @overview ccm component that handles all data between the interface and the ccm store api
 * @author Felix Bröhl <broehl@everoo.io> 2020
 * @license The MIT License (MIT)
 */

( () => {

    const component = {

        name: 'data_controller',

        version: [1,0,0],

        ccm: 'https://ccmjs.github.io/ccm/versions/ccm-25.5.3.min.js',

        config: {
            "helper": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/versions/helper-5.1.0.mjs" ],
            "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
            "domains_websites_mapping": ["ccm.store", { "name": "fbroeh2s_domains_websites_mapping", "url": "https://ccm2.inf.h-brs.de" } ],
            "websites": ["ccm.store", { "name": "fbroeh2s_websites", "url": "https://ccm2.inf.h-brs.de" } ],
            "users": ["ccm.store", { "name": "fbroeh2s_users", "url": "https://ccm2.inf.h-brs.de" } ]
        },

        Instance: function () {
            let $;

            this.ready = async () => {
                $ = Object.assign( {}, this.ccm.helper, this.helper );                 // set shortcut to help functions
            };

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
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + key + '_users', url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for the corresponding user websites mapping table
             * @param {string} username     The username
             * @returns {Promise<Credential>}
             */
            this.getUserWebsitesDataStore = async (username) => {
                let re = await this.ccm.store({name: 'fbroeh2s_user_' + this.hash.md5(username) + '_websites', url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for the corresponding website theme table
             * @param {string} key  The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteThemesDataStore = async (key) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + key + '_themes', url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for the corresponding website theme definition table
             * @param {string} websiteKey   The website key
             * @param {string} themeKey     The layout key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteThemeDefinitionsDataStore = async (websiteKey, themeKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_theme_' + themeKey + '_definitions', url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for the corresponding website pages table
             * @param {string} websiteKey   The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsitePagesDataStore = async (websiteKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_pages', url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for the corresponding website page childrens table
             * @param {string} websiteKey   The website key
             * @param {string} pageKey      The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsitePageChildrenDataStore = async (websiteKey, pageKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_page_' + pageKey + '_children', url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for the corresponding website page url mapping table
             * @param {string}  websiteKey  The website key
             * @param {boolean} live        Use the live or draft datastore
             * @returns {Promise<Credential>}
             */
            this.getWebsitePageUrlMappingDataStore = async (websiteKey, live = false) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_pages_url_mapping' + (live?'_live':''), url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for website apps
             * @param {string}  websiteKey  The website key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteAppsDataStore = async (websiteKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_apps', url: 'https://ccm2.inf.h-brs.de', parent: this});
                return re;
            }

            /**
             * Returns the data store for the corresponding website page url mapping table
             * @param {string} username     The username
             * @returns {Promise<Credential>}
             */
            this.getUserLocalDataStore = async (username) => {
                let re = await this.ccm.store({name: 'localDb_' + this.hash.md5(username), parent: this});
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
                if (storeGet != null) {
                    let re = storeGet.ignore;
                    re.websiteKey = key;
                    return re;
                }
                return null;
            };

            /**
             * Returns the website object to an website domain
             * @param {string} domain   the website domain
             * @returns {Promise<{}>}
             */
            this.getWebsiteFromDomain = async (domain) => {
                let storeGet = await this.domains_websites_mapping.get(this.hash.md5(domain));
                if (storeGet != null) {
                    let re = this.getWebsite(storeGet.ignore);
                    return re;
                }
                return null;
            };

            /**
             * Returns the permissions object for a website
             * @param {string|null} key  the website key
             * @returns {Promise<{}>}
             */
            this.getWebsitePermissions = async (key = false) => {
                let allowedEditUsers = [];
                if (key != false) {
                    let admins = await this.getWebsiteAdminUsernames(key);
                    allowedEditUsers = admins;
                }
                const username = await this.getCurrentWorkingUsername();
                if (allowedEditUsers.indexOf(username) < 0) {
                    allowedEditUsers.push(username);
                }
                return {
                    creator: username,
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
                const username = await this.getCurrentWorkingUsername();

                // Check if domain is not already existing
                let websiteMappingBefore = await this.domains_websites_mapping.get(this.hash.md5(domain));
                if (websiteMappingBefore == null) {
                    // Add website
                    const websiteKey = await this.websites.set({
                        ignore: {
                            domain: domain,
                            baseUrl: baseUrl
                        },
                        _: await this.getWebsitePermissions()
                    });

                    // Add domain mapping
                    await this.domains_websites_mapping.set({
                        key: this.hash.md5(domain),
                        ignore: websiteKey,
                        _: await this.getWebsitePermissions()
                    });

                    // Add user to website
                    await this.addUserToWebsite(websiteKey, username, 'admin');

                    // Get "cabrare" default theme
                    const themeImportObject = await this.ccm.load({url: 'https://modularcms.github.io/modularcms-cabrare-theme/theme.json', method: 'GET'});

                    const getObject = (object, type = null) => new Promise((resolve, reject) => {
                        if (
                            ((type == null && object.type) || object.type === type)
                            && object.name !== undefined && typeof object.name == 'string'
                            && object.ccmComponent !== undefined && typeof object.ccmComponent == 'object'
                            && object.ccmComponent.url !== undefined && typeof object.ccmComponent.url == 'string'
                            && object.ccmComponent.config !== undefined && typeof object.ccmComponent.config == 'object'
                            && object.ccmBuilder !== undefined && typeof object.ccmBuilder == 'object'
                            && object.ccmBuilder.url !== undefined && (object.ccmBuilder.url == null || typeof object.ccmBuilder.url == 'string')
                            && object.ccmBuilder.config !== undefined && typeof object.ccmBuilder.config == 'object'
                        ) {
                            const re = {
                                name: object.name,
                                ccmComponent: object.ccmComponent,
                                ccmBuilder: object.ccmBuilder
                            };
                            if (type != 'theme') {
                                re.type = object.type;
                            }
                            resolve(re);
                        } else {
                            reject();
                        }
                    });

                    // Create standard theme
                    const standardTheme = await getObject(themeImportObject, 'theme');
                    const themeKey = await this.createTheme(websiteKey, standardTheme);

                    // Create standard theme definitions
                    let plainLayoutDefinitionKey = null;
                    let rowWithColumnsLayoutDefinitionKey = null;
                    for (let themeDefinition of themeImportObject.themeDefinitions) {
                        const definition = await getObject(themeDefinition);
                        const definitionKey = await this.createThemeDefinition(websiteKey, themeKey, definition);
                        if (definition.name == 'Plain') {
                            plainLayoutDefinitionKey = definitionKey;
                        }
                        if (definition.name == 'Row with columns') {
                            rowWithColumnsLayoutDefinitionKey = definitionKey;
                        }
                    }

                    // Create start page
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
                        themeConfig: {},
                        contentZones: {
                            'layout': [
                                {
                                    'type': 'themeDefinition',
                                    'data': {
                                        'themeDefinitionType': 'layout',
                                        'themeDefinitionKey': plainLayoutDefinitionKey,
                                        'ignore': {
                                            'config': {}
                                        }
                                    },
                                    contentZones: {
                                        'main': [
                                            {
                                                'type': 'themeDefinition',
                                                'data': {
                                                    'themeDefinitionType': 'block',
                                                    'themeDefinitionKey': rowWithColumnsLayoutDefinitionKey,
                                                    'ignore': {
                                                        'config': {}
                                                    }
                                                },
                                                contentZones: {
                                                    'column1': [
                                                        {
                                                            'type': 'header',
                                                            'data': {
                                                                'text': 'Hello world!',
                                                                'level': 1
                                                            },
                                                            contentZones: {}
                                                        },
                                                        {
                                                            'type': 'paragraph',
                                                            'data': {
                                                                'text': 'This is a new website made with <b>modularcms</b>.'
                                                            },
                                                            contentZones: {}
                                                        }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            ]
                        },
                        changeLog: []
                    };
                    const pageKey = await this.createPage(websiteKey, startPage);

                    // Publish page
                    await this.publishPage(websiteKey, pageKey, 'Initial start page commit');

                    resolve(websiteKey);
                } else {
                    reject();
                }
            });

            /**
             * Sets the website object for a website key
             * @param {string}  key             The website key
             * @param {{}}      websiteObject   The website object
             * @returns {Promise<void>}
             */
            this.setWebsiteObject = (key, websiteObject) => new Promise(async (resolve, reject) => {
                let websiteBefore = await this.getWebsite(key);

                // Check if new domain is already existing
                if (websiteBefore.domain != websiteObject.domain) {
                    const mappingGet = await this.domains_websites_mapping.get(this.hash.md5(websiteObject.domain));
                    if (mappingGet != null) {
                        reject();
                        return;
                    }
                }

                websiteObject['websiteKey'] !== undefined && delete websiteObject['websiteKey'];
                await this.websites.set({
                    key: key,
                    ignore: websiteObject,
                    _: await this.getWebsitePermissions(key)
                });

                // Set domain mapping
                if (websiteBefore.domain != websiteObject.domain) {
                    await this.domains_websites_mapping.del(this.hash.md5(websiteBefore.domain));
                    await this.domains_websites_mapping.set({
                        key: this.hash.md5(websiteObject.domain),
                        ignore: key,
                        _: await this.getWebsitePermissions()
                    });
                }

                resolve();
            });

            /**
             * Returns the belonging website users
             * @param {string}  key     The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteUsers = async (key) => {
                const websiteUsersDataStore = await this.getWebsiteUsersDataStore(key);
                const usersGet = await websiteUsersDataStore.get();
                let re = [];
                for (let userGet of usersGet) {
                    let user = userGet.ignore;
                    re.push(user);
                }
                return re;
            };

            /**
             * Returns the belonging website user
             * @param {string}  key         The website key
             * @param {string}  username    The username
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteUser = async (key, username) => {
                const websiteUsersDataStore = await this.getWebsiteUsersDataStore(key);
                const userGet = await websiteUsersDataStore.get(this.hash.md5(username));
                return userGet.ignore;
            };

            /**
             * Returns the website usernames
             * @param   {string}    key     The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteMemberUsernames = async (key) => {
                const websiteUsers = await this.getWebsiteUsers(key);
                let re = [];
                for (let user of websiteUsers) {
                    re.push(user.username);
                }
                return re;
            }

            /**
             * Returns the website author and higher usernames
             * @param   {string}    key     The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteAuthorUsernames = async (key) => {
                const websiteUsers = await this.getWebsiteUsers(key);
                let re = [];
                const filterRoles = ['author', 'editor', 'admin'];
                for (let user of websiteUsers) {
                    if (filterRoles.indexOf(user.role) >= 0) {
                        re.push(user.username);
                    }
                }
                return re;
            }

            /**
             * Returns the website editor and higher usernames
             * @param   {string}    key     The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteEditorUsernames = async (key) => {
                const websiteUsers = await this.getWebsiteUsers(key);
                let re = [];
                const filterRoles = ['editor', 'admin'];
                for (let user of websiteUsers) {
                    if (filterRoles.indexOf(user.role) >= 0) {
                        re.push(user.username);
                    }
                }
                return re;
            }

            /**
             * Returns the website administrator usernames
             * @param   {string}    key     The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getWebsiteAdminUsernames = async (key) => {
                const websiteUsers = await this.getWebsiteUsers(key);
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
                let website = await this.getWebsite(key);
                await this.websites.del(key);
                await this.domains_websites_mapping.del(this.hash.md5(website.domain));

                // Remove all data from user_<username>_websites
                const websiteUsersDataStore = await this.getWebsiteUsersDataStore(key);
                const websiteUsersDataStoreData = await websiteUsersDataStore.get();
                for (let entry of websiteUsersDataStoreData) {
                    websiteUsersDataStore.del(entry.key);

                    const userWebsitesDataStore = await this.getUserWebsitesDataStore(entry.ignore.username);
                    userWebsitesDataStore.del(key);
                }
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
                let storeGet = await this.users.get(this.hash.md5(username));
                if (storeGet != null) {
                    let re = storeGet.ignore;
                    return re;
                }
                return null;
            };

            /**
             * Returns the permissions object for a user
             * @returns {Promise<{}>}
             */
            this.getUserPermissions = async () => {
                const username = await this.getCurrentWorkingUsername();
                return {
                    creator: username,
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
                const userData = await this.users.get(this.hash.md5(username));
                if (userData == null) {
                    // Add user
                    await this.users.set({
                        key: this.hash.md5(username),
                        ignore: {
                            username: username,
                            image: null
                        },
                        _: await this.getUserPermissions()
                    });
                    resolve();
                } else {
                    reject();
                }
            });

            /**
             * Returns the belonging websites to a user
             * @param {string}  username    The username
             * @returns {Promise<Array<{}>>}
             */
            this.getUserWebsites = async (username) => {
                const userWebsitesDataStore = await this.getUserWebsitesDataStore(username);
                const websitesGet = await userWebsitesDataStore.get();
                let promises = [];
                for (let websiteGet of websitesGet) {
                    promises.push(new Promise(async (resolve, reject) => {
                        let website = await this.getWebsite(websiteGet.key);
                        website.role = websiteGet.ignore.role;
                        resolve(website);
                    }));
                }
                const re = await Promise.all(promises);
                return re;
            };

            /**
             * Returns the belonging websites to a user with the user role admin
             * @param {string}  key The username
             * @returns {Promise<Array<{}>>}
             */
            this.getUserAdminWebsites = async (username) => {
                const re = await this.getUserWebsites(username);
                return re.filter((website) => website.role == 'admin');
            };

            /**
             * Returns the role of a belonging website of a user
             * @param {string}  username    The username
             * @param {string}  websiteKey  The website key
             * @returns {Promise<Array<{}>>}
             */
            this.getUserWebsiteRole = async (username, websiteKey) => {
                const userWebsitesDataStore = await this.getUserWebsitesDataStore(username);
                const websiteGet = await userWebsitesDataStore.get(websiteKey);
                if (websiteGet != null) {
                    return websiteGet.ignore.role;
                }
                return null;
            };

            /**
             * Sets the user object for a username
             * @param {string} username     The username
             * @param {{}} userObject   The user object
             * @returns {Promise<void>}
             */
            this.setUserObject = async (username, userObject) => {
                userObject['username'] = username;
                await this.users.set({
                    key: this.hash.md5(username),
                    ignore: userObject,
                    _: await this.getUserPermissions()
                });
            };

            /**
             * Removes a user
             * @param {string} username The username
             * @returns {Promise<void>}
             */
            this.removeUser = async (username) => {
                await this.users.del(this.hash.md5(username));

                //Remove all data from user_<username>_websites
                const userWebsitesDataStore = await this.getUserWebsitesDataStore(username);
                const userWebsitesDataStoreData = userWebsitesDataStore.get();
                for (let entry of userWebsitesDataStoreData) {
                    userWebsitesDataStore.del(entry.key);

                    const websiteUsersDataStore = await this.getWebsiteUsersDataStore(entry.key);
                    websiteUsersDataStore.del(this.hash.md5(username));
                }
            };

            /**
             * Returns the permissions object for a user website mapping
             * @param   {string}    key     The website key
             * @returns {Promise<{}>}
             */
            this.getUserWebsiteMappingPermissions = async (key) => {
                let admins = await this.getWebsiteAdminUsernames(key);
                let allowedEditUsers = admins;

                const username = await this.getCurrentWorkingUsername();
                if (admins.indexOf(username) < 0) {
                    allowedEditUsers.push(username);
                }

                return {
                    creator: username,
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
             * @param {string} role         The given user role
             * @returns {Promise<void>}
             */
            this.addUserToWebsite = async (websiteKey, username, role) => new Promise(async (resolve, reject) => {
                const user = await this.getUserFromUsername(username);

                if (user != null) {
                    // Add entry to user_<username>_websites
                    const userWebsitesDataStore = await this.getUserWebsitesDataStore(username)
                    userWebsitesDataStore.set({
                        key: websiteKey,
                        ignore: {
                            username: username,
                            role: role
                        },
                        _: await this.getUserWebsiteMappingPermissions(websiteKey)
                    });

                    // Add entry to website_<websiteKey>_users
                    const websitesUserDataStore = await this.getWebsiteUsersDataStore(websiteKey)
                    websitesUserDataStore.set({
                        key: this.hash.md5(username),
                        ignore: {
                            username: username,
                            role: role
                        },
                        _: await this.getUserWebsiteMappingPermissions(websiteKey)
                    });

                    // Update permissions for all other objects
                    await this.updateUserPermissions(websiteKey);

                    resolve();
                } else {
                    reject();
                }
            });

            /**
             * Removes a user from the own website
             * @param {string} websiteKey   The website key
             * @param {string} username     The username
             * @returns {Promise<void>}
             */
            this.removeUserFromWebsite = async (websiteKey, username) => {
                // Add entry to user_<username>_websites
                const userWebsitesDataStore = await this.getUserWebsitesDataStore(username)
                userWebsitesDataStore.del(websiteKey);

                // Add entry to website_<websiteKey>_users
                const websitesUserDataStore = await this.getWebsiteUsersDataStore(websiteKey)
                websitesUserDataStore.del(this.hash.md5(username));

                // Update permissions for all other objects
                await this.updateUserPermissions(websiteKey);
            };

            /**
             * Update all website objects to fit the user permissions
             * @param {string} websiteKey   The website key
             * @returns {Promise<void>}
             */
            this.updateUserPermissions = async (websiteKey) => {
                // Update website object
                const website = await this.getWebsite(websiteKey);
                await this.setWebsiteObject(websiteKey, website);

                // Update themes
                const themes = await this.getAllThemesOfWebsite(websiteKey);
                for (let theme of themes) {
                    // Update theme
                    await this.setThemeObject(websiteKey, theme.themeKey, theme);

                    // Update theme definitions
                    const definitions = await this.getAllThemeDefinitionsOfTheme(websiteKey, theme.themeKey);
                    for (let definition of definitions) {
                        await this.setThemeDefinitionObject(websiteKey, theme.themeKey, definition.themeDefinitionKey, layout);
                    }
                }

                // Update Pages
                const pages = await this.getAllPagesOfWebsite(websiteKey);
                for (let page of pages.filter(item => !/_live$/.test(item.pageKey))) {
                    let pageCopy = {};
                    Object.assign(pageCopy, page)
                    delete pageCopy['pageKey'];
                    await this.setPageObject(websiteKey, page.pageKey, pageCopy, false);

                    // Update page url mapping
                    const pageUrl = await this.getFullPageUrl(websiteKey, page.pageKey);
                    if (pageUrl != null) {
                        const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey);
                        const mapping = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));
                        mapping._ =  await this.getPagePermissions(websiteKey);
                        await websitePageUrlMappingDataStore.set(mapping);
                    }
                }

                // Update published pages without publishing the current draft
                for (let page of pages.filter(item => /_live$/.test(item.pageKey))) {
                    const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                    let pageCopy = {};
                    Object.assign(pageCopy, page)
                    delete pageCopy['pageKey'];

                    await websitePagesDataStore.set({
                        key: page.pageKey, // already with _live
                        ignore: pageCopy,
                        _: await this.getPagePublishPermissions(websiteKey)
                    });

                    // Update page url mapping
                    const pageUrl = await this.getFullPageUrl(websiteKey, page.pageKey);
                    if (pageUrl != null) {
                        const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey, true);
                        const mapping = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));
                        mapping._ =  await this.getPagePublishPermissions(websiteKey);
                        await websitePageUrlMappingDataStore.set(mapping);
                    }
                }
            };

            /**
             * Sets a new user role
             * @param {string} websiteKey   The website key
             * @param {string} username     The username
             * @param {string} role         The given user role
             * @returns {Promise<void>}
             */
            this.setUserPermission = async (websiteKey, username, role) => {
                await this.addUserToWebsite(websiteKey, username, role);
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
                const websiteThemesDataStore = await this.getWebsiteThemesDataStore(websiteKey);
                let themeGet = await websiteThemesDataStore.get(themeKey);
                let theme = themeGet.ignore;
                theme.themeKey = themeGet.key;
                return theme;
            }

            /**
             * Get all themes of a website
             * @param {string}  websiteKey  The website key
             * @returns {Promise<{}>}
             */
            this.getAllThemesOfWebsite = async (websiteKey) => {
                const websiteThemesDataStore = await this.getWebsiteThemesDataStore(websiteKey);
                let themesGet = await websiteThemesDataStore.get();
                let re = [];
                for (let themeGet of themesGet) {
                    let theme = themeGet.ignore;
                    theme.themeKey = themeGet.key;
                    re.push(theme);
                }
                return re;
            }

            /**
             * Returns the permissions object for a theme
             * @param {string|null} key  the website key
             * @returns {Promise<{}>}
             */
            this.getThemePermissions = async (key = false) => {
                let allowedEditUsers = [];
                if (key != false) {
                    let admins = await this.getWebsiteAdminUsernames(key);
                    allowedEditUsers = admins;
                }
                const username = await this.getCurrentWorkingUsername();
                if (allowedEditUsers.indexOf(username) < 0) {
                    allowedEditUsers.push(username);
                }
                return {
                    creator: username,
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
             * Creates a theme for a website
             * @param {string}  websiteKey  The website key
             * @param {{}}      themeObject The theme object
             * @returns {Promise<string>}
             */
            this.createTheme = async (websiteKey, themeObject) => {
                const websiteThemesDataStore = await this.getWebsiteThemesDataStore(websiteKey);
                let themeKey = await websiteThemesDataStore.set({
                    ignore: themeObject,
                    _: await this.getThemePermissions(websiteKey)
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
                const websiteThemesDataStore = await this.getWebsiteThemesDataStore(websiteKey);
                themeObject['themeKey'] !== undefined && delete themeObject['themeKey'];
                await websiteThemesDataStore.set({
                    key: themeKey,
                    ignore: themeObject,
                    _: await this.getThemePermissions(websiteKey)
                });
            }

            /**
             * Removes a theme
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @returns {Promise<void>}
             */
            this.removeTheme = async (websiteKey, themeKey) => {
                const websiteThemesDataStore = await this.getWebsiteThemesDataStore(websiteKey);
                await websiteThemesDataStore.del(themeKey);
            }


            /**
             * -----------------------------------
             *  T H E M E   D E F I N I T I O N S
             * -----------------------------------
             */

            /**
             * Get theme definition of website theme
             * @param {string}  websiteKey      The website key
             * @param {string}  themeKey        The theme key
             * @param {string}  definitionKey   The theme definition key
             * @returns {Promise<{}>}
             */
            this.getThemeDefinition = async (websiteKey, themeKey, definitionKey) => {
                const websiteThemeDefinitionsDataStore = await this.getWebsiteThemeDefinitionsDataStore(websiteKey, themeKey);
                let definitionGet = await websiteThemeDefinitionsDataStore.get(definitionKey);
                if (definitionGet != null) {
                    let definition = definitionGet.ignore;
                    definition.themeDefinitionKey = definitionGet.key;
                    return definition;
                }
                return null;
            }

            /**
             * Get all theme definitions of a website theme
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @returns {Promise<{}>}
             */
            this.getAllThemeDefinitionsOfTheme = async (websiteKey, themeKey) => {
                const websiteThemeLayoutsDataStore = await this.getWebsiteThemeDefinitionsDataStore(websiteKey, themeKey);
                let definitionsGet = await websiteThemeLayoutsDataStore.get();
                let re = [];
                for (let definitionGet of definitionsGet) {
                    let definition = definitionGet.ignore;
                    definition.themeDefinitionKey = definitionGet.key;
                    re.push(definition);
                }
                return re;
            }

            /**
             * Returns the permissions object for a theme definition
             * @param {string|null} key  the website key
             * @returns {Promise<{}>}
             */
            this.getThemeDefinitionPermissions = async (key = false) => {
                let allowedEditUsers = [];
                if (key != false) {
                    let admins = await this.getWebsiteAdminUsernames(key);
                    allowedEditUsers = admins;
                }
                const username = await this.getCurrentWorkingUsername();
                if (allowedEditUsers.indexOf(username) < 0) {
                    allowedEditUsers.push(username);
                }
                return {
                    creator: username,
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
             * Creates a theme definition for a website theme
             * @param {string}  websiteKey          The website key
             * @param {string}  themeKey            The website theme key
             * @param {{}}      definitionObject    The theme definition object
             * @returns {Promise<string>}
             */
            this.createThemeDefinition = async (websiteKey, themeKey, definitionObject) => {
                const websiteThemeDefinitionsDataStore = await this.getWebsiteThemeDefinitionsDataStore(websiteKey, themeKey);
                let definitionKey = await websiteThemeDefinitionsDataStore.set({
                    ignore: definitionObject,
                    _: await this.getThemeDefinitionPermissions(websiteKey)
                });
                return definitionKey;
            }

            /**
             * Sets the theme definition object for a website theme
             * @param {string}  websiteKey          The website key
             * @param {string}  themeKey            The theme key
             * @param {string}  definitionKey       The theme definition key
             * @param {{}}      definitionObject    The theme definition object
             * @returns {Promise<void>}
             */
            this.setThemeDefinitionObject = async (websiteKey, themeKey, definitionKey, definitionObject) => {
                const websiteThemeDefinitionsDataStore = await this.getWebsiteThemeDefinitionsDataStore(websiteKey, themeKey);
                definitionObject['themeDefinitionKey'] !== undefined && delete definitionObject['themeDefinitionKey'];
                await websiteThemeDefinitionsDataStore.set({
                    key: definitionKey,
                    ignore: definitionObject,
                    _: await this.getThemeDefinitionPermissions(websiteKey)
                });
            }

            /**
             * removes a theme definition from a website theme
             * @param {string}  websiteKey      The website key
             * @param {string}  themeKey        The theme key
             * @param {string}  definitionKey   The theme definition key
             * @returns {Promise<void>}
             */
            this.removeThemeDefinition = async (websiteKey, themeKey, definitionKey) => {
                const websiteThemeDefinitionsDataStore = await this.getWebsiteThemeDefinitionsDataStore(websiteKey, themeKey);
                await websiteThemeDefinitionsDataStore.del(definitionKey);
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
                const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                const pageGet = await websitePagesDataStore.get(pageKey);
                if (pageGet != null) {
                    let page = pageGet.ignore;
                    page.pageKey = pageGet.key;
                    page._ = pageGet._;
                    page.updated_at = pageGet.updated_at;
                    page.created_at = pageGet.created_at;
                    return page;
                }
                return null;
            }

            /**
             * Get page by page url
             * @param {string}  websiteKey  The website key
             * @param {string}  pageUrl     The page url
             * @param {boolean} live        Specifies if the page mapping should be grabbed from the live data store
             * @returns {Promise<any>}
             */
            this.getPageByUrl = async (websiteKey, pageUrl, live = false) => {
                const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey, live);
                const pageUrlMappingGet = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));
                if (pageUrlMappingGet != null) {
                    const pageKey = pageUrlMappingGet.ignore;
                    const page = this.getPage(websiteKey, pageKey);
                    return page;
                }
                return null;
            }

            /**
             * Get complete page url of website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @returns {Promise<string>}
             */
            this.getFullPageUrl = async (websiteKey, pageKey) => {
                const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);

                // Build url the tree up
                let url = '';
                let currentPageKey = pageKey;
                do {
                    let page = await this.getPage(websiteKey, currentPageKey);
                    if (page == null) {
                        return null;
                    }
                    url = (page.urlPart == '/' ? '' : page.urlPart) + url;
                    currentPageKey = page.parentKey;
                } while(currentPageKey != null)

                return (url == ''?'/':url);
            }

            /**
             * Get page children of website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @returns {Promise<any>}
             */
            this.getPageChildren = async (websiteKey, pageKey) => {
                const websitePageChildrenDataStore = await this.getWebsitePageChildrenDataStore(websiteKey, pageKey);
                let childrenGet = await websitePageChildrenDataStore.get();
                let promises = [];
                for (let childGet of childrenGet) {
                    promises.push(this.getPage(websiteKey, childGet.key));
                }
                const re = await Promise.all(promises);
                return re.filter(item => item != null);
            }

            /**
             * Get all pages of a website
             * @param {string}  websiteKey  The website key
             * @returns {Promise<{}>}
             */
            this.getAllPagesOfWebsite = async (websiteKey) => {
                const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                let pagesGet = await websitePagesDataStore.get();
                let re = [];
                for (let pageGet of pagesGet) {
                    let page = pageGet.ignore;
                    page.pageKey = pageGet.key;
                    re.push(page);
                }
                return re;
            }

            /**
             * Returns the permissions object for a page
             * @param {string|null} key  the website key
             * @returns {Promise<{}>}
             */
            this.getPagePermissions = async (key = false) => {
                let allowedEditUsers = [];
                if (key != false) {
                    let users = await this.getWebsiteEditorUsernames(key);
                    allowedEditUsers = users;
                }
                const username = await this.getCurrentWorkingUsername();
                if (allowedEditUsers.indexOf(username) < 0) {
                    allowedEditUsers.push(username);
                }
                let allowedGetUsers = [];
                if (key != false) {
                    let users = await this.getWebsiteMemberUsernames(key);
                    allowedGetUsers = users;
                }
                return {
                    creator: username,
                    realm: 'modularcms',
                    group: {
                        editUserGroup: allowedEditUsers,
                        getUserGroup: allowedGetUsers
                    },
                    access: {
                        get: 'getUserGroup',
                        set: 'editUserGroup',
                        del: 'editUserGroup'
                    }
                }
            };

            /**
             * Returns the permissions object for a page publish
             * @param {string|null} key  the website key
             * @returns {Promise<{}>}
             */
            this.getPagePublishPermissions = async (key = false) => {
                let allowedEditUsers = [];
                if (key != false) {
                    let users = await this.getWebsiteEditorUsernames(key);
                    allowedEditUsers = users;
                }
                const username = await this.getCurrentWorkingUsername();
                if (allowedEditUsers.indexOf(username) < 0) {
                    allowedEditUsers.push(username);
                }
                return {
                    creator: username,
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
             * Creates a page for a website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @param {{}}      pageObject  The page object
             * @returns {Promise<string>}
             */
            this.createPage = async (websiteKey, pageObject) => new Promise(async (resolve, reject) => {
                const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey);
                let pageUrl = '/';
                if (pageObject.parentKey != null) {
                    const parentPageUrl = await this.getFullPageUrl(websiteKey, pageObject.parentKey);
                    pageUrl = (parentPageUrl == '/' ? '' : parentPageUrl) + pageObject.urlPart;
                }

                const mappingGet = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));

                if (mappingGet == null) {
                    const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                    let pageKey = await websitePagesDataStore.set({
                        ignore: pageObject,
                        _: await this.getPagePermissions(websiteKey)
                    });

                    // Create link in parent children table
                    if (pageObject.parentKey !== undefined && pageObject.parentKey != null) {
                        const websitePageChildrenDataStore = await this.getWebsitePageChildrenDataStore(websiteKey, pageObject.parentKey);
                        await websitePageChildrenDataStore.set({
                            key: pageKey,
                            ignore: null,
                            _: await this.getPagePermissions(websiteKey)
                        });
                    }

                    // Set page url mapping
                    await websitePageUrlMappingDataStore.set({
                        key: this.hash.md5(pageUrl),
                        ignore: pageKey,
                        _: await this.getPagePermissions(websiteKey)
                    });

                    resolve(pageKey);
                } else {
                    reject();
                }
            });

            /**
             * Sets the page object for a website
             * @param {string}          websiteKey      The website key
             * @param {string}          pageKey         The page key
             * @param {{}}              pageObject      The layout object
             * @param {string|false}    commitMessage   The commit message
             * @returns {Promise<void>}
             */
            this.setPageObject = (websiteKey, pageKey, pageObject, commitMessage = false) => new Promise(async (resolve, reject) => {
                const username = await this.getCurrentWorkingUsername();
                const user = await this.getWebsiteUser(websiteKey, username);

                const pageBefore = await this.getPage(websiteKey, pageKey);
                const pageUrlBefore = await this.getFullPageUrl(websiteKey, pageKey);

                if (user.role != 'member' || (user.role == 'member' && pageBefore._.creator == username)) {

                    const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey);
                    let pageUrl = '/';
                    if (pageObject.parentKey != null) {
                        const parentPageUrl = await this.getFullPageUrl(websiteKey, pageObject.parentKey);
                        pageUrl = (parentPageUrl == '/' ? '' : parentPageUrl) + pageObject.urlPart;
                    }

                    // Check if page url is already existing
                    if (pageUrl != pageUrlBefore) {
                        const mappingGet = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));
                        if (mappingGet != null) {
                            reject('Specified page url is already existing');
                            return;
                        }
                    }

                    pageObject['pageKey'] !== undefined && delete pageObject['pageKey'];
                    pageObject['_'] !== undefined && delete pageObject['_'];
                    pageObject['updated_at'] !== undefined && delete pageObject['updated_at'];
                    pageObject['created_at'] !== undefined && delete pageObject['created_at'];
                    if (commitMessage !== false) {
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
                    const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                    await websitePagesDataStore.set({
                        key: pageKey,
                        ignore: pageObject,
                        _: await this.getPagePermissions(websiteKey)
                    });

                    // Create/update link in parent children table
                    const websitePageChildrenDataStore = await this.getWebsitePageChildrenDataStore(websiteKey, pageBefore.parentKey);
                    if (pageBefore.parentKey !== undefined) {
                        await websitePageChildrenDataStore.del(pageKey);
                    }
                    if (pageObject.parentKey !== undefined) {
                        await websitePageChildrenDataStore.set({
                            key: pageKey,
                            ignore: null,
                            _: await this.getPagePermissions(websiteKey)
                        });
                    }

                    // Set/update page url mapping
                    if (pageUrlBefore != pageUrl) {
                        await websitePageUrlMappingDataStore.del(this.hash.md5(pageUrlBefore));
                    }
                    await websitePageUrlMappingDataStore.set({
                        key: this.hash.md5(pageUrl),
                        ignore: pageKey,
                        _: await this.getPagePermissions(websiteKey)
                    });
                    resolve();
                } else {
                    reject('You\'re not allowed to save this page');
                }
            });

            /**
             * Publishs the page for a website
             * @param {string}          websiteKey      The website key
             * @param {string}          pageKey         The page key
             * @param {string|false}    username        The editing username
             * @param {string|false}    commitMessage   The commit message
             * @returns {Promise<void>}
             */
            this.publishPage = (websiteKey, pageKey, commitMessage = false) => new Promise(async (resolve, reject) => {
                const username = await this.getCurrentWorkingUsername();
                const user = await this.getWebsiteUser(websiteKey, username);
                const publishedPageBefore = this.getPage(websiteKey, pageKey + '_live');
                const pageUrlBefore = await this.getFullPageUrl(websiteKey, pageKey + '_live');
                const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                let page = await this.getPage(websiteKey, pageKey);

                if ((user.role != 'member' && user.role != 'author') || (user.role == 'author' && page._.creator == username)) {

                    // Update parent key to live parent key
                    if (page.parentKey) {
                        page.parentKey += '_live';
                    }

                    // Check if published page parent is published
                    if (page.parentKey) {
                        const publishedParentPage = await this.getPage(websiteKey, page.parentKey);
                        if (!publishedParentPage) {
                            reject('The page can only be published if the parent page was published');
                            return;
                        }
                    }

                    if (commitMessage !== false) {
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
                        ignore: page,
                        _: await this.getPagePublishPermissions(websiteKey)
                    });

                    // Create/update link in parent children table
                    const websitePageChildrenDataStore = await this.getWebsitePageChildrenDataStore(websiteKey, publishedPageBefore.parentKey);
                    if (publishedPageBefore != null && publishedPageBefore.parentKey) {
                        await websitePageChildrenDataStore.del(publishedPageBefore.parentKey);
                    }
                    if (page.parentKey) {
                        const websitePageChildrenDataStore = await this.getWebsitePageChildrenDataStore(websiteKey, page.parentKey);
                        await websitePageChildrenDataStore.set({
                            key: pageKey + '_live',
                            ignore: null,
                            _: await this.getPagePublishPermissions(websiteKey)
                        });
                    }

                    // Set/update page url mapping
                    const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey, true);
                    const pageUrl = await this.getFullPageUrl(websiteKey, pageKey);
                    if (pageUrlBefore != pageUrl) {
                        await websitePageUrlMappingDataStore.del(this.hash.md5(pageUrlBefore));
                    }
                    await websitePageUrlMappingDataStore.set({
                        key: this.hash.md5(pageUrl),
                        ignore: pageKey + '_live',
                        _: await this.getPagePublishPermissions(websiteKey)
                    });
                    resolve();
                } else {
                    reject('You\'re not allowed to publish this page');
                }
            });

            /**
             * removes a page from a website
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @returns {Promise<void>}
             */
            this.removePage = async (websiteKey, pageKey) => {
                const page = await this.getPage(websiteKey, pageKey);
                const pageUrl = await this.getFullPageUrl(websiteKey, pageKey);

                const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                await websitePagesDataStore.del(pageKey);

                // Try to delete live version
                await websitePagesDataStore.del(pageKey + '_live');

                // Delete link in parent children table
                if (page.parentKey !== undefined && page.parentKey != null) {
                    const websitePageChildrenDataStore = await this.getWebsitePageChildrenDataStore(websiteKey, page.parentKey);
                    await websitePageChildrenDataStore.del(pageKey);
                }

                // Delete url mapping
                const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey);
                const websitePageUrlMappingLiveDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey, true);
                await Promise.all([
                    websitePageUrlMappingDataStore.del(this.hash.md5(pageUrl)),
                    websitePageUrlMappingLiveDataStore.del(this.hash.md5(pageUrl))
                ]);
            }

            /**
             * Returns if an page live version is equal to the cms version
             * @param {string}  websiteKey  The website key
             * @param {string}  pageKey     The page key
             * @returns {Promise<boolean>}
             */
            this.isPagePublishedVersionEqual = async (websiteKey, pageKey) => {
                const page = await this.getPage(websiteKey, pageKey);
                if (page != null) {
                    page.changeLog !== undefined && delete page['changeLog'];
                    page._ !== undefined && delete page['_'];
                    page.created_at !== undefined && delete page['created_at'];
                    page.updated_at !== undefined && delete page['updated_at'];
                    page.pageKey !== undefined && delete page['pageKey'];
                }
                const pageHash = page == null || this.hash.md5(JSON.stringify(page));

                const publishedPage = await this.getPage(websiteKey, pageKey + '_live');
                if (publishedPage != null) {
                    publishedPage.changeLog !== undefined && delete publishedPage['changeLog'];
                    publishedPage._ !== undefined && delete publishedPage['_'];
                    publishedPage.created_at !== undefined && delete publishedPage['created_at'];
                    publishedPage.updated_at !== undefined && delete publishedPage['updated_at'];
                    publishedPage.pageKey !== undefined && delete publishedPage['pageKey'];
                    if (publishedPage.parentKey != null) {
                        publishedPage.parentKey = publishedPage.parentKey.replace('_live', '');
                    }
                }
                const publishedPageHash = publishedPage == null || this.hash.md5(JSON.stringify(publishedPage));

                return pageHash == publishedPageHash;
            };


            /**
             * ---------
             *  A P P S
             * ---------
             */

            /**
             * Creates an new app from an app demo
             * @param websiteKey
             * @param path
             * @param demoApp
             * @param appMeta
             * @returns {Promise<[string, {name: string, url: string}, *]>}
             */
            this.createWebsiteAppFromDemo = async (websiteKey, path, demoApp, appMeta) => {
                let dataset = await $.dataset(await $.action(demoApp[2]));
                return await this.createWebsiteApp(websiteKey, path, dataset, appMeta);
            }

            /**
             * Creates an app with empty configuration
             * @param websiteKey
             * @param path
             * @param appMeta
             * @returns {Promise<[string, {name: string, url: string}, *]>}
             */
            this.createWebsiteAppEmpty = async (websiteKey, path, appMeta) => {
                let dataset = await $.dataset( {} );
                return await this.createWebsiteApp(websiteKey, path, dataset, appMeta);
            }

            /**
             * Creates an website app from an dataset
             * @param websiteKey
             * @param path
             * @param dataset
             * @param appMeta
             * @returns {Promise<(string|{name: string, url: string}|*)[]>}
             */
            this.createWebsiteApp = async (websiteKey, path, dataset, appMeta) => {
                let store = await this.getWebsiteAppsDataStore(websiteKey);
                delete dataset.key;
                dataset.meta = appMeta;
                dataset._ = { access: { get: 'all', set: 'creator', del: 'creator' } };
                let app_id = await store.set( dataset ); delete dataset.key;

                return ['ccm.get', {url: "https://ccm2.inf.h-brs.de", name: "fbroeh2s_website_" + websiteKey + "_apps"}, app_id];
            }

            /**
             * Returns an website app
             * @param websiteKey
             * @param appKey
             * @returns {Promise<*>}
             */
            this.getWebsiteApp = async (websiteKey, appKey) => {
                let store = await this.getWebsiteAppsDataStore(websiteKey);
                let dataset = await store.get(appKey);
                return dataset;
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
                const localUserDataStore = await this.getUserLocalDataStore(username);
                let websiteKeyGet = await localUserDataStore.get('selectedWebsite');
                if (websiteKeyGet != null) {
                    return websiteKeyGet.ignore;
                }

                let userWebsites = await this.getUserWebsites(username);
                if (userWebsites.length >= 1) {
                    return userWebsites[0].websiteKey;
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
                const localUserDataStore = await this.getUserLocalDataStore(username);
                await localUserDataStore.set({
                    key: 'selectedWebsite',
                    ignore: websiteKey
                });
            }

            /**
             * Removes the selected website key
             * @param {string}  username    The username
             * @returns {Promise<any>}
             */
            this.removeSelectedWebsiteKey = async () => {
                const username = await this.getCurrentWorkingUsername();
                const localUserDataStore = await this.getUserLocalDataStore(username);
                await localUserDataStore.del('selectedWebsite');
            }

            /**
             * Get the current working username
             * @returns {Promise<any>}
             */
            this.getCurrentWorkingUsername = async () => {
                let result = sessionStorage.getItem( 'ccm-user-modularcms' );
                if (result != null) {
                    return JSON.parse(result).user;
                }
                return null;
            }
        }
    };

    let b="ccm."+component.name+(component.version?"-"+component.version.join("."):"")+".js";if(window.ccm&&null===window.ccm.files[b])return window.ccm.files[b]=component;(b=window.ccm&&window.ccm.components[component.name])&&b.ccm&&(component.ccm=b.ccm);"string"===typeof component.ccm&&(component.ccm={url:component.ccm});let c=(component.ccm.url.match(/(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)/)||["latest"])[0];if(window.ccm&&window.ccm[c])window.ccm[c].component(component);else{var a=document.createElement("script");document.head.appendChild(a);component.ccm.integrity&&a.setAttribute("integrity",component.ccm.integrity);component.ccm.crossorigin&&a.setAttribute("crossorigin",component.ccm.crossorigin);a.onload=function(){window.ccm[c].component(component);document.head.removeChild(a)};a.src=component.ccm.url}
} )();