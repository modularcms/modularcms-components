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
            "hash": [ "ccm.load", "https://ccmjs.github.io/akless-components/modules/md5.mjs" ],
            "domains_websites_mapping": ["ccm.store", { "name": "fbroeh2s_domains_websites_mapping", "url": "https://ccm2.inf.h-brs.de" } ],
            "websites": ["ccm.store", { "name": "fbroeh2s_websites", "url": "https://ccm2.inf.h-brs.de" } ],
            "users": ["ccm.store", { "name": "fbroeh2s_users", "url": "https://ccm2.inf.h-brs.de" } ]
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
             * Returns the data store for the corresponding website theme layout table
             * @param {string} websiteKey   The website key
             * @param {string} themeKey     The layout key
             * @returns {Promise<Credential>}
             */
            this.getWebsiteThemeLayoutDataStore = async (websiteKey, themeKey) => {
                let re = await this.ccm.store({name: 'fbroeh2s_website_' + websiteKey + '_theme_' + themeKey, url: 'https://ccm2.inf.h-brs.de', parent: this});
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
                    let re = storeGet.value;
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
                let re = this.getWebsiteFromDomain(storeGet.value);
                return re;
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
                        value: {
                            domain: domain,
                            baseUrl: baseUrl
                        },
                        _: await this.getWebsitePermissions()
                    });

                    // Add domain mapping
                    await this.domains_websites_mapping.set({
                        key: this.hash.md5(domain),
                        value: websiteKey,
                        _: await this.getWebsitePermissions()
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
                    };
                    ; //@TODO set right layout object
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
                                "type": "header",
                                "data": {
                                    "text": "Hello world!",
                                    "level": 1
                                }
                            },
                            {
                                "type": "paragraph",
                                "data": {
                                    "text": "This is a new website made with <b>modularcms</b>."
                                }
                            }
                        ],
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
                    value: websiteObject,
                    _: await this.getWebsitePermissions(key)
                });

                // Set domain mapping
                if (websiteBefore.domain != websiteObject.domain) {
                    await this.domains_websites_mapping.del(this.hash.md5(websiteBefore.domain));
                    await this.domains_websites_mapping.set({
                        key: this.hash.md5(websiteObject.domain),
                        value: key,
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
                    let user = userGet.value;
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
                return userGet.value;
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

                    const userWebsitesDataStore = await this.getUserWebsitesDataStore(entry.value.username);
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
                    let re = storeGet.value;
                    return re;
                }
                return null;
            };

            /**
             * Returns the permissions object for a user
             * @returns {Promise<{}>}
             */
            this.getUserPermissions = async () => {
                return {
                    creator: 'creator',
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
                        value: {
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
                        website.role = websiteGet.value.role;
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
                    return websiteGet.value.role;
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
                    key: this.hash.md5(this.username),
                    value: userObject,
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
                        value: {
                            username: username,
                            role: role
                        },
                        _: await this.getUserWebsiteMappingPermissions(websiteKey)
                    });

                    // Add entry to website_<websiteKey>_users
                    const websitesUserDataStore = await this.getWebsiteUsersDataStore(websiteKey)
                    websitesUserDataStore.set({
                        key: this.hash.md5(username),
                        value: {
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

                    // Update theme layouts
                    const layouts = await this.getAllLayoutsOfTheme(websiteKey, theme.themeKey);
                    for (let layout of layouts) {
                        await this.setLayoutObject(websiteKey, theme.themeKey, layout.layoutKey, layout);
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
                        mapping._ =  await this.getPagePublishPermissions(websiteKey);
                        await websitePageUrlMappingDataStore.set(mapping);
                    }
                }

                // Update published pages without publishing the current draft
                for (let page of pages.filter(item => /_live$/.test(item.pageKey))) {
                    // TODO Update page publish
                    const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                    let pageCopy = {};
                    Object.assign(pageCopy, page)
                    delete pageCopy['pageKey'];

                    await websitePagesDataStore.set({
                        key: page.pageKey, // already with _live
                        value: pageCopy,
                        _: await this.getPagePublishPermissions(websiteKey)
                    });

                    // Update page url mapping
                    const pageUrl = await this.getFullPageUrl(websiteKey, page.pageKey.replace('_live', ''));
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
                const websiteThemesDataStore = await this.getWebsiteThemesDataStore(websiteKey);
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
                    value: themeObject,
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
                    value: themeObject,
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
                const websiteThemeLayoutsDataStore = await this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
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
                const websiteThemeLayoutsDataStore = await this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
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
             * Returns the permissions object for a layout
             * @param {string|null} key  the website key
             * @returns {Promise<{}>}
             */
            this.getLayoutPermissions = async (key = false) => {
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
             * Creates a layout for a website theme
             * @param {string}  websiteKey      The website key
             * @param {string}  themeKey        The website theme key
             * @param {{}}      layoutObject    The layout object
             * @returns {Promise<string>}
             */
            this.createLayout = async (websiteKey, themeKey, layoutObject) => {
                const websiteThemeLayoutsDataStore = await this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                let layoutKey = await websiteThemeLayoutsDataStore.set({
                    value: layoutObject,
                    _: await this.getLayoutPermissions(websiteKey)
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
                const websiteThemeLayoutsDataStore = await this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                layoutObject['layoutKey'] !== undefined && delete layoutObject['layoutKey'];
                await websiteThemeLayoutsDataStore.set({
                    key: layoutKey,
                    value: layoutObject,
                    _: await this.getLayoutPermissions(websiteKey)
                });
            }

            /**
             * removes a layout from a website theme
             * @param {string}  websiteKey  The website key
             * @param {string}  themeKey    The theme key
             * @param {string}  layoutKey   The layout key
             * @returns {Promise<void>}
             */
            this.removeLayout = async (websiteKey, themeKey, layoutKey) => {
                const websiteThemeLayoutsDataStore = await this.getWebsiteThemeLayoutDataStore(websiteKey, themeKey);
                await websiteThemeLayoutsDataStore.del(layoutKey);
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
                    let page = pageGet.value;
                    page.pageKey = pageGet.key;
                    return page;
                }
                return null;
            }

            /**
             * Get page by page url
             * @param {string}  websiteKey  The website key
             * @param {string}  pageUrl     The page url
             * @returns {Promise<any>}
             */
            this.getPageByUrl = async (websiteKey, pageUrl) => {
                const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey);
                const pageUrlMappingGet = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));
                const pageKey = pageUrlMappingGet.value;
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
             * TODO Get page children of website
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
                return re;
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
                    let page = pageGet.value;
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
                    pageUrl = await this.getFullPageUrl(websiteKey, pageObject.parentKey) + pageObject.urlPart;
                }

                const mappingGet = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));

                if (mappingGet == null) {
                    const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                    let pageKey = await websitePagesDataStore.set({
                        value: pageObject,
                        _: await this.getPagePermissions(websiteKey)
                    });

                    // Create link in parent children table
                    if (pageObject.parentKey !== undefined && pageObject.parentKey != null) {
                        const websitePageChildrenDataStore = await this.getWebsitePageChildrenDataStore(websiteKey, pageObject.parentKey);
                        await websitePageChildrenDataStore.set({
                            key: pageKey,
                            value: null,
                            _: await this.getPagePermissions(websiteKey)
                        });
                    }

                    // Set page url mapping
                    await websitePageUrlMappingDataStore.set({
                        key: this.hash.md5(pageUrl),
                        value: pageKey,
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

                const pageBefore = this.getPage(websiteKey, pageKey);
                const pageUrlBefore = await this.getFullPageUrl(websiteKey, pageKey);

                const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey);
                let pageUrl = '/';
                if (pageObject.parentKey != null) {
                    pageUrl = await this.getFullPageUrl(websiteKey, pageObject.parentKey) + pageObject.urlPart;
                }

                // Check if new domain is already existing
                if (pageUrl != pageUrlBefore) {
                    const mappingGet = await websitePageUrlMappingDataStore.get(this.hash.md5(pageUrl));
                    if (mappingGet != null) {
                        reject();
                        return;
                    }
                }

                const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                pageObject['pageKey'] !== undefined && delete pageObject['pageKey'];
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
                await websitePagesDataStore.set({
                    key: pageKey,
                    value: pageObject,
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
                        value: null,
                        _: await this.getPagePermissions(websiteKey)
                    });
                }

                // Set/update page url mapping
                if (pageUrlBefore != pageUrl) {
                    await websitePageUrlMappingDataStore.del(this.hash.md5(pageUrlBefore));
                }
                await websitePageUrlMappingDataStore.set({
                    key: this.hash.md5(pageUrl),
                    value: pageKey,
                    _: await this.getPagePermissions(websiteKey)
                });
                resolve();
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
                const pageUrlBefore = await this.getFullPageUrl(websiteKey, pageKey);
                const websitePagesDataStore = await this.getWebsitePagesDataStore(websiteKey);
                let page = await this.getPage(websiteKey, pageKey);

                if ((user.role != 'member' && user.role != 'author') || (user.role == 'author' && page._.creator == username)) {

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
                        value: page,
                        _: await this.getPagePublishPermissions(websiteKey)
                    });

                    // Set/update page url mapping
                    const websitePageUrlMappingDataStore = await this.getWebsitePageUrlMappingDataStore(websiteKey, true);
                    const pageUrl = await this.getFullPageUrl(websiteKey, pageKey);
                    if (pageUrlBefore != pageUrl) {
                        await websitePageUrlMappingDataStore.del(this.hash.md5(pageUrlBefore));
                    }
                    await websitePageUrlMappingDataStore.set({
                        key: this.hash.md5(pageUrl),
                        value: pageKey,
                        _: await this.getPagePublishPermissions(websiteKey)
                    });
                    resolve();
                } else {
                    reject();
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
                    return websiteKeyGet.value;
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
                    value: websiteKey
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