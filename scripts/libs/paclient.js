angular.module('paclient', [])
.factory('api', function ($http, $window, $q, $location) {
    var API = '/api';
    		self.parseJwt = function(token) {
			var base64Url = token.split('.')[1];
			var base64 = base64Url.replace('-', '+').replace('_', '/');
			return JSON.parse($window.atob(base64));
		}
		self.isAuthed = function () {
			var token = self.getToken();
			if (token) {
					var params = self.parseJwt(token); 
					 if(Math.round(new Date().getTime()) <= params.exp) {
                         if ( Math.abs(Math.round(new Date().getTime()) - parseInt(params.exp) ) < (7200 * 1000) ) {
                             self.reauth();
                         }
                         return true;
                     } else {
                         //token expired
                         $window.localStorage.clear();
                         return false;
                     }
			} else {
				return false;
			}
		}
		self.getToken = function () {
			return $window.localStorage['token'];
		}
		self.setToken = function (token) {
			$window.localStorage['token'] = token;
		}
        self.setProfile = function (data) {
            $window.localStorage['profile'] = JSON.stringify(data);
        }
        self.getConfig = function () {
             var token = self.getToken();
            if (token) {
                    var config = {};
                    config.headers = {};
                    config.headers.Authorization = 'Bearer ' + token;
                    return config;
            } else {
                return false;
            }
        }
         self.reauth = function() {
            return $q(function (resolve, reject) {
                self.get('/reauth')
                .then(function (res) {
                    if (res.token) {
                        self.setToken(res.token);
                    }
                })
                .catch(function (err) {
                    reject(err);
                })
            })
        }
        self.get = function (url) {
            var config = self.getConfig();
            if (config) {
                    return $http.get(API + url, config);
            } else {
                return false;
            }
        }
        self.post = function (url, data) {
            var config = self.getConfig();
            if (config) {
                return $http.post(API + url, data, config);
            } else {
                return false;
            }
        }
        self.put = function (url, data) {
            var config = self.getConfig();
            if (config) {
                return $http.put(API + url, data, config);
            } else {
                return false;
            }
        }
        self.delete = function(url) {
            var config = self.getConfig();
            if (config) {
                return $http.delete(API + url, config);
            } else {
                return false;
            }
        }
        self.login =   function (user) {
            return $q(function(resolve, reject) {
                $http.post(API + '/auth', {
                username: user.username,
                password: user.password
            })
            .then(function (response) {
                if (response.data.token) {
                    self.setToken(response.data.token);
                    return self.get('/status')
                } else {
                    reject(err);
                }
            })
            .then(function (profile) {
            self.setProfile(profile.data);
                resolve(profile.data);
            })
            .catch(function (err) {
                reject(err);
            })
            })
             
        }
        self.getProfileServer = function () {
            return $q(function (resolve, reject) {
                self.get('/status')
                .then(function (res) {
                    resolve(res.data)
                })
                .catch(function (err) {
                    reject(err);
                })
            })
        }
        self.getVersion = function () {
            return '1.0.0';
        }
        self.getProfile = function () {
                return $q(function (resolve, reject) {
                var profile = $window.localStorage['profile'];
            if (profile) {
                resolve(JSON.parse(profile));
            } else {
                self.getProfileServer().then(function (profile) {
                    self.setProfile(profile);
                    resolve(profile);
                })
                .catch(function (err) {
                    reject(err);
                })
            }
            });
            
        }
        self.updateProfile = function () {
            return $q(function (res, rej) {
                self.getProfileServer().then(function (prof) {
                    self.setProfile(prof);
                    res(prof);
                })
                .catch(function (err) {
                    rej(err);
                })
            })
        }
        self.getAccounts = function () {
            return $q(function (resolve, reject) {
                self.get('/accounts')
                .then(function (accounts) {
                    resolve(accounts.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.getAccount = function (id) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + id)
                .then(function (accounts) {
                    resolve(accounts.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });

        }
          self.getAccountUsers = function (id) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + id + '/users')
                .then(function (accounts) {
                    resolve(accounts.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
            
        }
           self.getChildAccounts = function (id) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + id + '/accounts')
                .then(function (accounts) {
                    resolve(accounts.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
            
        }
        self.getUser = function (id, uid) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + id + '/users/' + uid)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
            
        }
        self.createUser = function (id, user) {
            return $q(function (resolve, reject) {
                self.post('/accounts/' + id + '/users', user)
                .then(function (u) {
                    resolve(u.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.editUser = function (id, userid, user) {
            return $q(function (resolve, reject) {
                self.put('/accounts/' + id + '/users/' + userid, user)
                .then(function (u) {
                    resolve(u.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.deleteUser = function (id, userid) {
            return $q(function (resolve, reject) {
                self.delete('/accounts/' + id + '/users/' + userid)
                .then(function (u) {
                    resolve(u.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
self.getTickets = function (type, page) {
    return $q(function (resolve, reject) {
        self.get('/tickets/' + type + '/' + page)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.getTopupsAcc = function (acc, page) {
    return $q(function (resolve, reject) {
        self.get('/accounts/' + acc + '/topuplog/page/' + page)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.getTicketStats = function () {
     return $q(function (resolve, reject) {
        self.get('/tickets/stats')
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.getTicket = function (id) {
    return $q(function (resolve, reject) {
        self.get('/tickets/' + id)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.updateTicket = function (id, chg) {
    return $q(function (resolve, reject) {
        self.put('/tickets/' + id, chg)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}        
self.updateAccount = function (id, chg) {
            return $q(function (resolve, reject) {
                self.put('/accounts/' + id, chg)
                .then(function (u) {
                    resolve(u.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.deleteAccount = function (id) {
            return $q(function (resolve, reject) {
                self.delete('/accounts/' + id)
                .then(function (accounts) {
                    resolve(accounts.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.createAccount = function (obj) {
            return $q(function (resolve, reject) {
                self.post('/accounts/', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
         self.createChildAccount = function (par, obj) {
            return $q(function (resolve, reject) {
                self.post('/accounts/' + par + '/accounts', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
        self.createCredentialAccount = function (par, obj) {
            return $q(function (resolve, reject) {
                self.post('/accounts/' + par + '/credentials', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
        self.updateCredentialAccount = function (acc, id, chg) {
            return $q(function (resolve, reject) {
                self.put('/accounts/' + acc + '/credentials/' + id, chg)
                .then(function (u) {
                    resolve(u.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
                 self.getCredentialAccount = function (id, apicode) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + id + '/credentials/' + apicode)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.getRates = function () {
            return $q(function (resolve, reject) {
                self.get('/rates/')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
         self.getCredentialsAccount = function (id) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + id + '/credentials/')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.getCredentials = function () {
            return $q(function (resolve, reject) {
                self.get('/credentials/')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
                self.getCredential = function (apicode) {
            return $q(function (resolve, reject) {
                self.get('/credentials/' + apicode)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.updateCredential = function (id, chg) {
            return $q(function (resolve, reject) {
                self.put('/credentials/' + id, chg)
                .then(function (u) {
                    resolve(u.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
         self.deleteCredentialAccount = function (account, id) {
            return $q(function (resolve, reject) {
                self.delete('/accounts/' + account + '/credentials/' + id)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
        self.createCredential = function (obj) {
                return $q(function (resolve, reject) {
                self.post('/credentials/', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
               self.getSettings = function () {
            return $q(function (resolve, reject) {
                self.get('/settings/')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
                self.getSetting = function (apicode) {
            return $q(function (resolve, reject) {
                self.get('/settings/' + apicode)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.updateSetting = function (id, chg) {
            return $q(function (resolve, reject) {
                self.put('/settings/' + id, chg)
                .then(function (u) {
                    resolve(u.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.createSetting = function (obj) {
                return $q(function (resolve, reject) {
                self.post('/settings/', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
          self.getRate = function (id) {
            return $q(function (resolve, reject) {
                self.get('/rates/' + id)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.createRate = function (obj) {
                return $q(function (resolve, reject) {
                self.post('/rates/', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
        self.editRate = function (id, chg) {
            return $q(function (resolve, reject) {
                self.put('/rates/' + id, chg)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.deleteRate = function (id) {
            return $q(function (resolve, reject) {
                self.delete('/rates/' + id)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }

 self.getProfitMap = function (acc) {
             return $q(function (resolve, reject) {
                self.get('/accounts/' + acc + '/profitmap')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.getCountries = function () {
               return $q(function (resolve, reject) {
                self.get('/countries')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
            self.getCurrencies = function () {
               return $q(function (resolve, reject) {
                self.get('/currencies')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.createWallet = function (id, chg) {
            return $q(function (resolve, reject) {
                            self.post('/accounts/' + id + '/wallets', chg)
                            .then(function (resp) {
                                resolve(resp.data);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                        });
        }
             self.getWallet = function (acc, id) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + acc + '/wallets/' + id)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
                     self.getWallets = function (acc) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + acc + '/wallets/')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.updateWallet = function (acc, id, chg) {
            return $q(function (resolve, reject) {
                            self.put('/accounts/' + acc + '/wallets/' + id, chg)
                            .then(function (resp) {
                                resolve(resp.data);
                            })
                            .catch(function (err) {
                                reject(err);
                            });
                        });
        }
        self.getTopupsFilter = function (filter, page) {
    return $q(function (resolve, reject) {
        self.post('/topuplog/page/' + page, filter)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.getTransactionsFiltered = function (filter, page) {
    return $q(function (resolve, reject) {
        self.post('/transactions/' + page, filter)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

        self.getAcl = function (acc) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + acc + '/acl')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.updateAcl = function (id, chg) {
            return $q(function (resolve, reject) {
        self.put('/accounts/' + id + '/acl', chg)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
        }
                self.createAcl = function (id, chg) {
            return $q(function (resolve, reject) {
        self.post('/accounts/' + id + '/acl', chg)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
        }
        self.getProfitMap = function (acc) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + acc + '/profitmap')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.updateProfitMap = function (id, chg) {
            return $q(function (resolve, reject) {
        self.put('/accounts/' + id + '/profitmap', chg)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
        }
               self.getOperators = function (iso) {
               return $q(function (resolve, reject) {
                self.get('/countries/' + iso)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
self.getTransactions = function (account, page) {
            return $q(function (resolve, reject) {
                self.get('/accounts/' + account + '/transactions/page/' + page)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.getPinBatchList = function () {
            return $q(function (resolve, reject) {
                self.get('/pins')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
self.getTransactionsAll = function (page) {
    return $q(function (resolve, reject) {
        self.get('/transactions/' + page)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
                self.getUsers = function () {
             return $q(function (resolve, reject) {
                self.get('/users')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
self.getTopups = function (page) {
    return $q(function (resolve, reject) {
        self.get('/topuplog/' + page)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.getMappings = function (page) {
    return $q(function (resolve, reject) {
        self.get('/provmap/' + page)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
          self.getTopup = function (id) {
            return $q(function (resolve, reject) {
                self.get('/topuplog/item/' + id)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
self.getMapping = function (id) {
    return $q(function (resolve, reject) {
        self.get('/provmap/entry/' + id)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
        self.editMapping = function (id, chg) {
            return $q(function (resolve, reject) {
                self.put('/provmap/entry/' + id, chg)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
                self.newMapping = function (chg) {
            return $q(function (resolve, reject) {
                self.post('/provmap/entry/', chg)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.deleteMapping = function (id) {
    return $q(function (resolve, reject) {
        self.delete('/provmap/entry/' + id)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.updateWithdrawal = function (id, chg) {
    return $q(function (resolve, reject) {
        self.put('/withdrawals/' + id, chg)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.createBatch = function (obj) {
    return $q(function (resolve, reject) {
                self.post('/pins', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
}
self.invalidatePin = function (batch, pin) {
    return $q(function (resolve, reject) {
        self.get('/pins/' + batch + '/' + pin + '/invalidate')
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.invalidateBatch = function (batch) {
    return $q(function (resolve, reject) {
        self.get('/pins/' + batch + '/invalidate')
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}
self.getPins = function (id) {
    return $q(function (resolve, reject) {
        self.get('/pins/' + id)
            .then(function (resp) {
                resolve(resp.data);
            })
            .catch(function (err) {
                reject(err);
            });
    });
}

        self.getProviders = function () {
            return $q(function (resolve, reject) {
                self.get('/providers')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }

        self.getParent = function (id) {
             return $q(function (resolve, reject) {
                self.get('/accounts/' + id + '/parent/')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.createInvoice = function (id, obj) {
            return $q(function (resolve, reject) {
                self.post('/accounts/' + id + '/credit/invoices/', obj)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
        self.editInvoice = function (account, id, chg) {
            return $q(function (resolve, reject) {
                self.put('/accounts/' + account + '/credit/invoices/' + id, chg)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.deleteInvoice = function (account, id) {
            return $q(function (resolve, reject) {
                self.delete('/accounts/' + account + '/credit/invoices/' + id)
                    .then(function (a) {
                        resolve(a.data);
                    })
                    .catch(function (err) {
                        reject(err);
                    });
            });
        }
            self.topupAcc = function (account, chg) {
            return $q(function (resolve, reject) {
                self.post('/accounts/' + account + '/topup', chg)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }

        self.getDashboard = function () {
             return $q(function (resolve, reject) {
                self.get('/dashboard/')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.accountGetAll = function () {
                return $q(function (resolve, reject) {
                self.get('/accounts/all')
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.pinSearch = function (chg) {
            return $q(function (resolve, reject) {
                self.post('/pins/search', chg)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }
        self.getPin = function (pin) {
                return $q(function (resolve, reject) {
                self.get('/pin/' + pin)
                .then(function (resp) {
                    resolve(resp.data);
                })
                .catch(function (err) {
                    reject(err);
                });
            });
        }

    return self;
});
